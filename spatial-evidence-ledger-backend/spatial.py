from shapely.geometry import Polygon

# Sample property boundary
coordinates = [
    (0, 0),
    (10, 0),
    (10, 10),
    (0, 10)
]

# Create polygon
parcel = Polygon(coordinates)

# Check whether the boundary is valid
print("Geometry Valid:", parcel.is_valid)

# Calculate area
print("Parcel Area:", parcel.area)
deed_area = 100

area_difference = abs(parcel.area - deed_area)

print("Deed Area:", deed_area)
print("Area Difference:", area_difference)
print("Area Valid:", area_difference <= 0.5)
# Neighbouring property
neighbour_coordinates = [
    (10, 0),
    (20, 0),
    (20, 10),
    (10, 10)
]
neighbour = Polygon(neighbour_coordinates)
# Check overlapo
overlap = parcel.intersection(neighbour).area > 0
overlap_area = parcel.intersection(neighbour).area

print("Overlap Area:", overlap_area)

print("Neighbour Overlap:", overlap)