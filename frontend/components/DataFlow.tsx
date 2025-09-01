import { useEffect, useRef, useState } from 'react'
import { ZoneData } from '../types/cityPulse'

interface DataFlowProps {
  zones: ZoneData[]
  cityMoodIndex: number
}

export default function DataFlow({ zones, cityMoodIndex }: DataFlowProps): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation variables
    let time = 0
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
      color: string
      size: number
      type: 'data' | 'emotion' | 'mood'
    }> = []

    // Create data nodes
    const dataNodes = zones.map((zone, index) => ({
      x: 100 + (index % 3) * 150,
      y: 100 + Math.floor(index / 3) * 120,
      zone,
      pulse: 0,
      connections: [] as Array<{
        target: any
        strength: number
      }>
    }))

    // Create connections between nodes
    dataNodes.forEach((node, index) => {
      const nextIndex = (index + 1) % dataNodes.length
      node.connections.push({
        target: dataNodes[nextIndex],
        strength: Math.random() * 0.5 + 0.5
      })
    })

    // Animation loop
    const animate = () => {
      time += 0.016
      
      // Clear canvas with animated gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 50,
        canvas.height / 2 + Math.cos(time) * 50,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      )
      gradient.addColorStop(0, '#1e1b4b')
      gradient.addColorStop(0.5, '#312e81')
      gradient.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw floating city pulse wave
      ctx.strokeStyle = `hsl(${200 + Math.sin(time) * 30}, 70%, 60%)`
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      
      const waveY = canvas.height - 40 + Math.sin(time * 4) * 20
      ctx.moveTo(0, waveY)
      
      for (let x = 0; x < canvas.width; x += 10) {
        const y = waveY + Math.sin(time * 3 + x * 0.02) * 25 + 
                         Math.sin(time * 1.5 + x * 0.01) * 15
        ctx.lineTo(x, y)
      }
      
      ctx.stroke()

      // Animate and draw data nodes
      dataNodes.forEach((node, index) => {
        node.pulse = Math.sin(time * 2 + index) * 0.15 + 1

        // Node glow effect
        const glowRadius = 30 + Math.sin(time * 3 + index) * 10
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowRadius
        )
        
        let nodeColor = '#6b7280'
        if (node.zone.current_mood_index >= 70) nodeColor = '#10b981'
        else if (node.zone.current_mood_index >= 40) nodeColor = '#6b7280'
        else nodeColor = '#ef4444'

        gradient.addColorStop(0, nodeColor)
        gradient.addColorStop(0.7, `${nodeColor}40`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Main node
        ctx.fillStyle = nodeColor
        ctx.beginPath()
        ctx.arc(
          node.x, 
          node.y, 
          20 * node.pulse, 
          0, 
          Math.PI * 2
        )
        ctx.fill()

        // Node highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.beginPath()
        ctx.arc(
          node.x - 5, 
          node.y - 5, 
          8 * node.pulse, 
          0, 
          Math.PI * 2
        )
        ctx.fill()

        // Zone name
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(
          node.zone.zone_name,
          node.x,
          node.y + 35
        )

        // Mood index
        ctx.fillStyle = nodeColor
        ctx.font = 'bold 14px Arial'
        ctx.fillText(
          node.zone.current_mood_index.toString(),
          node.x,
          node.y - 25
        )

        // Generate particles
        if (Math.random() > 0.95) {
          particles.push({
            x: node.x + (Math.random() - 0.5) * 40,
            y: node.y + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            maxLife: 1,
            color: nodeColor,
            size: Math.random() * 4 + 2,
            type: 'data'
          })
        }
      })

      // Draw connections between nodes
      dataNodes.forEach(node => {
        node.connections.forEach(connection => {
          const target = connection.target
          const distance = Math.sqrt(
            Math.pow(node.x - target.x, 2) + 
            Math.pow(node.y - target.y, 2)
          )
          
          if (distance < 200) {
            const alpha = (200 - distance) / 200 * connection.strength
            ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`
            ctx.lineWidth = 2 * connection.strength
            
            // Animated connection line
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            
            const midX = (node.x + target.x) / 2
            const midY = (node.y + target.y) / 2 + Math.sin(time * 2) * 10
            
            ctx.quadraticCurveTo(midX, midY, target.x, target.y)
            ctx.stroke()

            // Data flow particles along connections
            if (Math.random() > 0.8) {
              const t = Math.random()
              const x = node.x + (target.x - node.x) * t
              const y = node.y + (target.y - node.y) * t
              
              particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 1,
                maxLife: 1,
                color: '#3b82f6',
                size: Math.random() * 3 + 1,
                type: 'data'
              })
            }
          }
        })
      })

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.015

        if (particle.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.globalAlpha = particle.life
        ctx.fillStyle = particle.color
        
        if (particle.type === 'data') {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (particle.type === 'emotion') {
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
        } else {
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particle.x + particle.size, particle.y - particle.size)
          ctx.lineTo(particle.x - particle.size, particle.y - particle.size)
          ctx.closePath()
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      // Draw floating emotion indicators
      zones.forEach((zone, index) => {
        const orbX = 50 + (index % 2) * 120
        const orbY = 50 + Math.floor(index / 2) * 100
        
        // Pulsing emotion orb
        const pulse = Math.sin(time * 2 + index) * 0.3 + 1
        ctx.fillStyle = `rgba(147, 197, 253, ${0.4 + Math.sin(time + index) * 0.2})`
        ctx.beginPath()
        ctx.arc(orbX, orbY, 18 * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Emotion text
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(zone.dominant_emotion, orbX, orbY + 4)

        // Generate emotion particles
        if (Math.random() > 0.9) {
          particles.push({
            x: orbX + (Math.random() - 0.5) * 30,
            y: orbY + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            maxLife: 1,
            color: '#93c5fd',
            size: Math.random() * 3 + 2,
            type: 'emotion'
          })
        }
      })

      // Draw city mood indicator
      const moodX = canvas.width - 80
      const moodY = 60
      
      // Mood ring effect
      const moodHue = 120 + (cityMoodIndex - 50) * 2.4 // Green to red
      ctx.fillStyle = `hsl(${moodHue}, 70%, 60%)`
      ctx.beginPath()
      ctx.arc(moodX, moodY, 25 + Math.sin(time * 2) * 5, 0, Math.PI * 2)
      ctx.fill()

      // Mood text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(cityMoodIndex.toString(), moodX, moodY + 5)

      // City pulse indicator
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('CITY PULSE', moodX, moodY + 25)

      // Generate mood particles
      if (Math.random() > 0.85) {
        particles.push({
          x: moodX + (Math.random() - 0.5) * 40,
          y: moodY + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 1,
          maxLife: 1,
          color: `hsl(${moodHue}, 70%, 60%)`,
          size: Math.random() * 4 + 2,
          type: 'mood'
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isClient, zones, cityMoodIndex])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-2 text-blue-300">Loading data flow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-64 w-full rounded-lg overflow-hidden border border-indigo-600 bg-gradient-to-br from-indigo-900 to-purple-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Title */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-2">
        <h3 className="text-white font-bold text-sm">🌊 Data Flow Network</h3>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-2 text-center">
        <p className="text-blue-300 text-xs">
          ✨ Watch the data flow between zones • Hover for connections • See the city pulse!
        </p>
      </div>
    </div>
  )
}
