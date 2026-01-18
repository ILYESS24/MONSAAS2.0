import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const TeamCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 flex items-stretch gap-3 md:gap-4 w-full max-w-[320px] md:max-w-[380px] shadow-2xl"
    >
      {/* Profile Image */}
      <div className="flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
          alt="Lauren Thompson"
          className="w-20 h-24 md:w-24 md:h-28 object-cover rounded-xl"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between py-0.5 flex-1">
        <div>
          <p className="text-gray-500 text-[10px] md:text-xs font-medium font-body">Team Lead</p>
          <p className="text-gray-400 text-[9px] md:text-[10px] font-body">at fabrica®</p>
        </div>
        <h3 className="text-gray-900 text-base md:text-lg font-bold leading-tight font-body">
          Lauren Thompson
        </h3>
        <motion.button
          className="flex items-center gap-2 bg-gray-900 text-white text-[10px] md:text-xs font-medium px-3 py-2 rounded-lg md:rounded-xl w-fit font-body"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Let's talk
          <span className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full flex items-center justify-center">
            <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-900" />
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TeamCard;
