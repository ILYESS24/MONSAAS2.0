/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Pen, Eraser, RotateCcw, Download, Image as ImageIcon, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function SketchToImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = tool === 'pen' ? 3 : 20;
    ctx.strokeStyle = tool === 'pen' ? '#000000' : '#FFFFFF';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="h-full bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full h-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sketch to Image</h1>
            <p className="text-gray-500">Draw a rough sketch and let AI refine it</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTool('pen')}
              className={`p-3 rounded-xl transition-colors ${tool === 'pen' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Pen size={20} />
            </button>
            <button 
              onClick={() => setTool('eraser')}
              className={`p-3 rounded-xl transition-colors ${tool === 'eraser' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Eraser size={20} />
            </button>
            <button 
              onClick={clearCanvas}
              className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="bg-white shadow-lg rounded-xl cursor-crosshair"
          />
        </div>

        <div className="bg-white border border-gray-200 p-2 rounded-full shadow-lg flex items-center gap-2 max-w-3xl w-full mx-auto">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
            <ImageIcon size={20} />
          </div>
          <input
            type="text"
            placeholder="Describe what you drew..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Send size={16} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

