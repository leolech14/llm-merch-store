#!/usr/bin/env python3
"""
Blender CLI script to export GLB files
Usage: blender --background scene.blend --python export-glb.py -- output.glb
"""

import bpy
import sys

# Get output path from command line args (after --)
argv = sys.argv
argv = argv[argv.index("--") + 1:]
output_path = argv[0] if argv else "output.glb"

# Export as GLB
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_textures=True,
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=False,
    export_lights=False,
    export_yup=True
)

print(f"Exported to {output_path}")
