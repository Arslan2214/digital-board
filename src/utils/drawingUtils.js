export function drawShape(ctx, shape) {
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

export function isPointInsideShape(point, shape, tolerance) {
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
