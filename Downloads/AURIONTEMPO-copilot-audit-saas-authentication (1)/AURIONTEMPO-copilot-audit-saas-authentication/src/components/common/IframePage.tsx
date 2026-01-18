/**
 * IframePage Component
 * 
 * A reusable page layout for iframe-based tools.
 * This eliminates code duplication across all iframe pages.
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SecureIframe } from "./SecureIframe";

interface IframePageProps {
  title: string;
  src: string;
  brandName?: string;
}

export const IframePage: React.FC<IframePageProps> = ({
  title,
  src,
  brandName = "aurion®",
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Header with back button */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between p-4 md:p-6 border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
        </div>

        <div className="text-white font-body text-center">
          <span className="text-white text-base md:text-lg font-medium">{title}</span>
          <span className="text-white/60 ml-2 text-sm hidden sm:inline">{brandName}</span>
        </div>

        <div className="w-16 md:w-24" /> {/* Spacer for centering */}
      </motion.header>

      {/* Secure iframe container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-[calc(100vh-65px)] md:h-[calc(100vh-81px)]"
      >
        <SecureIframe
          src={src}
          title={title}
          className="w-full h-full"
          sandbox={['allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-popups']}
          allowClipboard={true}
        />
      </motion.div>
    </div>
  );
};

export default IframePage;
