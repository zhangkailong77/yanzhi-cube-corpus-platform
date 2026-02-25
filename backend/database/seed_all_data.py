
import requests
import json
import base64
import os

BASE_URL = "http://localhost:8000/api"  # Backend API
RESOURCES_DIR = os.path.abspath(r"e:\Yanzhi_Project\yanzhi-cube-corpus-platform\docs\resource")

def login():
    # Attempt to login to get a token
    url = f"{BASE_URL}/auth/login"
    data = {"username": "18250636865", "password": "123456"}
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            token = response.json()["data"]["access_token"]
            print("✅ Login successful.")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login encounter error: {e}")
        return None

def import_corpus(token, name, domain, file_path, source_lang="zh", target_lang="en"):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Read samples from file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        samples = data.get('data', [])
        print(f"📦 Loaded {len(samples)} samples from {os.path.basename(file_path)}")

    # Create corpus with samples
    url = f"{BASE_URL}/corpus/create-with-samples"
    payload = {
        "name": name,
        "description": f"Imported {name} from {os.path.basename(file_path)}",
        "source_lang": source_lang,
        "target_lang": target_lang,
        "source_name": "Source",
        "target_name": "Target",
        "domain": domain,
        "source_type": "official",
        "is_public": True,
        "samples": samples
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        print(f"✅ Imported {name} successfully.")
        return response.json()["data"]["corpus_id"]
    else:
        print(f"❌ Failed to import {name}: {response.text}")
        return None

def main():
    token = login()
    if not token:
        return

    configs = [
        # Class 1: Terminology
        {"name": "术语语料 (Trade)", "domain": "terminology", "file": r"class1\term_zh.json", "sl": "zh", "tl": "ms"},
        # Class 2: QA
        {"name": "问答语料 (Trade)", "domain": "qa", "file": r"class2\class2-qa-001-200-zh.json", "sl": "zh", "tl": "zh"},
        # Class 3: Alignment
        {"name": "对齐语料 (CN-MS)", "domain": "alignment", "file": r"class3\align_zh_ms.json", "sl": "zh", "tl": "ms"},
        # Class 4: Process
        {"name": "流程规则语料 (Trade)", "domain": "process", "file": r"class4\process_zh.json", "sl": "zh", "tl": "zh"},
        # Class 5: Case
        {"name": "案例库语料", "domain": "case", "file": r"class5\case_zh.json", "sl": "zh", "tl": "zh"},
        # Class 6: Scenario
        {"name": "场景指令语料", "domain": "scenario", "file": r"class6\scenario_zh.json", "sl": "zh", "tl": "zh"}
    ]

    for cfg in configs:
        f_path = os.path.join(RESOURCES_DIR, cfg["file"])
        if os.path.exists(f_path):
            import_corpus(token, cfg["name"], cfg["domain"], f_path, cfg["sl"], cfg["tl"])
        else:
            print(f"⚠️ File not found: {f_path}")

if __name__ == "__main__":
    main()
