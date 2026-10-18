#!/usr/bin/env python3
"""
generate_scenarios.py
Generates 200+ distinct, parameterized 1-hour authentication window scenarios
with ground truth labels (LOW, MEDIUM, HIGH) and realistic attack patterns.
"""

import json
import random
import argparse
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

CLIENT_CATALOG = [
    {"client_id": "client_portal", "client_name": "Web Customer Portal"},
    {"client_id": "client_mobile", "client_name": "Mobile iOS/Android App"},
    {"client_id": "client_admin", "client_name": "Internal Admin Dashboard"},
    {"client_id": "client_api_partner", "client_name": "Partner API Gateway"},
    {"client_id": "client_support", "client_name": "Customer Support Console"}
]

def generate_top_clients(total_success: int) -> List[Dict[str, Any]]:
    if total_success == 0:
        return []
    
    clients = list(CLIENT_CATALOG)
    random.shuffle(clients)
    num_clients = min(len(clients), random.randint(2, 5))
    selected = clients[:num_clients]
    
    # Generate random Dirichlet-like partition
    weights = [random.uniform(0.1, 1.0) for _ in range(num_clients)]
    sum_w = sum(weights)
    
    allocations = []
    allocated_sum = 0
    for i, w in enumerate(weights):
        if i == num_clients - 1:
            count = total_success - allocated_sum
        else:
            count = int(total_success * (w / sum_w))
            allocated_sum += count
        allocations.append(max(0, count))
    
    top_clients = []
    for c, count in zip(selected, allocations):
        top_clients.append({
            "client_id": c["client_id"],
            "client_name": c["client_name"],
            "login_count": count
        })
    
    top_clients.sort(key=lambda x: x["login_count"], reverse=True)
    return top_clients

def build_iso_time(base_time: datetime, offset_minutes: int) -> str:
    return (base_time + timedelta(minutes=offset_minutes)).isoformat()

def generate_low_scenario(idx: int, base_time: datetime) -> Dict[str, Any]:
    subtype = random.choice([
        "standard_business_hours",
        "quiet_off_peak",
        "accidental_typos",
        "high_volume_enterprise"
    ])
    
    attempts = []
    
    if subtype == "standard_business_hours":
        success = random.randint(80, 300)
        num_fails = random.randint(1, 6)
        for i in range(num_fails):
            attempts.append({
                "ip": f"ip_{i+1}",
                "actor": f"actor_{i+1}",
                "fail_count": 1,
                "last_attempt": build_iso_time(base_time, random.randint(1, 55))
            })
        fail = num_fails
        desc = f"Normal business traffic: {success} successful logins with {fail} isolated single-typo failures"
        
    elif subtype == "quiet_off_peak":
        success = random.randint(5, 30)
        num_fails = random.choice([0, 1, 2])
        for i in range(num_fails):
            attempts.append({
                "ip": f"ip_{i+1}",
                "actor": f"actor_{i+1}",
                "fail_count": 1,
                "last_attempt": build_iso_time(base_time, random.randint(1, 55))
            })
        fail = num_fails
        desc = f"Off-peak night traffic: {success} successes, {fail} occasional errors"
        
    elif subtype == "accidental_typos":
        success = random.randint(40, 150)
        # One user mistyped 2-3 times
        attempts.append({
            "ip": "ip_1",
            "actor": "actor_1",
            "fail_count": random.randint(2, 3),
            "last_attempt": build_iso_time(base_time, random.randint(10, 40))
        })
        if random.random() > 0.5:
            attempts.append({
                "ip": "ip_2",
                "actor": "actor_2",
                "fail_count": 1,
                "last_attempt": build_iso_time(base_time, random.randint(5, 50))
            })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Normal traffic with accidental repeated typos: {success} successes, {fail} total fails on 1-2 users"
        
    else:  # high_volume_enterprise
        success = random.randint(600, 1800)
        num_actors = random.randint(6, 12)
        for i in range(num_actors):
            attempts.append({
                "ip": f"ip_{i+1}",
                "actor": f"actor_{i+1}",
                "fail_count": random.randint(1, 2),
                "last_attempt": build_iso_time(base_time, random.randint(1, 58))
            })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"High-volume enterprise traffic ({success} successes) with normal dispersed failure baseline ({fail} fails, <2% error rate)"

    top_clients = generate_top_clients(success)
    return {
        "scenario_id": f"low_{idx:03d}_{subtype}",
        "ground_truth": "LOW",
        "attack_type": "normal_traffic",
        "subtype": subtype,
        "description": desc,
        "payload": {
            "success_count": success,
            "fail_count": fail,
            "top_clients": top_clients,
            "failed_attempts": attempts
        }
    }

