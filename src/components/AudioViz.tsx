import { useEffect, useRef } from 'react'

interface AudioVizProps {
  analyser: AnalyserNode | null
  active: boolean
}

export function AudioViz({ analyser, active }: AudioVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const W = canvas.width = canvas.offsetWidth
      const H = canvas.height = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      if (!analyser || !active) {
        // idle wave
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(99,102,241,0.2)'
        ctx.lineWidth = 1.5
        for (let x = 0; x < W; x++) {
          const y = H / 2 + Math.sin(x * 0.05 + Date.now() * 0.001) * 3
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        return
      }

      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(data)
      const bw = W / data.length

      for (let i = 0; i < data.length; i++) {
        const h = (data[i] / 255) * H
        const hue = 240 + (data[i] / 255) * 60
        const alpha = 0.4 + (data[i] / 255) * 0.6
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`
        ctx.beginPath()
        ctx.roundRect(i * bw, H - h, Math.max(bw - 1, 1), h, 2)
        ctx.fill()
      }
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, active])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-12 rounded-xl bg-surface-950"
    />
  )
}
