import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const services = [
  {
    name: "Code Editor",
    route: "/dashboard/code",
    description: "Éditeur de code IA avec suggestions intelligentes",
    action: "Coder avec IA"
  },
  {
    name: "Intelligent Canvas",
    route: "/dashboard/images",
    description: "Génération d'images par intelligence artificielle",
    action: "Créer des images"
  },
  {
    name: "Text Editor",
    route: "/dashboard/ai",
    description: "Assistant d'écriture et de rédaction IA",
    action: "Rédiger avec IA"
  },
  {
    name: "App Builder",
    route: "/dashboard/apps",
    description: "Créateur d'applications sans code",
    action: "Construire des apps"
  },
  {
    name: "Agent AI",
    route: "/dashboard/agents",
    description: "Agents automatisés pour vos tâches",
    action: "Automatiser"
  },
];

const ServiceList = () => {
  const navigate = useNavigate();

  const handleServiceClick = (route: string, action: string) => {
    console.log(`${action} - Redirection vers ${route}`);
    // Redirection vers le dashboard avec les vrais outils connectés
    window.location.href = route;
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
          key={service.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => handleServiceClick(service.route, service.action)}
        >
          <motion.span
            className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed block font-body"
            whileHover={{ x: -8 }}
            transition={{ duration: 0.2 }}
          >
            {service.name}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ServiceList;