def generate_medium_scenario(idx: int, base_time: datetime) -> Dict[str, Any]:
    subtype = random.choice([
        "credential_stuffing_distributed",
        "horizontal_password_spray",
        "abnormal_failure_ratio",
        "persistent_slow_probe"
    ])
    
    attempts = []
    
    if subtype == "credential_stuffing_distributed":
        success = random.randint(30, 90)
        num_targets = random.randint(15, 35)
        # Multiple IPs trying multiple users
        for i in range(num_targets):
            attempts.append({
                "ip": f"ip_{random.randint(1, 10)}",
                "actor": f"actor_{i+1}",
                "fail_count": random.randint(1, 3),
                "last_attempt": build_iso_time(base_time, random.randint(5, 55))
            })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Distributed credential stuffing probe: {num_targets} distinct user accounts targeted across multiple IPs ({fail} total fails)"
        attack_type = "credential_stuffing"
        
    elif subtype == "horizontal_password_spray":
        success = random.randint(40, 120)
        num_targets = random.randint(18, 40)
        attacker_ip = "ip_attacker_spray"
        for i in range(num_targets):
            attempts.append({
                "ip": attacker_ip,
                "actor": f"actor_{i+1}",
                "fail_count": random.randint(1, 2),
                "last_attempt": build_iso_time(base_time, random.randint(1, 55))
            })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Horizontal password spray: Single IP {attacker_ip} systematically probing {num_targets} different users"
        attack_type = "password_spraying"
        
    elif subtype == "abnormal_failure_ratio":
        # Elevated failure ratio compared to successes
        success = random.randint(10, 25)
        fail = random.randint(35, 70)
        num_actors = random.randint(5, 12)
        remaining = fail
        for i in range(num_actors):
            c = remaining // (num_actors - i) + random.randint(-1, 2)
            c = max(1, min(remaining, c))
            attempts.append({
                "ip": f"ip_{random.randint(1, 4)}",
                "actor": f"actor_{i+1}",
                "fail_count": c,
                "last_attempt": build_iso_time(base_time, random.randint(10, 50))
            })
            remaining -= c
            if remaining <= 0:
                break
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Elevated failure anomaly: {fail} fails vs only {success} successes across client applications"
        attack_type = "anomaly_high_failure_rate"
        
    else:  # persistent_slow_probe
        success = random.randint(30, 80)
        # Single IP trying 18-35 passwords on one or two specific accounts
        attempts.append({
            "ip": "ip_slow_probe",
            "actor": "actor_target_admin",
            "fail_count": random.randint(20, 38),
            "last_attempt": build_iso_time(base_time, random.randint(40, 58))
        })
        # plus a couple background typos
        attempts.append({
            "ip": "ip_bg_1",
            "actor": "actor_bg_1",
            "fail_count": 1,
            "last_attempt": build_iso_time(base_time, 20)
        })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Persistent slow brute-force probe: {attempts[0]['fail_count']} failed attempts on actor_target_admin from ip_slow_probe"
        attack_type = "slow_brute_force"

    top_clients = generate_top_clients(success)
    return {
        "scenario_id": f"med_{idx:03d}_{subtype}",
        "ground_truth": "MEDIUM",
        "attack_type": attack_type,
        "subtype": subtype,
        "description": desc,
        "payload": {
            "success_count": success,
            "fail_count": fail,
            "top_clients": top_clients,
            "failed_attempts": attempts
        }
    }

