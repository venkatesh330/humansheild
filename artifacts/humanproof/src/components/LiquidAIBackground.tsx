import { useEffect, useRef } from 'react';

/**
 * LiquidAIBackground
 * 
 * A GPU-accelerated WebGL background that renders a living "Liquid AI Creature" —
 * a morphing geometry that responds to mouse movement and breathes with a calm
 * procedural rhythm built from multi-octave simplex noise.
 * 
 * Zero external dependencies beyond React.
 */

// ─── Compact Simplex Noise ────────────────────────────────────────────────────
function createNoise() {
  const F3 = 1.0 / 3.0;
  const G3 = 1.0 / 6.0;
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  const grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
  ];

  function dot(g: number[], x: number, y: number, z: number) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  return function noise(xin: number, yin: number, zin: number): number {
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t, Y0 = j - t, Z0 = k - t;
    const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;
    let i1: number, j1: number, k1: number;
    let i2: number, j2: number, k2: number;
    if (x0 >= y0) {
      if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    const x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
    const x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
    const x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;
    const ii=i&255, jj=j&255, kk=k&255;
    const gi0=perm[ii+perm[jj+perm[kk]]]%12;
    const gi1=perm[ii+i1+perm[jj+j1+perm[kk+k1]]]%12;
    const gi2=perm[ii+i2+perm[jj+j2+perm[kk+k2]]]%12;
    const gi3=perm[ii+1+perm[jj+1+perm[kk+1]]]%12;
    const t0=0.6-x0*x0-y0*y0-z0*z0;
    const n0=t0<0?0:((t0*t0)*(t0*t0)*dot(grad3[gi0],x0,y0,z0));
    const t1=0.6-x1*x1-y1*y1-z1*z1;
    const n1=t1<0?0:((t1*t1)*(t1*t1)*dot(grad3[gi1],x1,y1,z1));
    const t2=0.6-x2*x2-y2*y2-z2*z2;
    const n2=t2<0?0:((t2*t2)*(t2*t2)*dot(grad3[gi2],x2,y2,z2));
    const t3=0.6-x3*x3-y3*y3-z3*z3;
    const n3=t3<0?0:((t3*t3)*(t3*t3)*dot(grad3[gi3],x3,y3,z3));
    return 32*(n0+n1+n2+n3);
  };
}

