#!/bin/bash
# Optimize GLB files for web
# Usage: ./optimize-glb.sh input.glb output.glb

INPUT=$1
OUTPUT=$2

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
    echo "Usage: ./optimize-glb.sh input.glb output.glb"
    exit 1
fi

echo "Optimizing $INPUT -> $OUTPUT"

npx gltf-pipeline -i "$INPUT" -o "$OUTPUT" \
    --draco.compressionLevel 10 \
    --draco.quantizePositionBits 14 \
    --draco.quantizeNormalBits 10 \
    --draco.quantizeTexcoordBits 12

echo "Done! Optimized file saved to $OUTPUT"
