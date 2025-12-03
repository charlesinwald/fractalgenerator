import type p5 from 'p5';
import type { FilterType } from '@/types';

/**
 * GPU-accelerated filter implementations using WebGL shaders
 * These provide significant performance improvements over CPU-based pixel manipulation
 */

// Fragment shader for sepia filter
const sepiaShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec4 color = texture2D(tex0, uv);

  float r = color.r * 0.393 + color.g * 0.769 + color.b * 0.189;
  float g = color.r * 0.349 + color.g * 0.686 + color.b * 0.168;
  float b = color.r * 0.272 + color.g * 0.534 + color.b * 0.131;

  gl_FragColor = vec4(r, g, b, color.a);
}
`;

// Fragment shader for vintage filter with vignette
const vintageShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec4 color = texture2D(tex0, uv);

  // Warm tone adjustment
  float r = color.r * 1.1 + 0.078;
  float g = color.g * 0.95 + 0.039;
  float b = color.b * 0.9;

  // Vignette effect
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(uv, center);
  float vignette = 1.0 - (dist * 0.6);

  gl_FragColor = vec4(r * vignette, g * vignette, b * vignette, color.a);
}
`;

// Fragment shader for high contrast
const highContrastShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec4 color = texture2D(tex0, uv);

  float factor = 1.5;
  float r = (color.r - 0.5) * factor + 0.5;
  float g = (color.g - 0.5) * factor + 0.5;
  float b = (color.b - 0.5) * factor + 0.5;

  gl_FragColor = vec4(clamp(r, 0.0, 1.0), clamp(g, 0.0, 1.0), clamp(b, 0.0, 1.0), color.a);
}
`;

// Fragment shader for black and white (threshold)
const blackWhiteShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec4 color = texture2D(tex0, uv);

  float gray = (color.r + color.g + color.b) / 3.0;
  float bw = step(0.5, gray);

  gl_FragColor = vec4(bw, bw, bw, color.a);
}
`;

// Fragment shader for sharpen
const sharpenShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;

  vec2 texelSize = 1.0 / resolution;

  // Sharpen kernel
  vec4 color = texture2D(tex0, uv) * 5.0;
  color -= texture2D(tex0, uv + vec2(0.0, texelSize.y));
  color -= texture2D(tex0, uv - vec2(0.0, texelSize.y));
  color -= texture2D(tex0, uv + vec2(texelSize.x, 0.0));
  color -= texture2D(tex0, uv - vec2(texelSize.x, 0.0));

  gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), color.a);
}
`;

// Fragment shader for saturation adjustment
const saturateShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float amount;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec4 color = texture2D(tex0, uv);

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  vec3 saturated = mix(vec3(gray), color.rgb, amount);

  gl_FragColor = vec4(saturated, color.a);
}
`;

// Fragment shader for brightness adjustment
const brightnessShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float amount;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec4 color = texture2D(tex0, uv);

  gl_FragColor = vec4(clamp(color.rgb * amount, 0.0, 1.0), color.a);
}
`;

// Vertex shader (same for all filters)
const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

export class GPUFilterProcessor {
  private p: p5;
  private shaders: Map<string, any> = new Map();
  private filterGraphics: any = null;

  constructor(p5Instance: p5) {
    this.p = p5Instance;
  }

  /**
   * Initialize a shader for a specific filter type
   */
  private getOrCreateShader(filterType: FilterType): any {
    if (this.shaders.has(filterType)) {
      return this.shaders.get(filterType);
    }

    let fragmentShader = '';

    switch (filterType) {
      case 'sepia':
        fragmentShader = sepiaShader;
        break;
      case 'vintage':
        fragmentShader = vintageShader;
        break;
      case 'highcontrast':
        fragmentShader = highContrastShader;
        break;
      case 'blackwhite':
        fragmentShader = blackWhiteShader;
        break;
      case 'sharpen':
        fragmentShader = sharpenShader;
        break;
      case 'saturate':
      case 'desaturate':
        fragmentShader = saturateShader;
        break;
      case 'brighten':
      case 'darken':
        fragmentShader = brightnessShader;
        break;
      default:
        return null;
    }

    try {
      const shader = this.p.createShader(vertexShader, fragmentShader);
      this.shaders.set(filterType, shader);
      return shader;
    } catch (error) {
      console.error(`Failed to create shader for ${filterType}:`, error);
      return null;
    }
  }

  /**
   * Apply a GPU-accelerated filter to the canvas
   */
  applyFilter(filterType: FilterType): boolean {
    if (filterType === 'none') return false;

    // For filters supported by p5.js natively, use those (already GPU-accelerated in WEBGL mode)
    const nativeFilters = ['grayscale', 'invert', 'blur', 'posterize', 'threshold'];
    if (nativeFilters.includes(filterType)) {
      return false; // Let p5.js handle it
    }

    const shader = this.getOrCreateShader(filterType);
    if (!shader) return false;

    try {
      // Create filter graphics if needed
      if (!this.filterGraphics) {
        this.filterGraphics = this.p.createGraphics(this.p.width, this.p.height, (this.p as any).WEBGL);
      }

      // Get the current canvas as texture
      this.filterGraphics.shader(shader);

      // Set uniforms
      shader.setUniform('tex0', this.p.get());
      shader.setUniform('resolution', [this.p.width, this.p.height]);

      // Set filter-specific uniforms
      if (filterType === 'saturate') {
        shader.setUniform('amount', 1.5);
      } else if (filterType === 'desaturate') {
        shader.setUniform('amount', 0.5);
      } else if (filterType === 'brighten') {
        shader.setUniform('amount', 1.3);
      } else if (filterType === 'darken') {
        shader.setUniform('amount', 0.7);
      }

      // Render filtered result
      this.filterGraphics.rect(0, 0, this.p.width, this.p.height);

      // Copy result back to main canvas
      this.p.image(this.filterGraphics, 0, 0);

      return true;
    } catch (error) {
      console.error(`Failed to apply GPU filter ${filterType}:`, error);
      return false;
    }
  }

  /**
   * Check if GPU acceleration is available
   */
  static isAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.shaders.clear();
    if (this.filterGraphics) {
      this.filterGraphics.remove();
      this.filterGraphics = null;
    }
  }
}
