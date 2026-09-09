import { useEffect, useRef } from 'react'

const silkOptions = {
  speed: 2.4,
  zoom: 6,
  iterations: 12,
  tangentForce: 0.75,
  gradientForce: 0.15,
  colorPhaseR: 3.11,
  colorPhaseG: 3.11,
  colorPhaseB: 3.11,
  colorRange: 0.75,
  colorBias: 0.5,
  brightness: 1,
  backgroundColor: '#0a0a0a',
  opacity: 1,
  cursorInteraction: true,
  cursorIntensity: 1,
}

function drawSilkCloth(canvas, time, options, pointer) {
  const context = canvas.getContext('2d')
  const bounds = canvas.getBoundingClientRect()
  const width = Number.isFinite(bounds.width) && bounds.width > 0
    ? bounds.width
    : window.innerWidth
  const height = Number.isFinite(bounds.height) && bounds.height > 0
    ? bounds.height
    : window.innerHeight
  const center = width * 0.5
  const scale = Math.min(width, height)
  const phase = time * 0.0012 * options.speed
  const interaction = options.cursorInteraction
    ? (pointer.x - 0.5) * options.cursorIntensity
    : 0
  const verticalInteraction = options.cursorInteraction
    ? (pointer.y - 0.5) * options.cursorIntensity
    : 0

  context.clearRect(0, 0, width, height)
  context.fillStyle = options.backgroundColor
  context.fillRect(0, 0, width, height)

  const baseGlow = context.createRadialGradient(
    center,
    height * 0.42,
    0,
    center,
    height * 0.5,
    scale * 0.8,
  )
  baseGlow.addColorStop(0, `rgba(90, 102, 114, ${0.25 + options.colorBias * 0.18})`)
  baseGlow.addColorStop(0.48, 'rgba(30, 37, 45, 0.18)')
  baseGlow.addColorStop(1, 'rgba(4, 6, 10, 0.8)')
  context.fillStyle = baseGlow
  context.fillRect(0, 0, width, height)

  const ribbonCount = 24 + options.iterations
  const ribbonWidth = width / ribbonCount

  for (let ribbonIndex = -2; ribbonIndex < ribbonCount + 2; ribbonIndex += 1) {
    const ribbonCenter = ribbonIndex * ribbonWidth
    let waveOne = 0
    let waveTwo = 0

    for (let iteration = 1; iteration <= options.iterations; iteration += 1) {
      const iterationScale = 1 / iteration
      waveOne +=
        Math.sin(
          ribbonIndex * 0.72 * options.zoom * iterationScale +
            phase * options.tangentForce * (1 + iteration * 0.12),
        ) *
        scale *
        0.018 *
        iterationScale
      waveTwo +=
        Math.cos(
          ribbonIndex * 0.31 * options.zoom * iterationScale -
            phase * options.gradientForce * (1 + iteration * 0.1),
        ) *
        scale *
        0.014 *
        iterationScale
    }

    const foldCenter =
      ribbonCenter + waveOne + waveTwo + interaction * scale * 0.12
    const foldWidth = ribbonWidth * (0.75 + Math.sin(ribbonIndex * 1.7) * 0.12)
    const safeFoldCenter = Number.isFinite(foldCenter) ? foldCenter : ribbonCenter
    const safeFoldWidth = Number.isFinite(foldWidth) ? foldWidth : ribbonWidth
    const colorShift = Math.sin(options.colorPhaseR + ribbonIndex * 0.24) * options.colorRange
    const highlight = Math.max(0.2, options.colorBias + colorShift * 0.2)
    const hue =
      198 +
      Math.sin(options.colorPhaseG + ribbonIndex * 0.18) * 12 +
      Math.sin(options.colorPhaseB + ribbonIndex * 0.11) * 5
    const gradient = context.createLinearGradient(
      safeFoldCenter - safeFoldWidth,
      0,
      safeFoldCenter + safeFoldWidth,
      0,
    )

    gradient.addColorStop(0, 'rgba(3, 5, 9, 0.16)')
    gradient.addColorStop(0.22, `hsla(${hue}, 18%, 48%, ${0.12 + highlight * 0.1})`)
    gradient.addColorStop(
      0.43,
      `hsla(${hue}, 24%, 94%, ${0.2 + highlight * 0.3 * options.brightness})`,
    )
    gradient.addColorStop(0.53, `hsla(${hue}, 18%, 42%, ${0.2 + options.gradientForce * 0.2})`)
    gradient.addColorStop(0.68, 'rgba(12, 16, 22, 0.62)')
    gradient.addColorStop(0.86, `hsla(${hue}, 20%, 78%, ${0.12 + options.colorRange * 0.1})`)
    gradient.addColorStop(1, 'rgba(2, 4, 8, 0.12)')

    context.beginPath()
    context.moveTo(ribbonCenter - ribbonWidth * 1.25, 0)
    context.bezierCurveTo(
      safeFoldCenter - safeFoldWidth,
      height * 0.23,
      safeFoldCenter + safeFoldWidth + verticalInteraction * scale * 0.04,
      height * (0.66 + verticalInteraction * 0.08),
      ribbonCenter + ribbonWidth * 1.25,
      height,
    )
    context.lineTo(ribbonCenter + ribbonWidth * 1.4, height)
    context.bezierCurveTo(
      safeFoldCenter + safeFoldWidth * 1.3,
      height * 0.64,
      safeFoldCenter - safeFoldWidth * 1.3,
      height * 0.2,
      ribbonCenter + ribbonWidth * 1.05,
      0,
    )
    context.closePath()
    context.fillStyle = gradient
    context.fill()
  }

  const sheen = context.createLinearGradient(0, 0, width, height)
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.06)')
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.28)')
  context.fillStyle = sheen
  context.fillRect(0, 0, width, height)

  const shimmerPosition = center + Math.sin(phase * 1.4) * width * 0.35
  const shimmer = context.createRadialGradient(
    shimmerPosition,
    height * 0.45,
    0,
    shimmerPosition,
    height * 0.7,
    height * 0.7,
  )
  shimmer.addColorStop(0, 'rgba(235, 242, 248, 0.32)')
  shimmer.addColorStop(1, 'rgba(235, 242, 248, 0)')
  context.fillStyle = shimmer
  context.fillRect(0, 0, width, height)
}

export default function SilkCloth() {
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let animationFrame

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const bounds = canvas.getBoundingClientRect()
      const width = Math.max(1, bounds.width || window.innerWidth)
      const height = Math.max(1, bounds.height || window.innerHeight)
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const handlePointerMove = (event) => {
      pointerRef.current.x = event.clientX / window.innerWidth
      pointerRef.current.y = event.clientY / window.innerHeight
    }

    const render = () => {
      try {
        drawSilkCloth(canvas, performance.now(), silkOptions, pointerRef.current)
      } catch (error) {
        console.error('SilkCloth render failed:', error)
      } finally {
        animationFrame = requestAnimationFrame(render)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove)
    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="silk-cloth"
      style={{ opacity: silkOptions.opacity }}
      aria-hidden="true"
    />
  )
}
