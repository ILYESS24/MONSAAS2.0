import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Tool data with representative images for each tool
const tools = [
  {
    id: "code-editor",
    title: "Code Editor",
    subtitle: "Intelligent coding environment",
    description: "Write, debug and deploy code with AI-powered suggestions and real-time collaboration.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&q=80",
    link: "/tools/code-editor"
  },
  {
    id: "intelligent-canvas",
    title: "Intelligent Canvas",
    subtitle: "Visual design workspace",
    description: "Design interfaces and visualize ideas with AI-assisted creative tools.",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop&q=80",
    link: "/tools/intelligent-canvas"
  },
  {
    id: "text-editor",
    title: "Text Editor",
    subtitle: "Smart document creation",
    description: "Create and edit documents with intelligent formatting and AI writing assistance.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop&q=80",
    link: "/tools/text-editor"
  },
  {
    id: "app-builder",
    title: "App Builder",
    subtitle: "No-code application development",
    description: "Build full-stack applications without writing code using visual components.",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&q=80",
    link: "/tools/app-builder"
  },
  {
    id: "agent-ai",
    title: "Agent AI",
    subtitle: "Autonomous task automation",
    description: "Deploy AI agents that learn, adapt and execute complex workflows autonomously.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&q=80",
    link: "/tools/agent-ai"
  },
  {
    id: "aurion-chat",
    title: "Aurion Chat",
    subtitle: "Conversational AI interface",
    description: "Interact with powerful AI through natural conversation for any task.",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&h=400&fit=crop&q=80",
    link: "/tools/aurion-chat"
  }
];

const Tools = () => {
  return (
    <section className="min-h-screen w-full bg-black relative py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-xs font-body tracking-[0.2em] uppercase text-white/50 mb-4 block"
            >
              Our Tools
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-white tracking-[-0.02em]"
            >
              POWERFUL
              <br />
              <span className="text-white/40">TOOLS</span>
            </motion.h2>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-white/60 font-body text-base md:text-lg max-w-md leading-relaxed"
          >
            Six integrated tools designed to transform how you work. 
            Each built with precision, powered by AI.
          </motion.p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              viewport={{ once: true, amount: 0.2 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <motion.img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                  
                  {/* Geometric Pattern Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-0 transition-opacity duration-500">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <circle
                        cx="75"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3"
                      />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.2" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.2" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Subtitle */}
                  <span className="text-[10px] font-body tracking-[0.2em] uppercase text-white/40 mb-2 block">
                    {tool.subtitle}
                  </span>
                  
                  {/* Title */}
                  <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-3 group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm font-body text-white/50 leading-relaxed mb-6">
                    {tool.description}
                  </p>
                  
                  {/* Discover Button */}
                  <Link to={tool.link}>
                    <motion.button
                      className="flex items-center gap-2 text-white font-body text-sm font-medium group/btn"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="relative">
                        Discover
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover/btn:w-full transition-all duration-300" />
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tools;
