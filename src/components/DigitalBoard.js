'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Pencil,
  Eraser,
  Circle,
  Square,
  Minus,
  Move,
  Trash2,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const tools = [
  { name: 'pencil', icon: Pencil, cursor: 'crosshair' },
  { name: 'circle', icon: Circle, cursor: 'crosshair' },
  { name: 'square', icon: Square, cursor: 'crosshair' },
  { name: 'line', icon: Minus, cursor: 'crosshair' },
  { name: 'move', icon: Move, cursor: 'move' },
]

const colorPalette = ['#1e1e1e', '#2f9e44', '#0c8599', '#1971c2', '#099268']

export default function DigitalBoard() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [tool, setTool] = useState('pencil')
  const [lastPoint, setLastPoint] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  const [shapes, setShapes] = useState([])
  const [freehandPaths, setFreehandPaths] = useState([])
  const [eraseMode, setEraseMode] = useState('shape')
  const [selectedShape, setSelectedShape] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  useEffect(() => {
    redrawCanvas()
  }, [shapes, freehandPaths, canvasSize])

  const getPoint = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e) => {
    const point = getPoint(e)
    setIsDrawing(true)
    setLastPoint(point)
    setStartPoint(point)

    if (tool === 'pencil') {
      setFreehandPaths(prev => [...prev, { color, points: [point] }])
    } else if (tool === 'move') {
      const clickedShape = shapes.find(shape => isPointInsideShape(point, shape, 5))
      if (clickedShape) {
        setSelectedShape(clickedShape)
        setOffset({
          x: point.x - clickedShape.startPoint.x,
          y: point.y - clickedShape.startPoint.y
        })
      }
    } else if (tool === 'eraser') {
      eraseAtPoint(point)
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      if (['circle', 'square', 'line'].includes(tool)) {
        const newShape = { tool, startPoint, endPoint: lastPoint, color }
        setShapes(prev => [...prev, newShape])
      }
      setLastPoint(null)
      setStartPoint(null)
      setSelectedShape(null)
    }
  }

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return

    const currentPoint = getPoint(e)

    if (tool === 'move' && selectedShape) {
      const newStartPoint = {
        x: currentPoint.x - offset.x,
        y: currentPoint.y - offset.y
      }
      const dx = newStartPoint.x - selectedShape.startPoint.x
      const dy = newStartPoint.y - selectedShape.startPoint.y
      
      selectedShape.startPoint = newStartPoint
      selectedShape.endPoint = {
        x: selectedShape.endPoint.x + dx,
        y: selectedShape.endPoint.y + dy
      }
      
      setShapes(prev => prev.map(shape => 
        shape === selectedShape ? selectedShape : shape
      ))
    } else if (tool === 'eraser') {
      eraseAtPoint(currentPoint)
    } else if (tool === 'pencil') {
      setFreehandPaths(prev => {
        const currentPath = prev[prev.length - 1]
        return [...prev.slice(0, -1), { ...currentPath, points: [...currentPath.points, currentPoint] }]
      })
    } else if (['circle', 'square', 'line'].includes(tool)) {
      setLastPoint(currentPoint)
    }

    redrawCanvas()
  }

  const eraseAtPoint = (point) => {
    const eraseRadius = 10

    if (eraseMode === 'shape') {
      setShapes(prev => prev.filter(shape => !isPointInsideShape(point, shape, eraseRadius)))
      setFreehandPaths(prev => prev.filter(path => 
        !path.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < eraseRadius)
      ))
    } else {
      setFreehandPaths(prev => prev.map(path => {
        const newPoints = path.points.filter(p => 
          Math.hypot(p.x - point.x, p.y - point.y) > eraseRadius
        )
        return newPoints.length > 1 ? { ...path, points: newPoints } : null
      }).filter(Boolean))

      // For normal eraser, we'll still remove shapes if they're touched
      setShapes(prev => prev.filter(shape => !isPointInsideShape(point, shape, eraseRadius)))
    }
  }

  const isPointInsideShape = (point, shape, tolerance) => {
    const { tool, startPoint, endPoint } = shape
    switch (tool) {
      case 'circle':
        const radius = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y)
        const distance = Math.hypot(point.x - startPoint.x, point.y - startPoint.y)
        return Math.abs(distance - radius) < tolerance
      case 'square':
        const minX = Math.min(startPoint.x, endPoint.x) - tolerance
        const maxX = Math.max(startPoint.x, endPoint.x) + tolerance
        const minY = Math.min(startPoint.y, endPoint.y) - tolerance
        const maxY = Math.max(startPoint.y, endPoint.y) + tolerance
        return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
      case 'line':
        const lineLength = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y)
        const d1 = Math.hypot(point.x - startPoint.x, point.y - startPoint.y)
        const d2 = Math.hypot(point.x - endPoint.x, point.y - endPoint.y)
        return Math.abs(d1 + d2 - lineLength) < tolerance
      default:
        return false
    }
  }

  const drawShape = (ctx, shape) => {
    const { tool, startPoint, endPoint, color } = shape
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    switch (tool) {
      case 'circle':
        const radius = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y)
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
        break
      case 'square':
        ctx.rect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y)
        break
      case 'line':
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        break
    }
    ctx.stroke()
  }

  const redrawCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw freehand paths
    freehandPaths.forEach(path => {
      ctx.strokeStyle = path.color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(path.points[0].x, path.points[0].y)
      path.points.forEach(point => ctx.lineTo(point.x, point.y))
      ctx.stroke()
    })
    
    // Draw shapes
    shapes.forEach(shape => drawShape(ctx, shape))

    // Draw current shape if drawing
    if (isDrawing && ['circle', 'square', 'line'].includes(tool)) {
      drawShape(ctx, { tool, startPoint, endPoint: lastPoint, color })
    }
  }

  const clearCanvas = () => {
    setShapes([])
    setFreehandPaths([])
  }

  const getCursor = () => {
    if (tool === 'eraser') {
      return 'crosshair'
    }
    return tools.find(t => t.name === tool)?.cursor || 'default'
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          {tools.map((t) => (
            <Button
              key={t.name}
              onClick={() => setTool(t.name)}
              variant={tool === t.name ? 'default' : 'outline'}
            >
              <t.icon className="w-5 h-5" />
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={tool === 'eraser' ? 'default' : 'outline'}>
                <Eraser className="w-5 h-5 mr-1" />
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setTool('eraser'); setEraseMode('shape'); }}>
                Erase Shape
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTool('eraser'); setEraseMode('normal'); }}>
                Normal Eraser
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          {colorPalette.map((paletteColor) => (
            <Button
              key={paletteColor}
              className="w-8 h-8 p-0"
              style={{ backgroundColor: paletteColor }}
              onClick={() => setColor(paletteColor)}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8"
          />
        </div>
        <Button onClick={clearCanvas}>
          <Trash2 className="w-5 h-5 mr-1" />
          Clear
        </Button>
      </div>
      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          style={{ cursor: getCursor() }}
          className="absolute top-0 left-0 w-full h-full border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  )
}