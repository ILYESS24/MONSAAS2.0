import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const services = [
  "Code Editor",
  "Intelligent Canvas",
  "Text Editor",
  "App Builder",
  "Agent AI",
  "Aurion Chat",
];

const ServiceList = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service: string) => {
    // Set flag to trigger cursor reveal animation on tool page
    sessionStorage.setItem('showCursorReveal', 'true');
    
    if (service === "Code Editor") {
      navigate('/code-editor');
    } else if (service === "Intelligent Canvas") {
      navigate('/intelligent-canvas');
    } else if (service === "App Builder") {
      navigate('/app-builder');
    } else if (service === "Text Editor") {
      navigate('/text-editor');
    } else if (service === "Agent AI") {
      navigate('/agent-ai');
    } else if (service === "Aurion Chat") {
      navigate('/aurion-chat');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex flex-col gap-2 md:gap-3 text-right"
    >
      {services.map((service, index) => (
        <motion.div
          key={service}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => handleServiceClick(service)}
        >
          <motion.span
            className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed block font-body"
            whileHover={{ x: -8 }}
            transition={{ duration: 0.2 }}
          >
            {service}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ServiceList;
