import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const articles = [
  {
    date: "September 18, 2025",
    title: "5 Common Mistakes Businesses Make When Adopting AI",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=500&fit=crop",
    size: "small"
  },
  {
    date: "September 18, 2025",
    title: "How to Spot AI Automation Opportunities in Your Workflow",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&q=80",
    size: "large"
  },
  {
    date: "September 3, 2025",
    title: "The Future of Creative AI in Enterprise",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=700&fit=crop&q=80",
    size: "tall"
  },
  {
    date: "August 6, 2025",
    title: "Top 10 AI Tools Every Business Should Consider",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    size: "small"
  }
];

const News = () => {
  return (
    <section className="min-h-screen w-full bg-[#f5f5f5] relative py-20 px-6 md:px-12">
      {/* Geometric grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-black/5" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/5" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-black/5" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="font-display font-black text-6xl md:text-7xl lg:text-8xl text-black tracking-[-0.02em]"
          >
            NEWS
          </motion.h2>

          <motion.a
            href="#"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex items-center gap-2 text-black font-body text-sm font-medium hover:gap-3 transition-all group"
          >
            <span className="underline underline-offset-4">All articles</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.a>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
          {articles.map((article, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              viewport={{ once: true, amount: 0.2 }}
              className={`group cursor-pointer ${
                article.size === "tall" ? "lg:row-span-2" : ""
              } ${article.size === "large" ? "lg:row-span-2" : ""}`}
            >
              {/* Date */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                <span className="text-[10px] font-body tracking-[0.15em] uppercase text-black/50">
                  {article.date}
                </span>
              </div>

              {/* Image Container */}
              <div
                className={`relative overflow-hidden bg-gray-200 mb-4 ${
                  article.size === "tall"
                    ? "aspect-[3/5]"
                    : article.size === "large"
                    ? "aspect-[3/4]"
                    : "aspect-square"
                }`}
              >
                <motion.img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Overlay with geometric lines */}
                <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-0 transition-opacity duration-500">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                      className="opacity-50"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="30"
                      ry="45"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.3"
                      className="opacity-30"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <motion.h3
                className="font-body text-base md:text-lg font-medium text-black leading-tight group-hover:underline underline-offset-4 transition-all"
              >
                {article.title}
              </motion.h3>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
