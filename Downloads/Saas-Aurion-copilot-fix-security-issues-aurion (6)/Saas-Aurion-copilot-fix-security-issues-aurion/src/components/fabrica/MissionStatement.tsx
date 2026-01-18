import { motion } from "framer-motion";

const MissionStatement = () => {
  const handleMissionClick = () => {
    alert('🎯 Notre Philosophie\n\n"No generic websites. No empty marketing promises."\n\n💡 Chez AURION :\n• Des outils réels et puissants\n• Des stratégies éprouvées\n• Une croissance business réelle\n• Une marque qui brille\n\n🚀 Des résultats concrets, pas des promesses vides !');
  };

  return (
    <motion.button
      onClick={handleMissionClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="max-w-xs md:max-w-sm bg-transparent border-none cursor-pointer text-left hover:opacity-80 transition-opacity"
    >
      <p className="text-white text-xs md:text-sm leading-relaxed font-body">
        <span className="font-semibold">No generic websites. No empty marketing promises.</span>{" "}
        <span className="text-white/60">
          Just tools and strategies that help your business grow and your brand shine.
        </span>
      </p>
    </motion.button>
  );
};

export default MissionStatement;