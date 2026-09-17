import json
import hashlib
from datetime import datetime

# ZK commitment data
parcel_id = "P-001"
deed_area = 100

private_data = f"{parcel_id}|{deed_area}|zk-secret-123"

zk_commitment = hashlib.sha256(
    private_data.encode()
).hexdigest()

# Spatial Evidence Ledger
ledger_entry = {
    "parcel_id": "P-001",
    "source": "Survey Data",
    "date": datetime.now().isoformat(),
    "transformation": "Geometry Validation + Overlap Check",
    "conflict": "Neighbouring parcel overlap detected",
    "decision_reason": "Parcel geometry is valid but overlap exists",
    "human_approval": False,
    "zk_commitment": zk_commitment
}

# Load existing ledger records
try:
    with open("ledger.json", "r") as file:
        ledger_records = json.load(file)

    if not isinstance(ledger_records, list):
        ledger_records = [ledger_records]

except (FileNotFoundError, json.JSONDecodeError):
    ledger_records = []

print("Spatial Evidence Ledger created successfully.")
print(json.dumps(ledger_entry, indent=4))
# Human approval
approval = input("Enter human approval (yes/no): ")

ledger_entry["human_approval"] = approval.lower() == "yes"


print("Human Approval:", ledger_entry["human_approval"])
# Record status
if ledger_entry["human_approval"]:
    ledger_entry["status"] = "APPROVED"
else:
    ledger_entry["status"] = "PENDING"

print("Record Status:", ledger_entry["status"])
# Add new record to ledger
ledger_records.append(ledger_entry)

# Save all records
with open("ledger.json", "w") as file:
    json.dump(ledger_records, file, indent=4)
