import { useEffect, useRef } from 'react'

const vertexShader = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const fragmentShader = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 out_color;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_motion;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  local = local * local * (3.0 - 2.0 * local);
  float a = hash21(cell);
  float b = hash21(cell + vec2(1.0, 0.0));
  float c = hash21(cell + vec2(0.0, 1.0));
  float d = hash21(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

float fabricNoise(vec2 p) {
  float value = 0.0;
  float amplitude = 0.58;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += noise(p * frequency) * amplitude;
    frequency *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

float clothHeight(vec2 p, float time) {
  vec2 drift = vec2(time * 0.045, -time * 0.022);
  float broad = fabricNoise(p * 1.08 + drift);
  vec2 broadWarp = p + (vec2(
    fabricNoise(p * 1.45 - drift.yx),
    fabricNoise(p * 1.22 + drift.yx * 0.7)
  ) - 0.5) * 0.34;
  float folds = fabricNoise(broadWarp * 2.35 - drift * 0.55);
  float fine = fabricNoise(broadWarp * 5.4 + drift * 0.18);
  return broad * 0.58 + folds * 0.32 + fine * 0.1;
}

void main() {
  vec2 centered = v_uv - 0.5;
  centered.x *= u_resolution.x / u_resolution.y;
  float time = u_time * u_motion;
  vec2 p = centered;
  p += vec2(
    sin(centered.y * 2.2 + time * 0.25),
    cos(centered.x * 1.7 - time * 0.19)
  ) * 0.035;

  float height = clothHeight(p, time);
  float epsilon = 0.006;
  float height_x = clothHeight(p + vec2(epsilon, 0.0), time);
  float height_y = clothHeight(p + vec2(0.0, epsilon), time);
  vec3 normal = normalize(vec3(
    (height - height_x) * 5.2,
    (height - height_y) * 5.2,
    1.0
  ));

  vec3 lightDirection = normalize(vec3(-0.42, 0.58, 0.72));
  vec3 viewDirection = normalize(vec3(0.0, 0.0, 1.0));
  float diffuse = max(dot(normal, lightDirection), 0.0);
  float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.2);
  vec3 halfVector = normalize(lightDirection + viewDirection);
  float specular = pow(max(dot(normal, halfVector), 0.0), 34.0);

  vec3 deepPlum = vec3(0.055, 0.012, 0.075);
  vec3 plum = vec3(0.25, 0.025, 0.21);
  vec3 magenta = vec3(0.72, 0.045, 0.34);
  vec3 lavender = vec3(0.48, 0.26, 0.62);

  float colorFlow = smoothstep(0.18, 0.82, height);
  vec3 clothColor = mix(deepPlum, plum, smoothstep(0.05, 0.52, height));
  clothColor = mix(clothColor, lavender, colorFlow * 0.32);
  clothColor = mix(clothColor, magenta, smoothstep(0.58, 0.92, height) * 0.34);

  float shadow = 0.62 + diffuse * 0.62;
  clothColor *= shadow;
  clothColor += lavender * rim * 0.08;
  clothColor += vec3(1.0, 0.72, 0.88) * specular * 0.38;
  clothColor = pow(max(clothColor, 0.0), vec3(0.92));

  float edgeFade = 1.0 - smoothstep(0.62, 0.9, length(centered));
  clothColor *= 0.82 + edgeFade * 0.18;
  out_color = vec4(clothColor, 1.0);
}`

function compileShader(gl, source, type) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function SilkCloth() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false })
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame

    if (!gl) {
      canvas.classList.add('silk-cloth--fallback')
      return undefined
    }

    const vertex = compileShader(gl, vertexShader, gl.VERTEX_SHADER)
    const fragment = compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER)
    if (!vertex || !fragment) {
      canvas.classList.add('silk-cloth--fallback')
      return undefined
    }

    const program = gl.createProgram()
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.classList.add('silk-cloth--fallback')
      return undefined
    }

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    gl.useProgram(program)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const resolution = gl.getUniformLocation(program, 'u_resolution')
    const time = gl.getUniformLocation(program, 'u_time')
    const motion = gl.getUniformLocation(program, 'u_motion')

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
      const bounds = canvas.getBoundingClientRect()
      const width = Math.max(1, bounds.width || window.innerWidth)
      const height = Math.max(1, bounds.height || window.innerHeight)
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolution, width, height)
    }

    const render = (timestamp) => {
      gl.uniform1f(time, timestamp * 0.001)
      gl.uniform1f(motion, reducedMotion.matches ? 0.0 : 1.0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationFrame = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    reducedMotion.addEventListener('change', resize)
    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      reducedMotion.removeEventListener('change', resize)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  return <canvas ref={canvasRef} className="silk-cloth" aria-hidden="true" />
}
