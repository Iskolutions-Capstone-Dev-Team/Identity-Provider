#!/usr/bin/env python3
"""
eval_gemini_f1.py
Evaluates Gemini API security analysis performance against a ground truth benchmark dataset.
Calculates Precision, Recall, Multi-Class F1 Score (Macro, Weighted, Micro), and Confusion Matrix.
Includes local response caching and rate-limiting.
"""

import os
import sys
import json
import time
import hashlib
import argparse
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime

# Attempt to load dotenv if available
try:
    import dotenv
    # Search for .env in parent directories
    dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
    if os.path.exists(dotenv_path):
        dotenv.load_dotenv(dotenv_path)
except ImportError:
    pass

# Check for requests and tabulate
try:
    import requests
except ImportError:
    requests = None

try:
    from tabulate import tabulate
except ImportError:
    tabulate = None

CLASSES = ["LOW", "MEDIUM", "HIGH"]

def compute_prompt(payload: Dict[str, Any]) -> str:
    success = payload["success_count"]
    fail = payload["fail_count"]
    top_clients_json = json.dumps(payload["top_clients"])
    attempts_json = json.dumps(payload["failed_attempts"])
    
    prompt = (
        "Analyze authentication metrics for threats like brute force or DDoS.\n"
        f"Success Logins: {success}\nFailed Logins: {fail}\n"
        f"Top Clients: {top_clients_json}\nFailed Attempts: {attempts_json}"
    )
    return prompt

def get_cache_key(model: str, prompt: str) -> str:
    content = f"{model}::{prompt}".encode("utf-8")
    return hashlib.sha256(content).hexdigest()

def call_gemini_api(
    prompt: str,
    api_key: str,
    base_url: Optional[str] = None,
    model: str = "gemini-3.1-flash-lite",
    max_retries: int = 4,
    retry_delay: float = 3.0
) -> Dict[str, Any]:
    if not requests:
        raise RuntimeError("The 'requests' package is required for live Gemini API calls. Install via pip install requests.")

    endpoint = base_url if base_url else "https://generativelanguage.googleapis.com"
    # Normalize endpoint URL
    if not endpoint.startswith("http"):
        endpoint = "https://" + endpoint
    endpoint = endpoint.rstrip("/")

    url = f"{endpoint}/v1beta/models/{model}:generateContent?key={api_key}"

    headers = {"Content-Type": "application/json"}
    body = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "threat_level": {
                        "type": "STRING",
                        "enum": ["LOW", "MEDIUM", "HIGH"]
                    },
                    "confidence": {"type": "NUMBER"},
                    "anomalies": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    },
                    "advisory": {"type": "STRING"}
                },
                "required": ["threat_level", "confidence", "anomalies", "advisory"]
            }
        }
    }

    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=body, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
            elif resp.status_code == 429:
                wait_time = retry_delay * (2 ** (attempt - 1))
                print(f" [Rate-Limited 429] Retrying in {wait_time:.1f}s (attempt {attempt}/{max_retries})...")
                time.sleep(wait_time)
            else:
                last_err = f"HTTP {resp.status_code}: {resp.text}"
                print(f" [API Error] {last_err}")
                time.sleep(retry_delay)
        except Exception as e:
            last_err = str(e)
            print(f" [Request Exception] {e}")
            time.sleep(retry_delay)

    raise RuntimeError(f"Failed to call Gemini API after {max_retries} attempts: {last_err}")

