from flask import Flask, jsonify
from flask_cors import CORS
import json
import hashlib
import secrets
from datetime import datetime

app = Flask(__name__)

CORS(app)

LEDGER_FILE = "ledger.json"
AUDIT_FILE = "audit.json"


# ==============================
# AUDIT LOG FUNCTION
# ==============================

def add_audit_event(parcel_id, action, details=""):

    try:

        with open(AUDIT_FILE, "r") as file:
            audit_data = json.load(file)

    except (FileNotFoundError, json.JSONDecodeError):

        audit_data = []


    event = {
        "parcel_id": parcel_id,
        "action": action,
        "details": details,
        "timestamp": datetime.now().isoformat(
            timespec="seconds"
        )
    }


    audit_data.append(event)


    with open(AUDIT_FILE, "w") as file:

        json.dump(
            audit_data,
            file,
            indent=4
        )


# ==============================
# GET LEDGER DATA
# ==============================

@app.route("/api/ledger", methods=["GET"])
def get_ledger():

    try:

        with open(LEDGER_FILE, "r") as file:
            data = json.load(file)

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==============================
# GET AUDIT HISTORY
# ==============================

@app.route("/api/audit", methods=["GET"])
def get_audit():

    try:

        with open(AUDIT_FILE, "r") as file:
            data = json.load(file)

        return jsonify(data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==============================
# APPROVE A PARCEL
# ==============================

@app.route("/api/approve/<parcel_id>", methods=["POST"])
def approve_parcel(parcel_id):

    try:

        with open(LEDGER_FILE, "r") as file:
            records = json.load(file)


        found = False


        for record in records:

            if record["parcel_id"] == parcel_id:

                record["human_approval"] = True
                record["status"] = "APPROVED"

                found = True


        if not found:

            return jsonify({
                "error": "Parcel not found"
            }), 404


        with open(LEDGER_FILE, "w") as file:

            json.dump(
                records,
                file,
                indent=4
            )


        add_audit_event(
            parcel_id,
            "HUMAN_APPROVED",
            "Parcel approved by authorized reviewer"
        )


        return jsonify({
            "message":
            f"Parcel {parcel_id} approved successfully"
        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==============================
# REJECT A PARCEL
# ==============================

@app.route("/api/reject/<parcel_id>", methods=["POST"])
def reject_parcel(parcel_id):

    try:

        with open(LEDGER_FILE, "r") as file:
            records = json.load(file)


        found = False


        for record in records:

            if record["parcel_id"] == parcel_id:

                record["human_approval"] = False
                record["status"] = "REJECTED"

                found = True


        if not found:

            return jsonify({
                "error": "Parcel not found"
            }), 404


        with open(LEDGER_FILE, "w") as file:

            json.dump(
                records,
                file,
                indent=4
            )


        add_audit_event(
            parcel_id,
            "HUMAN_REJECTED",
            "Parcel rejected by authorized reviewer"
        )


        return jsonify({
            "message":
            f"Parcel {parcel_id} rejected successfully"
        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==============================
# GENERATE COMMITMENT
# ==============================

@app.route(
    "/api/generate-commitment/<parcel_id>",
    methods=["POST"]
)
def generate_commitment(parcel_id):

    try:

        with open(LEDGER_FILE, "r") as file:
            records = json.load(file)


        found = False
        generated_commitment = None


        for record in records:

            if record["parcel_id"] == parcel_id:

                found = True


                secret_nonce = secrets.token_hex(16)


                commitment_data = {

                    "parcel_id":
                    record.get("parcel_id"),

                    "source":
                    record.get("source"),

                    "date":
                    record.get("date"),

                    "transformation":
                    record.get("transformation"),

                    "conflict":
                    record.get("conflict"),

                    "decision_reason":
                    record.get("decision_reason"),

                    "secret_nonce":
                    secret_nonce
                }


                data_string = json.dumps(
                    commitment_data,
                    sort_keys=True
                )


                generated_commitment = hashlib.sha256(
                    data_string.encode()
                ).hexdigest()


                record["zk_commitment"] = (
                    generated_commitment
                )


                record["commitment_nonce"] = (
                    secret_nonce
                )


        if not found:

            return jsonify({
                "error": "Parcel not found"
            }), 404


        with open(LEDGER_FILE, "w") as file:

            json.dump(
                records,
                file,
                indent=4
            )


        add_audit_event(
            parcel_id,
            "COMMITMENT_GENERATED",
            "SHA-256 cryptographic commitment generated"
        )


        return jsonify({

            "message":
            f"Commitment generated for {parcel_id}",

            "parcel_id":
            parcel_id,

            "commitment":
            generated_commitment
        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==============================
# HOME ROUTE
# ==============================

@app.route("/")
def home():

    return jsonify({

        "message":
        "ZK-GeoProof Backend is Running"

    })


# ==============================
# START SERVER
# ==============================

if __name__ == "__main__":

    app.run(debug=True)