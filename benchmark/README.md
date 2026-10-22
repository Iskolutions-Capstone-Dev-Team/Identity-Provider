# Gemini API Security Analysis F1 Benchmark

This suite evaluates the **Multi-Class F1 Score** (`LOW`, `MEDIUM`, `HIGH`) and threat detection capabilities of the Gemini model used in the Identity Provider's security metrics engine ([metrics_service.go](file:///capstone/Identity-Provider/backend/internal/service/metrics_service.go)).

---

## 1. Why `synthetic_test_logs.csv / .json` Were Not Enough
- **No Ground Truth**: Raw audit logs had no assigned threat level labels to compute Precision or Recall.
- **Granularity Difference**: Audit logs record individual events, whereas Gemini evaluates **aggregated 1-hour time windows** (total successes, total fails, top clients, and anonymized failed attempts grouped by IP/actor).
- **Uniform Distribution**: The raw logs had a flat, static distribution (~20 fails/hr across 834 hours) rather than distinct, parameterized attack scenarios.

This benchmark solves this by providing a standardized dataset of **210 labeled 1-hour authentication window scenarios** (70 LOW, 70 MEDIUM, 70 HIGH) covering normal operations, password spraying, credential stuffing, brute-force attacks, and volumetric DDoS floods.

---

## 2. Directory Structure

```
Identity-Provider/benchmark/
├── README.md                 # This documentation
├── requirements.txt          # Python dependencies
├── generate_scenarios.py     # Labeled scenario generator (210 scenarios)
├── scenarios_benchmark.json  # 210 ground-truth labeled scenarios
├── eval_gemini_f1.py         # Evaluation harness with caching and rate limiting
├── gemini_cache.json         # Local response cache to save API quota
└── reports/
    ├── latest_report.md      # Formatted Markdown report with confusion matrix & F1 scores
    └── latest_report.json    # Machine-readable report with per-scenario predictions
```

---

## 3. Quick Start

### A. Regenerate Scenarios (Optional)
To regenerate the 210 ground truth scenarios:
```bash
python3 generate_scenarios.py --count-per-class 70 --seed 42 --output scenarios_benchmark.json
```

### B. Dry Run / Pipeline Test (No API Key Required)
Verify the complete evaluation pipeline and metric calculation without calling the Gemini API:
```bash
python3 eval_gemini_f1.py --mock
```

### C. Live Gemini API Evaluation
Set your Gemini API key in your environment or in `.env`:
```bash
export GEMINI_API_KEY="your-gemini-api-key"
# Optional custom base URL:
# export GEMINI_BASE_URL="https://generativelanguage.googleapis.com"

# Run evaluation with rate-limiting (e.g., 1.5s delay between requests)
python3 eval_gemini_f1.py --model gemini-3.1-flash-lite --delay 1.5
```

### D. Re-evaluate Cached Results (Instant & Free)
Once responses have been fetched and cached in `gemini_cache.json`, you can re-run the benchmark instantly at zero cost:
```bash
python3 eval_gemini_f1.py --cache-only
```

---

## 4. Evaluated Metrics
The benchmark calculates:
- **Per-Class Metrics** (`LOW`, `MEDIUM`, `HIGH`):
  - **Precision**: $\frac{TP}{TP + FP}$
  - **Recall**: $\frac{TP}{TP + FN}$
  - **F1-Score**: $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$
- **Aggregate Metrics**:
  - **Macro Average F1**: Unweighted arithmetic mean across classes.
  - **Weighted Average F1**: Weighted by the support count of each class.
  - **Overall Accuracy**: Micro-averaged agreement across all scenarios.
- **3x3 Confusion Matrix**: Detailed breakdown of true classes vs. model predictions.
