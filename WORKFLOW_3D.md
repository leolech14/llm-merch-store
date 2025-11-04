# 3D Asset Workflow

Complete workflow for creating and integrating 3D assets into the LLM Merch store.

## Tools Installed

- **Blender** (CLI-enabled) - 3D modeling and export
- **React Three Fiber** - React integration for Three.js
- **@react-three/drei** - Useful helpers and abstractions
- **gltf-pipeline** - GLB/GLTF optimization

## Workflow Steps

### 1. Create 3D Asset in Blender

```bash
# Open Blender GUI
blender

# Or create from template
blender --background --python scripts/create-template.py
```

### 2. Export from Blender (GUI or CLI)

**GUI Method:**
- File → Export → glTF 2.0 (.glb/.gltf)
- Choose GLB format (single file)
- Save to `public/models/`

**CLI Method:**
```bash
# Export specific .blend file to GLB
blender --background mymodel.blend --python scripts/export-glb.py -- public/models/mymodel.glb
```

### 3. Optimize for Web

```bash
# Compress and optimize GLB
./scripts/optimize-glb.sh public/models/mymodel.glb public/models/mymodel-optimized.glb
```

### 4. Preview in Browser

```tsx
import { Model3D } from '@/components/3d/Model3D'

export function MyComponent() {
  return (
    <Model3D
      modelPath="/models/mymodel-optimized.glb"
      scale={1}
      autoRotate={true}
      className="w-full h-[600px]"
    />
  )
}
```

## Quick Commands

```bash
# Create models directory
mkdir -p public/models

# Export from Blender
blender --background scene.blend --python scripts/export-glb.py -- public/models/output.glb

# Optimize
./scripts/optimize-glb.sh public/models/output.glb public/models/output-opt.glb

# Start dev server to preview
npm run dev
```

## Example Integration

### Hero Section with 3D

```tsx
import { Model3D } from '@/components/3d/Model3D'

export function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 z-0">
        <Model3D
          modelPath="/models/tshirt-3d.glb"
          scale={2}
          position={[0, -1, 0]}
          autoRotate={true}
        />
      </div>
      <div className="relative z-10">
        <h1>Your Content Here</h1>
      </div>
    </section>
  )
}
```

### Product Card with 3D Preview

```tsx
<Model3D
  modelPath="/models/products/ask-anything.glb"
  scale={1.5}
  className="w-full h-[400px]"
  autoRotate={false}
/>
```

## File Structure

```
llm-merch-store/
├── public/
│   └── models/              # GLB files go here
│       ├── tshirt-3d.glb
│       └── products/
│           └── *.glb
├── components/
│   └── 3d/
│       └── Model3D.tsx      # Reusable 3D component
└── scripts/
    ├── export-glb.py        # Blender export script
    └── optimize-glb.sh      # GLB optimization
```

## Tips

1. **Keep files small** - Target < 500KB per GLB file
2. **Use Draco compression** - Included in optimize script
3. **Lazy load** - Use Suspense for better performance
4. **Test on mobile** - 3D can be heavy on mobile devices
5. **Preload critical models** - Use `preloadModel()` helper

## Alternative: Spline Integration

If you prefer Spline over Blender:

```bash
npm install @splinetool/react-spline
```

```tsx
import Spline from '@splinetool/react-spline'

<Spline scene="https://prod.spline.design/YOUR-ID/scene.splinecode" />
```
