import hashlib
import json

# Private spatial data
coordinates = [
    (0, 0),
    (10, 0),
    (10, 10),
    (0, 10)
]

deed_area = 100
import secrets

secret_nonce = secrets.token_hex(16)

# Create a private data package
private_data = {
    "coordinates": coordinates,
    "deed_area": deed_area,
    "secret_nonce": secret_nonce
}

# Convert data into a fixed string
data_string = json.dumps(private_data, sort_keys=True)

# Generate cryptographic commitment
commitment = hashlib.sha256(
    data_string.encode()
).hexdigest()

print("ZK-GeoProof Commitment:")
print(commitment)
# Verify commitment
verification_commitment = hashlib.sha256(
    data_string.encode()
).hexdigest()

print("Commitment Verified:", commitment == verification_commitment)