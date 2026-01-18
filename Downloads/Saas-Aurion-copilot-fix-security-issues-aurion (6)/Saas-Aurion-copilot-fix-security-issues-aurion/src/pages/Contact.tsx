import React, { useState } from "react";
import { LegalLayout } from "../components/layout/LegalLayout";
import { Send, CheckCircle, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic to send email would go here
  };

  if (submitted) {
    return (
      <LegalLayout title="Contactez-nous" subtitle="Nous aimerions avoir de vos nouvelles.">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white">Message envoyé !</h2>
          <p className="text-gray-300 max-w-md">
            Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          >
            Envoyer un autre message
          </button>
        </div>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Contactez-nous" subtitle="Des questions ? Nous sommes là pour aider.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white text-white placeholder-gray-400 transition-all"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
              <textarea
                id="message"
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white text-white placeholder-gray-400 transition-all resize-none"
                placeholder="Comment pouvons-nous vous aider ?"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Envoyer le message
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Informations de contact</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                <Mail size={20} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Email</h3>
                <p className="text-gray-300 text-sm mb-1">Notre équipe amicale est là pour vous aider.</p>
                <a href="mailto:contact@aurion.ai" className="text-white font-medium hover:underline">contact@aurion.ai</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                <MapPin size={20} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Bureau</h3>
                <p className="text-gray-300 text-sm mb-1">Venez nous dire bonjour à notre QG.</p>
                <p className="text-white font-medium">123 Boulevard IA, Paris, France</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                <Phone size={20} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Téléphone</h3>
                <p className="text-gray-300 text-sm mb-1">Lun-Ven de 9h à 18h.</p>
                <p className="text-white font-medium">+33 (0)1 23 45 67 89</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <h3 className="font-bold mb-2 text-white">Support</h3>
            <p className="text-gray-300 text-sm mb-4">
              Vous cherchez du support technique ? Visitez notre Centre d'Aide pour la documentation et les FAQs.
            </p>
            <a href="/help" className="text-sm font-bold text-white hover:underline">Visiter le Centre d'Aide →</a>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}

