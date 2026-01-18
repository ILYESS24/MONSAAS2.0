import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Target, Zap, Globe } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";

const teamMembers = [
  {
    name: "Marie Laurent",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "Thomas Dubois",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Sophie Martin",
    role: "Lead Designer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
  {
    name: "Lucas Bernard",
    role: "Full Stack Developer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
];

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque projet, chaque ligne de code.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Toujours à la pointe des dernières technologies et tendances.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Nous travaillons main dans la main avec nos clients.",
  },
  {
    icon: Globe,
    title: "Impact",
    description: "Créer des solutions qui font vraiment la différence.",
  },
];

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white font-body">
      <LavaLampBackground />
      
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              À propos d'aurion<span className="text-lg align-super">®</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl leading-relaxed">
              Nous sommes un studio digital passionné par la création d'expériences 
              numériques exceptionnelles qui transforment les idées en réalité.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-display font-bold mb-6">Notre Mission</h2>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
              <p className="text-lg text-white/80 leading-relaxed">
                Chez Aurion Studio, nous croyons que la technologie doit être au service 
                de la créativité. Notre mission est de fournir des outils innovants qui 
                permettent aux créateurs, développeurs et entrepreneurs de donner vie à 
                leurs visions sans compromis. Nous combinons l'intelligence artificielle, 
                le design moderne et l'expertise technique pour créer des solutions 
                qui dépassent les attentes.
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-display font-bold mb-8">Nos Valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="p-3 bg-white/10 rounded-xl w-fit mb-4">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-white/60">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-display font-bold mb-8">Notre Équipe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-colors">
                    <div className="aspect-square rounded-xl overflow-hidden mb-4">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-white/60">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