def heuristic_mock_predict(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback predictor for dry-run/testing when API key is unavailable."""
    fail = payload["fail_count"]
    attempts = payload["failed_attempts"]
    max_actor_fail = max((a["fail_count"] for a in attempts), default=0)
    
    if fail >= 150 or max_actor_fail >= 60:
        return {
            "threat_level": "HIGH",
            "confidence": 0.95,
            "anomalies": ["Critical failure spike / Targeted brute force detected"],
            "advisory": "Trigger emergency IP rate limiting and enforce MFA."
        }
    elif fail >= 25 or max_actor_fail >= 15 or len(attempts) >= 12:
        return {
            "threat_level": "MEDIUM",
            "confidence": 0.85,
            "anomalies": ["Elevated suspicious failure activity / Spray pattern"],
            "advisory": "Monitor client access and verify user alerts."
        }
    else:
        return {
            "threat_level": "LOW",
            "confidence": 0.90,
            "anomalies": [],
            "advisory": "Traffic patterns appear normal."
        }

def calculate_metrics(y_true: List[str], y_pred: List[str]) -> Dict[str, Any]:
    """Calculates confusion matrix, precision, recall, and F1-score."""
    class_to_idx = {c: i for i, c in enumerate(CLASSES)}
    n = len(CLASSES)
    
    # Initialize Confusion Matrix: [row=True, col=Pred]
    cm = [[0 for _ in range(n)] for _ in range(n)]
    
    for t, p in zip(y_true, y_pred):
        if t in class_to_idx and p in class_to_idx:
            cm[class_to_idx[t]][class_to_idx[p]] += 1

    per_class = {}
    total_samples = len(y_true)
    correct_total = 0

    for i, c in enumerate(CLASSES):
        tp = cm[i][i]
        fp = sum(cm[j][i] for j in range(n) if j != i)
        fn = sum(cm[i][j] for j in range(n) if j != i)
        support = sum(cm[i])
        
        correct_total += tp
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        
        per_class[c] = {
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "support": support
        }

    # Macro averages
    macro_precision = sum(m["precision"] for m in per_class.values()) / n
    macro_recall = sum(m["recall"] for m in per_class.values()) / n
    macro_f1 = sum(m["f1_score"] for m in per_class.values()) / n

    # Weighted averages
    if total_samples > 0:
        weighted_precision = sum(m["precision"] * m["support"] for m in per_class.values()) / total_samples
        weighted_recall = sum(m["recall"] * m["support"] for m in per_class.values()) / total_samples
        weighted_f1 = sum(m["f1_score"] * m["support"] for m in per_class.values()) / total_samples
        accuracy = correct_total / total_samples
    else:
        weighted_precision = weighted_recall = weighted_f1 = accuracy = 0.0

    return {
        "confusion_matrix": cm,
        "classes": CLASSES,
        "per_class": per_class,
        "macro_avg": {
            "precision": macro_precision,
            "recall": macro_recall,
            "f1_score": macro_f1
        },
        "weighted_avg": {
            "precision": weighted_precision,
            "recall": weighted_recall,
            "f1_score": weighted_f1
        },
        "accuracy": accuracy,
        "total_samples": total_samples
    }

def print_and_format_report(metrics: Dict[str, Any], model_name: str) -> str:
    cm = metrics["confusion_matrix"]
    per_class = metrics["per_class"]
    macro = metrics["macro_avg"]
    weighted = metrics["weighted_avg"]
    acc = metrics["accuracy"]
    total = metrics["total_samples"]

    lines = []
    lines.append(f"# Gemini Security Analysis F1 Evaluation Report")
    lines.append(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"**Model Evaluated:** `{model_name}`")
    lines.append(f"**Total Evaluated Scenarios:** {total}")
    lines.append(f"**Overall Accuracy:** {acc * 100:.2f}%\n")

    lines.append("## Classification Report")
    clf_headers = ["Class", "Precision", "Recall", "F1-Score", "Support"]
    clf_rows = []
    for c in CLASSES:
        m = per_class[c]
        clf_rows.append([
            f"**{c}**",
            f"{m['precision']:.4f}",
            f"{m['recall']:.4f}",
            f"{m['f1_score']:.4f}",
            str(m['support'])
        ])
    clf_rows.append([
        "**Macro Avg**",
        f"{macro['precision']:.4f}",
        f"{macro['recall']:.4f}",
        f"**{macro['f1_score']:.4f}**",
        str(total)
    ])
    clf_rows.append([
        "**Weighted Avg**",
        f"{weighted['precision']:.4f}",
        f"{weighted['recall']:.4f}",
        f"**{weighted['f1_score']:.4f}**",
        str(total)
    ])

    if tabulate:
        lines.append(tabulate(clf_rows, headers=clf_headers, tablefmt="pipe", disable_numparse=True, colalign=("left", "center", "center", "center", "center")))
    else:
        lines.append("| Class | Precision | Recall | F1-Score | Support |")
        lines.append("| :--- | :---: | :---: | :---: | :---: |")
        for row in clf_rows:
            lines.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} |")
    lines.append("")

    lines.append("## Confusion Matrix")
    cm_headers = ["Actual \\ Predicted", "Pred LOW", "Pred MEDIUM", "Pred HIGH"]
    cm_rows = []
    for i, c in enumerate(CLASSES):
        cm_rows.append([
            f"**Actual {c}**",
            str(cm[i][0]),
            str(cm[i][1]),
            str(cm[i][2])
        ])

    if tabulate:
        lines.append(tabulate(cm_rows, headers=cm_headers, tablefmt="pipe", disable_numparse=True, colalign=("left", "center", "center", "center")))
    else:
        lines.append("| Actual \\ Predicted | Pred LOW | Pred MEDIUM | Pred HIGH |")
        lines.append("| :--- | :---: | :---: | :---: |")
        for row in cm_rows:
            lines.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} |")
    lines.append("")

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Evaluate Gemini API F1 Score for Security Analysis.")
    parser.add_argument("--benchmark", type=str, default="scenarios_benchmark.json", help="Path to scenarios benchmark file")
    parser.add_argument("--cache-file", type=str, default="gemini_cache.json", help="Path to local cache file")
    parser.add_argument("--model", type=str, default="gemini-3.1-flash-lite", help="Gemini model name")
    parser.add_argument("--delay", type=float, default=1.5, help="Seconds to delay between live API requests")
    parser.add_argument("--max-samples", type=int, default=None, help="Limit number of scenarios evaluated")
    parser.add_argument("--cache-only", action="store_true", help="Only evaluate samples already in cache")
    parser.add_argument("--mock", action="store_true", help="Use heuristic mock predictor for pipeline dry run")
    parser.add_argument("--export-dir", type=str, default="reports", help="Directory to save evaluation reports")
    args = parser.parse_args()

    benchmark_path = os.path.abspath(args.benchmark)
    if not os.path.exists(benchmark_path):
        print(f"Error: Benchmark file '{benchmark_path}' not found. Run generate_scenarios.py first.")
        sys.exit(1)

    with open(benchmark_path, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    if args.max_samples:
        scenarios = scenarios[:args.max_samples]

    cache_path = os.path.abspath(args.cache_file)
    cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cache = json.load(f)
            print(f"Loaded {len(cache)} cached responses from {cache_path}")
        except Exception as e:
            print(f"Warning: Failed to load cache: {e}")

    api_key = os.getenv("GEMINI_API_KEY", "")
    base_url = os.getenv("GEMINI_BASE_URL", "")

    if not args.mock and not args.cache_only and not api_key:
        print("Notice: GEMINI_API_KEY environment variable is not set.")
        print("To run live evaluation against Gemini API, set GEMINI_API_KEY.")
        print("Alternatively, you can test with --mock to verify the F1 calculation pipeline.")
        sys.exit(1)

    y_true = []
    y_pred = []
    predictions_record = []
    cache_dirty = False

    print(f"\nStarting benchmark on {len(scenarios)} scenarios using model '{args.model}'...")
    start_time = time.time()

    for idx, sc in enumerate(scenarios, 1):
        sc_id = sc["scenario_id"]
        ground_truth = sc["ground_truth"]
        payload = sc["payload"]
        prompt = compute_prompt(payload)
        key = get_cache_key(args.model, prompt)

        if key in cache:
            result = cache[key]
            source = "CACHE"
        elif args.mock:
            result = heuristic_mock_predict(payload)
            cache[key] = result
            cache_dirty = True
            source = "MOCK"
        elif args.cache_only:
            print(f"[{idx}/{len(scenarios)}] Skipping {sc_id} (not cached and --cache-only active)")
            continue
        else:
            print(f"[{idx}/{len(scenarios)}] Querying Gemini API for {sc_id}...", end="", flush=True)
            result = call_gemini_api(
                prompt=prompt,
                api_key=api_key,
                base_url=base_url,
                model=args.model
            )
            cache[key] = result
            cache_dirty = True
            source = "LIVE API"
            print(" Done.")
            if args.delay > 0:
                time.sleep(args.delay)

        pred_level = result.get("threat_level", "LOW").upper()
        if pred_level not in CLASSES:
            pred_level = "LOW"

        y_true.append(ground_truth)
        y_pred.append(pred_level)

        predictions_record.append({
            "scenario_id": sc_id,
            "ground_truth": ground_truth,
            "predicted": pred_level,
            "source": source,
            "confidence": result.get("confidence", 0.0),
            "anomalies": result.get("anomalies", [])
        })

    if cache_dirty:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
        print(f"Updated cache written to {cache_path}")

    elapsed = time.time() - start_time
    print(f"\nEvaluation completed in {elapsed:.2f}s ({len(y_pred)} evaluated)")

    metrics = calculate_metrics(y_true, y_pred)
    report_md = print_and_format_report(metrics, args.model)
    print("\n" + report_md)

    os.makedirs(args.export_dir, exist_ok=True)
    report_file_md = os.path.join(args.export_dir, "latest_report.md")
    report_file_json = os.path.join(args.export_dir, "latest_report.json")

    with open(report_file_md, "w", encoding="utf-8") as f:
        f.write(report_md)

    export_data = {
        "metadata": {
            "model": args.model,
            "timestamp": datetime.now().isoformat(),
            "elapsed_seconds": elapsed,
            "total_samples": len(y_pred)
        },
        "metrics": metrics,
        "predictions": predictions_record
    }
    with open(report_file_json, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2)

    print(f"Reports successfully saved to:\n  - {report_file_md}\n  - {report_file_json}")

if __name__ == "__main__":
    main()