def generate_high_scenario(idx: int, base_time: datetime) -> Dict[str, Any]:
    subtype = random.choice([
        "targeted_rapid_bruteforce",
        "botnet_distributed_bruteforce",
        "volumetric_auth_ddos_flood",
        "aggressive_credential_stuffing_burst"
    ])
    
    attempts = []
    
    if subtype == "targeted_rapid_bruteforce":
        success = random.randint(15, 60)
        target_account = "actor_victim_account"
        brute_fails = random.randint(120, 650)
        # 1 or 2 primary attacking IPs
        attempts.append({
            "ip": "ip_attacker_main",
            "actor": target_account,
            "fail_count": int(brute_fails * 0.85),
            "last_attempt": build_iso_time(base_time, random.randint(45, 59))
        })
        attempts.append({
            "ip": "ip_attacker_secondary",
            "actor": target_account,
            "fail_count": brute_fails - int(brute_fails * 0.85),
            "last_attempt": build_iso_time(base_time, random.randint(40, 58))
        })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"High-velocity targeted brute force: {fail} failed login attempts concentrated on {target_account}"
        attack_type = "brute_force"
        
    elif subtype == "botnet_distributed_bruteforce":
        success = random.randint(20, 80)
        target_accounts = ["actor_admin_root", "actor_finance_lead"]
        num_botnet_ips = random.randint(15, 30)
        total_fails = random.randint(250, 800)
        per_ip = total_fails // num_botnet_ips
        for i in range(num_botnet_ips):
            attempts.append({
                "ip": f"ip_bot_{i+1}",
                "actor": random.choice(target_accounts),
                "fail_count": per_ip + random.randint(-2, 4),
                "last_attempt": build_iso_time(base_time, random.randint(20, 59))
            })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Coordinated botnet brute force: {len(attempts)} bot IPs bombarding privileged accounts with {fail} total attempts"
        attack_type = "botnet_brute_force"
        
    elif subtype == "volumetric_auth_ddos_flood":
        success = random.randint(5, 40)
        fail = random.randint(900, 3500)
        # High volume authentication endpoint flood
        num_sources = random.randint(25, 50)
        per_source = fail // num_sources
        for i in range(num_sources):
            attempts.append({
                "ip": f"ip_ddos_node_{i+1}",
                "actor": f"actor_random_{i+1}",
                "fail_count": per_source + random.randint(-5, 10),
                "last_attempt": build_iso_time(base_time, random.randint(30, 59))
            })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Volumetric authentication DDoS flood: {fail} failures across {num_sources} sources overwhelming authentication"
        attack_type = "auth_ddos_flood"
        
    else:  # aggressive_credential_stuffing_burst
        success = random.randint(20, 70)
        num_accounts = random.randint(45, 90)
        total_fails = random.randint(350, 1100)
        per_acc = total_fails // num_accounts
        for i in range(num_accounts):
            attempts.append({
                "ip": f"ip_stuffing_{random.randint(1, 15)}",
                "actor": f"actor_user_{i+1}",
                "fail_count": per_acc + random.randint(-1, 3),
                "last_attempt": build_iso_time(base_time, random.randint(15, 58))
            })
        fail = sum(a["fail_count"] for a in attempts)
        desc = f"Massive automated credential stuffing burst: {num_accounts} user accounts attacked with {fail} total failures"
        attack_type = "credential_stuffing_burst"

    top_clients = generate_top_clients(success)
    return {
        "scenario_id": f"high_{idx:03d}_{subtype}",
        "ground_truth": "HIGH",
        "attack_type": attack_type,
        "subtype": subtype,
        "description": desc,
        "payload": {
            "success_count": success,
            "fail_count": fail,
            "top_clients": top_clients,
            "failed_attempts": attempts
        }
    }

def main():
    parser = argparse.ArgumentParser(description="Generate benchmark scenarios for Gemini security analysis.")
    parser.add_argument("--count-per-class", type=int, default=70, help="Number of scenarios per threat class (default: 70 -> 210 total)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output", type=str, default="scenarios_benchmark.json", help="Output JSON filepath")
    args = parser.parse_args()

    random.seed(args.seed)
    base_time = datetime(2026, 10, 18, 12, 0, 0, tzinfo=timezone.utc)
    
    scenarios = []
    
    print(f"Generating {args.count_per_class} LOW scenarios...")
    for i in range(1, args.count_per_class + 1):
        scenarios.append(generate_low_scenario(i, base_time))
        
    print(f"Generating {args.count_per_class} MEDIUM scenarios...")
    for i in range(1, args.count_per_class + 1):
        scenarios.append(generate_medium_scenario(i, base_time))
        
    print(f"Generating {args.count_per_class} HIGH scenarios...")
    for i in range(1, args.count_per_class + 1):
        scenarios.append(generate_high_scenario(i, base_time))

    # Shuffle scenarios to prevent sequential bias during testing
    random.shuffle(scenarios)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(scenarios, f, indent=2)

    print(f"\nSuccessfully generated {len(scenarios)} scenarios into {args.output}")
    print(f"Distribution: {args.count_per_class} LOW | {args.count_per_class} MEDIUM | {args.count_per_class} HIGH")

if __name__ == "__main__":
    main()
