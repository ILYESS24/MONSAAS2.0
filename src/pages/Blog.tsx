/**
 * Blog Page - Aurion Studio
 * 
 * SEO Keywords: blog développement, tutoriels IA, guides SaaS,
 * actualités tech, bonnes pratiques code, performance web
 * 
 * Optimisé pour le SEO avec schema markup et conversion newsletter.
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, Search, Tag } from "lucide-react";
import LavaLampBackground from "@/components/fabrica/LavaLampBackground";
import { useState } from "react";
import { SEO, seoConfigs } from "@/components/common/SEO";

const blogPosts = [
  {
    title: "Comment l'IA va transformer votre workflow de développement en 2026",
    excerpt: "Découvrez 7 façons concrètes d'utiliser l'intelligence artificielle pour coder 3x plus vite sans sacrifier la qualité.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    date: "15 Jan 2026",
    readTime: "5 min",
    category: "Intelligence Artificielle",
    featured: true,
    tags: ["IA", "Productivité", "Tendances"],
  },
  {
    title: "Design System : Le guide ultime pour scaler votre UI",
    excerpt: "Comment construire un design system robuste qui grandit avec votre startup. Exemples concrets et templates inclus.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    date: "10 Jan 2026",
    readTime: "8 min",
    category: "Design",
    tags: ["UI/UX", "Design System", "Scalabilité"],
  },
  {
    title: "Performance Web en 2026 : Core Web Vitals et au-delà",
    excerpt: "Votre site est-il vraiment rapide ? Audit complet avec checklist et outils gratuits pour atteindre un score 100/100.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    date: "5 Jan 2026",
    readTime: "12 min",
    category: "Performance",
    tags: ["SEO", "Performance", "Optimisation"],
  },
  {
    title: "WebGL + Three.js : Créez des expériences 3D époustouflantes",
    excerpt: "Tutoriel pas-à-pas pour intégrer des visualisations 3D interactives dans vos projets React. Code source inclus.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    date: "28 Dec 2025",
    readTime: "15 min",
    category: "Développement",
    tags: ["3D", "WebGL", "React"],
  },
  {
    title: "Minimalisme UI : Pourquoi moins = plus de conversions",
    excerpt: "Étude de cas : comment un redesign minimaliste a augmenté les conversions de 47%. Principes et exemples.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    date: "20 Dec 2025",
    readTime: "6 min",
    category: "Design",
    tags: ["UI/UX", "Conversion", "Minimalisme"],
  },
  {
    title: "Sécurité SaaS : Le guide anti-failles de A à Z",
    excerpt: "Les 10 vulnérabilités les plus courantes et comment les éviter. Checklist de sécurité pour développeurs.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    date: "15 Dec 2025",
    readTime: "10 min",
    category: "Sécurité",
    tags: ["Sécurité", "DevOps", "Bonnes pratiques"],
  },
];

const categories = ["Tous", "Intelligence Artificielle", "Design", "Performance", "Développement", "Sécurité"];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-black text-white font-body">
      {/* SEO Component */}
      <SEO {...seoConfigs.blog} />
      
      <LavaLampBackground />
      
      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Blog Aurion Studio",
        "description": "Tutoriels, guides et actualités sur le développement web, l'IA, le design et les bonnes pratiques SaaS.",
        "url": "https://aurion.studio/blog",
        "publisher": {
          "@type": "Organization",
          "name": "Aurion Studio"
        }
      })}} />
      
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-[#D4FF00]/10 text-[#D4FF00] text-sm font-medium rounded-full mb-6">
              📚 Ressources gratuites pour développeurs
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Le Blog
            </h1>
            <p className="text-xl text-white/70 max-w-2xl">
              Tutoriels actionables, études de cas, et insights sur le développement moderne.
              <strong className="text-white"> Pas de blabla, que du concret.</strong>
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8 space-y-4"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4FF00]/50"
              />
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-[#D4FF00] text-black font-medium'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Post */}
          {filteredPosts.length > 0 && filteredPosts[0].featured && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <div className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.07] hover:border-[#D4FF00]/30 transition-all cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto relative">
                    <img
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#D4FF00] text-black text-xs font-bold px-3 py-1 rounded-full">
                        À LA UNE
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="text-sm text-[#D4FF00] mb-2">{filteredPosts[0].category}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 group-hover:text-[#D4FF00] transition-colors">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="text-white/60 mb-6 leading-relaxed">{filteredPosts[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-white/40">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {filteredPosts[0].date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {filteredPosts[0].readTime} de lecture
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {filteredPosts[0].tags?.map((tag) => (
                        <span key={tag} className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredPosts.slice(1).map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] hover:border-[#D4FF00]/30 transition-all cursor-pointer"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs bg-black/60 backdrop-blur text-white px-2 py-1 rounded">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#D4FF00] transition-colors line-clamp-2">
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
                    <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-[#D4FF00] transition-colors" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-[#D4FF00]/10 to-transparent border border-[#D4FF00]/20 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              📬 Restez à la pointe
            </h2>
            <p className="text-white/60 mb-6 max-w-xl mx-auto">
              Recevez nos meilleurs articles, tutoriels exclusifs et ressources gratuites 
              directement dans votre boîte mail. <strong className="text-white">1 email/semaine, 0 spam.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4FF00]/50"
              />
              <button className="px-6 py-3 bg-[#D4FF00] text-black font-semibold rounded-xl hover:bg-[#E5FF4D] transition-colors whitespace-nowrap">
                S'inscrire gratuitement
              </button>
            </div>
            <p className="text-xs text-white/40 mt-4">
              Rejoignez 10 000+ développeurs. Désabonnement en 1 clic.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
