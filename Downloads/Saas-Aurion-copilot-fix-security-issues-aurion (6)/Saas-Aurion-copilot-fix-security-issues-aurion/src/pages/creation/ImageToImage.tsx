/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Upload, Image as ImageIcon, Send, Sliders, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ImageToImage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (!prompt || !selectedImage) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="h-full bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full h-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Image to Image</h1>
            <p className="text-gray-500">Transform existing images with AI</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
            <Sliders size={16} />
            Settings
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Area */}
          <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 relative flex flex-col items-center justify-center p-8 transition-colors hover:bg-gray-100/50">
            {selectedImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={selectedImage} 
                  alt="Upload" 
                  className="w-full h-full object-contain rounded-2xl" 
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <Upload size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload an image</h3>
                <p className="text-gray-500 text-center max-w-xs mb-6">
                  Drag and drop or click to upload an image to start transforming it.
                </p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button className="px-6 py-3 bg-black text-white rounded-full font-medium pointer-events-none">
                  Choose File
                </button>
              </>
            )}
          </div>

          {/* Result Area */}
          <div className="bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center">
             <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <ImageIcon size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400">Generated image will appear here</p>
             </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-2 rounded-full shadow-lg flex items-center gap-2 max-w-3xl w-full mx-auto">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
            <ImageIcon size={20} />
          </div>
          <input
            type="text"
            placeholder="Describe how to transform the image..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || !selectedImage}
            className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>Processing...</>
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