// ─── WebGL Shader Sources ─────────────────────────────────────────────────────
const VERT_SRC = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG_SRC = `
  precision highp float;

  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;   // 0..1 normalised
  uniform float u_dpr;

  // ── Smooth hash-based noise ─────────────────────────────────────────────
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 17.5);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),           hash(i+vec2(1,0)), u.x),
      mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p  = p * 2.0 + vec2(5.2, 1.3);
      a *= 0.5;
    }
    return v;
  }

  // ── SDF blob ───────────────────────────────────────────────────────────
  float blobSDF(vec2 uv, float t, vec2 mouse) {
    float angle = atan(uv.y, uv.x);
    float r     = length(uv);

    // Breathing
    float breathe = 1.0 + 0.06 * sin(t * 0.4);

    // Liquid deformation via layered noise on spherical surface
    vec2 noiseUV = vec2(angle / 6.283 + 0.5, 0.5) * 3.0;
    float deform = 0.0;
    deform += 0.10 * fbm(noiseUV + vec2(t * 0.15));
    deform += 0.05 * fbm(noiseUV * 2.0 + vec2(t * 0.20, t * 0.12));
    deform += 0.02 * fbm(noiseUV * 4.0 + vec2(t * 0.30));

    // Mouse pull — gentle gravitation toward cursor
    vec2  mOff  = mouse - vec2(0.5);
    float mDist = length(mOff);
    float mPull = 0.06 * smoothstep(0.6, 0.0, mDist);
    vec2  mDir  = normalize(mOff + 0.001) * mPull;
    uv += mDir * smoothstep(0.8, 0.0, r);

    float radius = (0.28 + deform) * breathe;
    return length(uv) - radius;
  }

  // ── Glow palette ───────────────────────────────────────────────────────
  vec3 glowColor(float d, float t) {
    // Pulse  
    float pulse = 0.5 + 0.5 * sin(t * 0.6);

    // Layer 1: bright cyan core
    vec3 c0 = vec3(0.0, 0.94, 1.0);
    // Layer 2: deep violet midtones
    vec3 c1 = vec3(0.47, 0.12, 0.90);
    // Layer 3: electric blue rim
    vec3 c2 = vec3(0.14, 0.44, 1.0);

    float t1 = smoothstep(0.08, -0.04, d);         // core
    float t2 = smoothstep(0.30,  0.00, d) * 0.55;  // mid glow
    float t3 = smoothstep(0.55,  0.10, d) * 0.22;  // outer aura
    float t4 = smoothstep(0.90,  0.30, d) * 0.08;  // deep space bleed

    vec3 col  = c0 * t1;
    col      += mix(c1, c2, sin(t * 0.35 + 1.0) * 0.5 + 0.5) * t2;
    col      += c2 * t3;
    col      += c1 * t4;

    // Inner-surface energy veins
    float vein = fbm(vec2(d * 12.0, t * 0.5)) * 0.5 + 0.5;
    col += c0 * vein * t1 * 0.4 * (0.7 + 0.3 * pulse);

    // Emissive pulse brightens the core
    col += c0 * t1 * 0.25 * pulse;

    return col;
  }

  // ── Particle field ─────────────────────────────────────────────────────
  float particle(vec2 uv, vec2 center, float size) {
    return smoothstep(size, 0.0, length(uv - center));
  }

  vec3 particles(vec2 uv, float t) {
    vec3 col = vec3(0.0);
    // Orbit particles around the blob
    for (int i = 0; i < 8; i++) {
      float fi    = float(i);
      float speed = 0.18 + fi * 0.04;
      float orbit = 0.36 + fi * 0.03;
      float phase = fi * 0.785398; // pi/4
      float x     = orbit * cos(t * speed + phase);
      float y     = orbit * sin(t * speed + phase + sin(t * 0.3 + fi));
      float a     = smoothstep(0.012, 0.0, length(uv - vec2(x, y)));
      // alternating cyan / violet
      vec3  c     = mod(fi, 2.0) < 1.0
                    ? vec3(0.0, 0.94, 1.0)
                    : vec3(0.47, 0.12, 0.90);
      col += c * a * 0.9;
      // tiny trail
      col += c * smoothstep(0.035, 0.006, length(uv - vec2(x, y))) * 0.2;
    }
    return col;
  }

  // ── Fog / depth ────────────────────────────────────────────────────────
  vec3 atmosphere(vec2 uv, float t) {
    float fog = fbm(uv * 1.8 + vec2(t * 0.04, t * 0.03));
    vec3  fogCol = vec3(0.03, 0.05, 0.18) * pow(fog, 2.5) * 0.6;
    return fogCol;
  }

  void main() {
    vec2 px  = gl_FragCoord.xy;
    // Centred aspect-correct UV
    vec2 uv  = (px - u_res * 0.5) / min(u_res.x, u_res.y);

    float t  = u_time;

    // Slow rotation
    float rot = t * 0.06;
    float cs  = cos(rot), sn = sin(rot);
    uv = mat2(cs, -sn, sn, cs) * uv;

    float d = blobSDF(uv, t, u_mouse);

    // Base deep space background
    vec3 bg = vec3(0.01, 0.02, 0.07);
    bg += atmosphere(uv, t);

    // Creature glow
    vec3 creature = glowColor(d, t);

    // Blend
    float alpha = smoothstep(0.9, 0.0, d);
    vec3  col   = mix(bg, creature, clamp(alpha + 0.0, 0.0, 1.0));
    col += creature * clamp(-d * 0.4, 0.0, 1.0); // extra additive core

    // Orbiting particles
    col += particles(uv, t);

    // Gentle vignette
    float vig = 1.0 - dot(uv * 0.7, uv * 0.7);
    col *= clamp(vig, 0.0, 1.0);

    // Tone-map (simple Reinhard)
    col = col / (col + 0.9);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ─── WebGL helper ─────────────────────────────────────────────────────────────
function compileShader(gl: WebGLRenderingContext, src: string, type: number) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string) {
  const vs = compileShader(gl, vert, gl.VERTEX_SHADER);
  const fs = compileShader(gl, frag, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LiquidAIBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL, fall back to 2D canvas on failure
    const glRaw = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'default',
    });

    if (!glRaw) {
      // Graceful 2D fallback (simple gradient)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.6
        );
        grad.addColorStop(0, 'rgba(0,240,255,0.15)');
        grad.addColorStop(0.5, 'rgba(168,85,247,0.08)');
        grad.addColorStop(1, 'rgba(3,7,18,1)');
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const gl = glRaw;
    const prog = createProgram(gl, VERT_SRC, FRAG_SRC);
    if (!prog) return;

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1,  -1,1,
       1,-1,  1, 1,  -1,1,
    ]), gl.STATIC_DRAW);

    const aPos    = gl.getAttribLocation(prog, 'a_pos');
    const uRes    = gl.getUniformLocation(prog, 'u_res');
    const uTime   = gl.getUniformLocation(prog, 'u_time');
    const uMouse  = gl.getUniformLocation(prog, 'u_mouse');

    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);

    const dpr    = Math.min(window.devicePixelRatio || 1, 1.5);
    let   rafId  = 0;
    let   start  = performance.now();

    const resize = () => {
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (now: number) => {
      const t = (now - start) * 0.001;

      // Lerp mouse for smoothness
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.04;

      gl.uniform2f(uRes,   canvas.width, canvas.height);
      gl.uniform1f(uTime,  t);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(render);
    };

    const onMouse = (e: MouseEvent) => {
      targetRef.current.x = e.clientX / window.innerWidth;
      targetRef.current.y = 1 - e.clientY / window.innerHeight;
    };

    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      targetRef.current.x = e.touches[0].clientX / window.innerWidth;
      targetRef.current.y = 1 - e.touches[0].clientY / window.innerHeight;
    };

    window.addEventListener('resize',     resize,    { passive: true });
    window.addEventListener('mousemove',  onMouse,   { passive: true });
    window.addEventListener('touchmove',  onTouch,   { passive: true });

    resize();
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="liquid-ai-bg"
      aria-hidden="true"
      style={{
        position:    'fixed',
        inset:        0,
        width:        '100%',
        height:       '100%',
        pointerEvents:'none',
        zIndex:        0,
        display:      'block',
      }}
    />
  );
}
