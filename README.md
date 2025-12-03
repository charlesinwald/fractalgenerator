# Fractal Generator - Next.js

A beautiful fractal art generator built with Next.js, React, TypeScript, and p5.js.

## Features

- **Interactive Drawing**: Click and drag to create symmetrical fractal patterns
- **Multiple Symmetry Options**: Choose from 2 to 12 symmetry points
- **Color Modes**: Rainbow, gradient, and solid color options
- **Animation Modes**:
  - Rotating canvas
  - Pulsing effects
  - Particle system
  - Kaleidoscope
  - Wave distortion
  - Spiral growth
  - Fractal zoom
  - Morphing
  - Blooming flower garden
- **Photographic Filters**: Apply 14 different filters including grayscale, sepia, vintage, blur, and more
- **GPU Acceleration** ⚡: Hardware-accelerated filter processing using WebGL shaders for 10-100x performance improvement
- **Advanced Controls**:
  - Adjustable stroke weight
  - Animation speed control
  - Combine multiple effects
  - Enable trails for artistic effects
  - Flower type and count customization (when in flower mode)
  - GPU acceleration toggle for optimal performance
- **Export**: Save your creations as PNG images

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Yarn 4.9.1 (included via packageManager field)

### Installation

The project is already set up! Just run:

```bash
yarn install
```

### Development

Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build

Create a production build:

```bash
yarn build
```

### Production

Run the production server:

```bash
yarn start
```

## Project Structure

```
fractalgenerator/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx          # Main page component
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── FractalCanvas.tsx # Main canvas component with p5.js
│   └── FractalControls.tsx # Control panel component
├── lib/                   # Utility libraries
│   ├── particles.ts      # Particle and flower particle classes
│   └── gpuFilters.ts     # GPU-accelerated filter processor (WebGL)
├── types/                 # TypeScript type definitions
│   └── index.ts          # App-wide type definitions
├── public/               # Static assets
│   └── favicon.svg       # Fractal favicon
└── next.config.js        # Next.js configuration
```

## Technologies Used

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **p5.js**: Creative coding library
- **react-p5**: React wrapper for p5.js
- **WebGL**: GPU-accelerated graphics rendering

## GPU Acceleration

This application features optional GPU acceleration using WebGL shaders for significantly improved performance when applying filters and effects.

**Key Benefits:**
- 10-100x faster filter processing
- Smoother animations at higher frame rates
- Lower CPU usage
- Real-time effects without lag

**How to Use:**
1. Open the "Performance" section in the control panel
2. Enable "GPU Acceleration" checkbox
3. Enjoy ultra-fast filter processing!

For detailed information about GPU acceleration, browser compatibility, and implementation details, see [GPU_ACCELERATION.md](./GPU_ACCELERATION.md).

## Migration from Vanilla JS

This project has been refactored from a vanilla JavaScript p5.js application to a modern Next.js application with:

- ✅ TypeScript for type safety
- ✅ Component-based architecture
- ✅ Tailwind CSS for styling
- ✅ Modern React hooks and state management
- ✅ Optimized build and deployment
- ✅ Server-side rendering support

## Original Files

The original implementation files are still available in the root directory:
- `index.html` - Original HTML file
- `sketch.js` - Original p5.js sketch
- `style.css` - Original styles

## License

MIT
