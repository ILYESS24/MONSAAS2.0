 
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, Sparkles, Plus, X } from "lucide-react";

export function CreationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      id: "image",
      label: "Image Gen",
      icon: Image,
      color: "bg-purple-600",
      path: "/creation/image",
      delay: 0.05
    },
    {
      id: "video",
      label: "Video Gen",
      icon: Video,
      color: "bg-blue-600",
      path: "/creation/video",
      delay: 0.1
    }
  ];

  return (
    <div className="relative flex items-center gap-2">
      <AnimatePresence>
        {isOpen && (
          <div className="flex items-center gap-3 absolute left-full ml-3 top-0 h-9">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.5 }}
                transition={{ delay: item.delay, type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => navigate(item.path)}
                className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform border border-white/20 relative group`}
                title={item.label}
              >
                <item.icon size={16} className="text-white" />
                {/* Tooltip - POSITIONNÉ À DROITE */}
                <span className="absolute -top-8 left-0 -translate-x-full mr-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleMenu}
        className={`h-9 px-4 rounded-full backdrop-blur-md border text-sm font-medium transition-all flex items-center gap-2 z-10 ${
          isOpen 
            ? "bg-white text-black border-white" 
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        }`}
      >
        <Sparkles size={14} className={isOpen ? "text-purple-600" : "text-yellow-300"} />
        <span>Creation</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={14} /> : <Plus size={14} />}
        </motion.div>
      </button>
    </div>
  );
}
