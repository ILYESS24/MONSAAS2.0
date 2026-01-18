import { useState } from "react";
import { motion } from "framer-motion";

interface PlusIconProps {
  className?: string;
  onClick?: () => void;
}

const PlusIcon = ({ className = "", onClick }: PlusIconProps) => {
  const [isRotated, setIsRotated] = useState(false);

  const handleClick = () => {
    setIsRotated(!isRotated);
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        animate={{ rotate: isRotated ? 45 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <path
          d="M8 1V15M1 8H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.button>
  );
};

export default PlusIcon;
