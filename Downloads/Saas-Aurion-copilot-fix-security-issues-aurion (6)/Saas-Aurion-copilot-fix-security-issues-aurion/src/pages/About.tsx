import React from "react";
import { LegalLayout } from "../components/layout/LegalLayout";

export default function About() {
  return (
    <LegalLayout
      title="À propos"
      subtitle="Nous construisons l'avenir de l'expression créative."
    >
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-white">Notre Mission</h2>
        <p className="text-xl text-gray-300 leading-relaxed">
          Chez AURION, nous croyons que la créativité est un droit humain fondamental. Notre mission est de démocratiser l'accès aux outils de création avancés, permettant à chacun - indépendamment de ses compétences techniques - de donner vie à ses idées les plus folles grâce à la puissance de l'intelligence artificielle.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl h-64 overflow-hidden border border-white/10">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
            alt="Équipe travaillant"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-4 text-white">Qui sommes-nous</h3>
          <p className="text-gray-300 mb-6">
            Fondée en 2024, AURION est une équipe d'ingénieurs, d'artistes et de chercheurs passionnés par l'intersection entre technologie et art.
          </p>
          <div className="flex gap-8">
            <div>
              <span className="block text-3xl font-bold text-white">20+</span>
              <span className="text-sm text-gray-400">Membres équipe</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-white">10k+</span>
              <span className="text-sm text-gray-400">Créateurs</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-white">1M+</span>
              <span className="text-sm text-gray-400">Générations</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-white">Nos Valeurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="font-bold mb-2 text-white">Innovation d'abord</h3>
            <p className="text-sm text-gray-400">Nous repoussons les limites du possible avec l'IA générative chaque jour.</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="font-bold mb-2 text-white">Créateur centré</h3>
            <p className="text-sm text-gray-400">Nous créons des outils qui autonomisent les artistes, pas qui les remplacent.</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="font-bold mb-2 text-white">IA éthique</h3>
            <p className="text-sm text-gray-400">Nous nous engageons pour un développement responsable de l'IA, la sécurité et la transparence.</p>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}

