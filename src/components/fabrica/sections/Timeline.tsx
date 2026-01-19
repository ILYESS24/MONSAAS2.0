import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const milestones = [
  {
    year: "2020",
    logo: ":: Fourpoints",
    title: "Founded to rethink how technology solves real problems",
    color: "from-cyan-400 via-blue-500 to-purple-500"
  },
  {
    year: "2023",
    logo: "◐",
    title: "Launched our first scalable platform",
    color: "from-purple-500 via-pink-500 to-red-500"
  },
  {
    year: "2024",
    logo: "◑ CoreOS",
    title: "Released Fourpoints, our AI framework",
    color: "from-red-500 via-orange-500 to-yellow-500"
  },
  {
    year: "2025",
    logo: "◗ Shutterframe",
    title: "Introduced Shutterframe for creative industries",
    color: "from-cyan-400 via-teal-400 to-green-400"
  }
];

const Timeline = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const lineProgress = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen w-full bg-black relative py-20 overflow-hidden"
    >
      {/* Geometric grid - crosses at intersections */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-white/5"
            style={{ left: `${20 * (i + 1)}%` }}
          />
        ))}
        {[...Array(3)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-white/5"
            style={{ top: `${25 * (i + 1)}%` }}
          />
        ))}
        {/* Crosses at intersections */}
        {[1, 2, 3, 4].map((col) =>
          [1, 2, 3].map((row) => (
            <div
              key={`cross-${col}-${row}`}
              className="absolute w-3 h-3"
              style={{
                left: `${20 * col}%`,
                top: `${25 * row}%`,
                transform: "translate(-50%, -50%)"
              }}
            >
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
            </div>
          ))
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Timeline Container */}
        <div className="relative">
          {/* Gradient Line */}
          <motion.div
            className="absolute left-0 right-0 h-1 top-1/2 -translate-y-1/2 overflow-hidden rounded-full"
            style={{ opacity: lineProgress }}
          >
            <motion.div
              className="h-full w-full bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 via-orange-500 to-green-400"
              style={{
                scaleX: lineProgress,
                transformOrigin: "left"
              }}
            />
          </motion.div>

          {/* Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                viewport={{ once: true, amount: 0.3 }}
                className="relative pt-8"
              >
                {/* Gradient line segment */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${milestone.color} rounded-full`}
                />

                {/* Content */}
                <div className="mt-12">
                  {/* Year */}
                  <motion.h3
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.15 + 0.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-4"
                  >
                    {milestone.year}
                  </motion.h3>

                  {/* Logo indicator */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.15 + 0.3,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-sm font-body text-white/70 mb-8 flex items-center gap-2"
                  >
                    <span className="font-medium">{milestone.logo}</span>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.15 + 0.4,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-xs font-body tracking-[0.15em] uppercase text-white/50 leading-relaxed"
                  >
                    {milestone.title}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
