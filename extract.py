"""
Extract building footprints from a high-resolution drone GeoTIFF.

Uses segment-geospatial (SamGeo3) to automatically segment building structures
via text prompt, vectorize the raster masks, and export polygons to GeoJSON.

Dependencies:
    pip install "segment-geospatial[samgeo3]"

Usage:
    python extract.py path/to/drone_image.tif
    python extract.py path/to/drone_image.tif -o buildings.geojson
    python extract.py path/to/drone_image.tif --regularize
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from samgeo import SamGeo3
from samgeo.common import raster_to_vector, regularize

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

BUILDING_PROMPT = "building"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Segment building structures from a drone GeoTIFF and export GeoJSON."
        ),
    )
    parser.add_argument(
        "input_tiff",
        type=Path,
        help="Path to the input high-resolution drone GeoTIFF image",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Output GeoJSON path (default: <input_stem>_buildings.geojson)",
    )
    parser.add_argument(
        "--masks",
        type=Path,
        default=None,
        help="Intermediate mask GeoTIFF path (default: <output_stem>_masks.tif)",
    )
    parser.add_argument(
        "--backend",
        choices=("meta", "transformers"),
        default="meta",
        help="SAM3 inference backend (default: meta)",
    )
    parser.add_argument(
        "--prompt",
        default=BUILDING_PROMPT,
        help='Text prompt for building segmentation (default: "building")',
    )
    parser.add_argument(
        "--tile-size",
        type=int,
        default=1024,
        help="Tile size in pixels for large GeoTIFF processing (default: 1024)",
    )
    parser.add_argument(
        "--overlap",
        type=int,
        default=128,
        help="Tile overlap in pixels (default: 128)",
    )
    parser.add_argument(
        "--min-size",
        type=int,
        default=100,
        help="Minimum building mask area in pixels (default: 100)",
    )
    parser.add_argument(
        "--confidence-threshold",
        type=float,
        default=0.5,
        help="SAM3 detection confidence threshold (default: 0.5)",
    )
    parser.add_argument(
        "--regularize",
        action="store_true",
        help="Regularize building footprints for cleaner polygon geometry",
    )
    parser.add_argument(
        "--no-tiled",
        action="store_true",
        help="Process the full image at once instead of tiled segmentation",
    )
    return parser.parse_args()


def build_segmenter(backend: str, confidence_threshold: float) -> SamGeo3:
    return SamGeo3(
        backend=backend,
        confidence_threshold=confidence_threshold,
    )


def segment_buildings(
    sam3: SamGeo3,
    input_tiff: Path,
    masks_tiff: Path,
    prompt: str,
    tile_size: int,
    overlap: int,
    min_size: int,
    use_tiled: bool,
) -> None:
    if use_tiled:
        logger.info(
            "Running tiled SAM3 segmentation (tile_size=%d, overlap=%d)",
            tile_size,
            overlap,
        )
        sam3.generate_masks_tiled(
            source=str(input_tiff),
            prompt=prompt,
            output=str(masks_tiff),
            tile_size=tile_size,
            overlap=overlap,
            min_size=min_size,
            unique=True,
            verbose=True,
        )
        return

    logger.info("Running SAM3 segmentation on full image")
    sam3.set_image(str(input_tiff))
    sam3.generate_masks(prompt=prompt, min_size=min_size)
    sam3.save_masks(output=str(masks_tiff), unique=True)


def extract_buildings(
    input_tiff: Path,
    output_geojson: Path,
    masks_tiff: Path,
    backend: str,
    prompt: str,
    tile_size: int,
    overlap: int,
    min_size: int,
    confidence_threshold: float,
    do_regularize: bool,
    use_tiled: bool,
) -> None:
    if not input_tiff.exists():
        raise FileNotFoundError(f"Input GeoTIFF not found: {input_tiff}")

    output_geojson.parent.mkdir(parents=True, exist_ok=True)
    masks_tiff.parent.mkdir(parents=True, exist_ok=True)

    logger.info("Initializing SAM3 model (backend=%s)", backend)
    sam3 = build_segmenter(backend, confidence_threshold)

    logger.info('Segmenting "%s" structures in %s', prompt, input_tiff)
    segment_buildings(
        sam3=sam3,
        input_tiff=input_tiff,
        masks_tiff=masks_tiff,
        prompt=prompt,
        tile_size=tile_size,
        overlap=overlap,
        min_size=min_size,
        use_tiled=use_tiled,
    )

    logger.info("Converting raster masks to vector polygons")
    vector_path = output_geojson
    if do_regularize:
        vector_path = output_geojson.with_name(
            f"{output_geojson.stem}_raw.geojson"
        )

    raster_to_vector(str(masks_tiff), str(vector_path))

    if do_regularize:
        logger.info("Regularizing building footprints")
        regularize(str(vector_path), str(output_geojson))
        vector_path.unlink(missing_ok=True)

    logger.info("Exported %s", output_geojson)


def main() -> int:
    args = parse_args()

    input_tiff = args.input_tiff.resolve()
    output_geojson = (
        args.output.resolve()
        if args.output
        else input_tiff.with_name(f"{input_tiff.stem}_buildings.geojson")
    )
    masks_tiff = (
        args.masks.resolve()
        if args.masks
        else output_geojson.with_name(f"{output_geojson.stem}_masks.tif")
    )

    try:
        extract_buildings(
            input_tiff=input_tiff,
            output_geojson=output_geojson,
            masks_tiff=masks_tiff,
            backend=args.backend,
            prompt=args.prompt,
            tile_size=args.tile_size,
            overlap=args.overlap,
            min_size=args.min_size,
            confidence_threshold=args.confidence_threshold,
            do_regularize=args.regularize,
            use_tiled=not args.no_tiled,
        )
    except Exception:
        logger.exception("Building extraction failed")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
