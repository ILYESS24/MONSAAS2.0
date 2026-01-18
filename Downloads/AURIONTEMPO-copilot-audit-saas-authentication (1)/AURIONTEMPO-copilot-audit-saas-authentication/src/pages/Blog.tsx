import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Calendar, Clock } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";

const blogPosts = [
  {
    title: "L'avenir du développement web avec l'IA",
    excerpt: "Comment l'intelligence artificielle transforme la façon dont nous créons des applications web et accélère le processus de développement.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    date: "15 Jan 2026",
    readTime: "5 min",
    category: "Intelligence Artificielle",
  },
  {
    title: "Design Systems: Construire pour l'évolutivité",
    excerpt: "Les meilleures pratiques pour créer un design system robuste qui s'adapte à la croissance de votre entreprise.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    date: "10 Jan 2026",
    readTime: "8 min",
    category: "Design",
  },
  {
    title: "Performance Web: Guide Complet 2026",
    excerpt: "Optimisez vos applications pour des temps de chargement ultra-rapides et une expérience utilisateur fluide.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    date: "5 Jan 2026",
    readTime: "12 min",
    category: "Performance",
  },
  {
    title: "Introduction à WebGL et les Shaders",
    excerpt: "Apprenez à créer des effets visuels spectaculaires avec WebGL pour des expériences web immersives.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    date: "28 Dec 2025",
    readTime: "15 min",
    category: "Développement",
  },
  {
    title: "Le pouvoir du minimalisme en UI/UX",
    excerpt: "Moins c'est plus: comment le design minimaliste améliore l'expérience utilisateur et la conversion.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    date: "20 Dec 2025",
    readTime: "6 min",
    category: "Design",
  },
  {
    title: "Sécurité des Applications Modernes",
    excerpt: "Les pratiques essentielles pour protéger vos applications et les données de vos utilisateurs.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    date: "15 Dec 2025",
    readTime: "10 min",
    category: "Sécurité",
  },
];

const Blog = () => {
  return (
    <div className="relative min-h-screen bg-black text-white font-body">
      <LavaLampBackground />
      
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto">
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

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Blog
            </h1>
            <p className="text-xl text-white/60 max-w-2xl">
              Découvrez nos derniers articles sur le design, le développement, 
              et les tendances technologiques.
            </p>
          </motion.div>

          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.07] transition-colors cursor-pointer">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-sm text-white/40 mb-2">{blogPosts[0].category}</span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 group-hover:text-white/90 transition-colors">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-white/60 mb-6 leading-relaxed">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {blogPosts[0].date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {blogPosts[0].readTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-colors cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs text-white/40 mb-2 block">{post.category}</span>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-white/90 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
