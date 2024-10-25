import {
  Pencil,
  Circle,
  Square,
  Minus,
  Move,
  Eraser
} from 'lucide-react'

export const tools = [
  { name: 'pencil', icon: Pencil, cursor: 'crosshair' },
  { name: 'circle', icon: Circle, cursor: 'crosshair' },
  { name: 'square', icon: Square, cursor: 'crosshair' },
  { name: 'line', icon: Minus, cursor: 'crosshair' },
  { name: 'move', icon: Move, cursor: 'move' },
  { name: 'eraser', icon: Eraser, cursor: 'crosshair' },
]

export const colorPalette = ['#1e1e1e', '#2f9e44', '#0c8599', '#1971c2', '#099268']
