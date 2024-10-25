import { useRef, useState, useEffect, useCallback } from "react";
import * as fabric from "fabric";

export default function useCanvas(initialColor) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState(initialColor);
  const [eraseMode, setEraseMode] = useState("normal");
  const [cursor, setCursor] = useState("default");

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight,
      });
      updateBrush("pencil", initialColor);
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [initialColor]);

  const updateBrush = useCallback((currentTool, currentColor) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = ["pencil", "eraser"].includes(currentTool);

    if (currentTool === "eraser") {
      if (eraseMode === "shape") {
        canvas.isDrawingMode = false;
        canvas.off("mouse:down");
        canvas.on("mouse:down", eraseShape);
      } else {
        canvas.off("mouse:down");
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = '#ffffff'; // Set eraser color to white
        canvas.freeDrawingBrush.width = 20;
      }
      setCursor("crosshair");
    } else if (currentTool === "pencil") {
      canvas.off("mouse:down");
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = currentColor;
      setCursor("crosshair");
    } else {
      canvas.off("mouse:down");
      setCursor(currentTool === "move" ? "move" : "crosshair");
    }

    canvas.renderAll();
  }, [eraseMode]);

  const eraseShape = useCallback((options) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const pointer = canvas.getPointer(options.e);
    const objects = canvas.getObjects();

    for (let i = objects.length - 1; i >= 0; i--) {
      if (objects[i].containsPoint(pointer)) {
        canvas.remove(objects[i]);
        canvas.renderAll();
        break;
      }
    }
  }, []);

  useEffect(() => {
    updateBrush(tool, color);
  }, [tool, color, updateBrush]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (options) => {
      if (["circle", "rectangle", "line"].includes(tool)) {
        const pointer = canvas.getPointer(options.e);
        let shape;

        switch (tool) {
          case "circle":
            shape = new fabric.Circle({
              left: pointer.x,
              top: pointer.y,
              radius: 1,
              fill: "transparent",
              stroke: color,
              strokeWidth: 2,
            });
            break;
          case "rectangle":
            shape = new fabric.Rect({
              left: pointer.x,
              top: pointer.y,
              width: 1,
              height: 1,
              fill: "transparent",
              stroke: color,
              strokeWidth: 2,
            });
            break;
          case "line":
            shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
              stroke: color,
              strokeWidth: 2,
            });
            break;
        }

        canvas.add(shape);
        canvas.setActiveObject(shape);
      }
    };

    const handleMouseMove = (options) => {
      if (!canvas.getActiveObject()) return;
      const pointer = canvas.getPointer(options.e);
      const shape = canvas.getActiveObject();

      switch (tool) {
        case "circle":
          const radius = Math.abs(pointer.x - shape.left);
          shape.set({ radius: radius });
          break;
        case "rectangle":
          shape.set({
            width: Math.abs(pointer.x - shape.left),
            height: Math.abs(pointer.y - shape.top),
          });
          break;
        case "line":
          shape.set({ x2: pointer.x, y2: pointer.y });
          break;
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      canvas.discardActiveObject();
      canvas.renderAll();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [tool, color]);

  const clearCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
    }
  }, []);

  const setToolWithBrush = useCallback((newTool) => {
    setTool(newTool);
    updateBrush(newTool, color);
  }, [color, updateBrush]);

  const setEraseModeWithUpdate = useCallback((newEraseMode) => {
    setEraseMode(newEraseMode);
    updateBrush("eraser", color);
  }, [color, updateBrush]);

  return {
    canvasRef,
    tool,
    setTool: setToolWithBrush,
    clearCanvas,
    setEraseMode: setEraseModeWithUpdate,
    setColor,
    cursor,
  };
}