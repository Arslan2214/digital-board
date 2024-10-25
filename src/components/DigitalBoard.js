'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Pencil,
  Circle,
  Square,
  Minus,
  Move,
  Eraser,
  Trash2,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useCanvas from '@/hooks/useCanvas'

const tools = [
  { name: 'pencil', icon: Pencil },
  { name: 'circle', icon: Circle },
  { name: 'rectangle', icon: Square },
  { name: 'line', icon: Minus },
  { name: 'move', icon: Move },
]

const colorPalette = ['#1e1e1e', '#2f9e44', '#0c8599', '#1971c2', '#099268']

export default function DigitalBoard() {
  const {
    canvasRef,
    tool,
    setTool,
    clearCanvas,
    setEraseMode,
    setColor,
    cursor,
  } = useCanvas('#000000')

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
          className="absolute top-0 left-0 w-full h-full border border-gray-300 rounded-lg"
          style={{ cursor: cursor }}
        />
      </div>
    </div>
  )
}
