import { useState, useEffect, useRef } from 'react'
import { ZoneData } from '../types/cityPulse'

interface CityMapProps {
  zones: ZoneData[]
  onZoneSelect: (zone: ZoneData | null) => void
  selectedZone: ZoneData | null
  selectedCity?: string
}

interface Building {
  x: number
  y: number
  width: number
  height: number
  zone: ZoneData
  pulse: number
  glow: number
}

export default function CityMap({ zones, onZoneSelect, selectedZone, selectedCity }: CityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [hoveredZone, setHoveredZone] = useState<number | null>(null)
  const [time, setTime] = useState(0)

  // Generate buildings with better positioning and visibility
  const generateBuildings = (): Building[] => {
    const buildings: Building[] = []
    const canvas = canvasRef.current
    if (!canvas) return buildings

    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    
    // Ensure all buildings are visible with proper spacing
    const buildingWidth = 80
    const buildingHeight = 120
    const spacing = 100
    
    zones.forEach((zone, index) => {
      const row = Math.floor(index / 3)
      const col = index % 3
      
      const x = 50 + col * (buildingWidth + spacing)
      const y = canvasHeight - 200 - row * (buildingHeight + 60) // Ensure visibility from bottom
      
      buildings.push({
        x,
        y,
        width: buildingWidth,
        height: buildingHeight,
        zone,
        pulse: 1,
        glow: 0.5
      })
    })
    
    return buildings
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with proper scaling
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const buildings = generateBuildings()

    // Animation loop
    const animate = () => {
      setTime(prev => prev + 0.016)
      
      // Clear canvas with professional gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#f8fafc') // Light gray top
      gradient.addColorStop(0.3, '#e2e8f0') // Medium gray
      gradient.addColorStop(1, '#cbd5e1') // Darker gray bottom
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw professional grid lines
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      
      // Vertical grid lines
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      // Horizontal grid lines
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      
      ctx.setLineDash([])

      // Draw city skyline base
      ctx.fillStyle = '#475569'
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

      // Animate and draw buildings with enterprise-grade styling
      buildings.forEach((building, index) => {
        const zone = building.zone
        building.pulse = Math.sin(time * 2 + index) * 0.05 + 1
        building.glow = Math.sin(time * 3 + index) * 0.3 + 0.7

        // Building shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.fillRect(building.x + 3, building.y + 3, building.width, building.height)

        // Building base with professional colors
        const isSelected = selectedZone?.zone_id === zone.zone_id
        const isHovered = hoveredZone === zone.zone_id

        // Professional color scheme based on mood
        let buildingColor = '#64748b' // Default slate
        if (zone.current_mood_index >= 75) buildingColor = '#059669' // Green for high mood
        else if (zone.current_mood_index >= 60) buildingColor = '#0891b2' // Blue for good mood
        else if (zone.current_mood_index >= 45) buildingColor = '#d97706' // Orange for neutral
        else buildingColor = '#dc2626' // Red for low mood

        // Selection and hover effects
        if (isSelected) {
          ctx.shadowColor = '#3b82f6'
          ctx.shadowBlur = 15
          ctx.strokeStyle = '#3b82f6'
          ctx.lineWidth = 3
        } else if (isHovered) {
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 10
          ctx.strokeStyle = '#f59e0b'
          ctx.lineWidth = 2
        } else {
          ctx.shadowBlur = 0
          ctx.strokeStyle = 'transparent'
        }

        // Main building
        ctx.fillStyle = buildingColor
        ctx.fillRect(
          building.x,
          building.y,
          building.width * building.pulse,
          building.height * building.pulse
        )

        // Building outline
        ctx.strokeRect(
          building.x,
          building.y,
          building.width * building.pulse,
          building.height * building.pulse
        )

        // Professional building highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fillRect(
          building.x + 2,
          building.y + 2,
          building.width * building.pulse * 0.3,
          building.height * building.pulse * 0.3
        )

        // Professional window grid
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        const windowSize = 6
        const windowSpacing = 15
        
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 6; j++) {
            if (Math.random() > 0.2) { // More windows for professional look
              ctx.fillRect(
                building.x + 10 + i * windowSpacing,
                building.y + 10 + j * windowSpacing,
                windowSize,
                windowSize
              )
            }
          }
        }

        // Zone label with professional typography
        ctx.fillStyle = '#1e293b'
        ctx.font = '600 13px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          zone.zone_name,
          building.x + building.width / 2,
          building.y + building.height + 18
        )

        // Mood indicator with professional styling
        const moodRadius = 10
        ctx.fillStyle = buildingColor
        ctx.beginPath()
        ctx.arc(
          building.x + building.width / 2,
          building.y + building.height + 35,
          moodRadius,
          0,
          Math.PI * 2
        )
        ctx.fill()

        // Mood value with professional typography
        ctx.fillStyle = '#374151'
        ctx.font = '700 12px Inter, system-ui, sans-serif'
        ctx.fillText(
          zone.current_mood_index.toString(),
          building.x + building.width / 2,
          building.y + building.height + 52
        )

        // Professional data flow indicators
        if (isHovered || isSelected) {
          ctx.strokeStyle = buildingColor
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          
          // Draw connection lines to other buildings
          buildings.forEach((otherBuilding, otherIndex) => {
            if (index !== otherIndex) {
              ctx.beginPath()
              ctx.moveTo(
                building.x + building.width / 2,
                building.y + building.height / 2
              )
              ctx.lineTo(
                otherBuilding.x + otherBuilding.width / 2,
                otherBuilding.y + otherBuilding.height / 2
              )
              ctx.stroke()
            }
          })
          
          ctx.setLineDash([])
        }
      })

      // Professional city pulse line
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      
      const pulseY = canvas.height - 60 + Math.sin(time * 2) * 8
      ctx.moveTo(0, pulseY)
      
      for (let x = 0; x < canvas.width; x += 15) {
        const y = pulseY + Math.sin(time * 1.5 + x * 0.02) * 10
        ctx.lineTo(x, y)
      }
      
      ctx.stroke()

      // Professional floating metrics
      zones.forEach((zone, index) => {
        const orbX = 30 + (index % 2) * 120
        const orbY = 30 + Math.floor(index / 2) * 80
        
        // Metric orb background
        ctx.fillStyle = `rgba(59, 130, 246, ${0.1 + Math.sin(time + index) * 0.05})`
        ctx.beginPath()
        ctx.arc(orbX, orbY, 20, 0, Math.PI * 2)
        ctx.fill()
        
        // Metric orb border
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Metric value
        ctx.fillStyle = '#1e40af'
        ctx.font = '700 14px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(zone.post_count.toString(), orbX, orbY + 4)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [zones, selectedZone, hoveredZone, selectedCity, time])

  // Handle canvas interactions
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check which building was clicked
    const buildings = generateBuildings()
    for (const building of buildings) {
      if (
        x >= building.x &&
        x <= building.x + building.width &&
        y >= building.y &&
        y <= building.y + building.height
      ) {
        onZoneSelect(building.zone)
        return
      }
    }
    
    // Click outside buildings - deselect
    onZoneSelect(null)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check which building is hovered
    const buildings = generateBuildings()
    let hovered = null
    
    for (const building of buildings) {
      if (
        x >= building.x &&
        x <= building.x + building.width &&
        y >= building.y &&
        y <= building.y + building.height
      ) {
        hovered = building.zone.zone_id
        break
      }
    }
    
    setHoveredZone(hovered)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">City Zone Visualization</h3>
          <p className="text-sm text-gray-600">
            Interactive building map showing zone mood indicators and social activity
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">High Mood</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Good Mood</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Neutral</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Low Mood</span>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 border border-gray-200 rounded-lg cursor-pointer"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        />
        
        {/* Professional Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Click on buildings</span> to select zones • 
            <span className="font-medium"> Hover</span> to see connections • 
            <span className="font-medium"> Colors</span> indicate mood levels
          </p>
        </div>
      </div>
    </div>
  )
}
