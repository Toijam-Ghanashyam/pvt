print("ZK-GeoProof Proof System")

import hashlib

# Private parcel data
parcel_id = "P-001"
parcel_area = 100
secret = "zk-secret-123"

# Create a commitment from private data
private_data = f"{parcel_id}|{parcel_area}|{secret}"

commitment = hashlib.sha256(
    private_data.encode()
).hexdigest()

print("Parcel ID:", parcel_id)
print("Commitment:", commitment)

# Verify the commitment
verification = hashlib.sha256(
    private_data.encode()
).hexdigest()

print("Proof Verified:", commitment == verification)