// Serveur de développement local avec proxy pour Stripe
import express from 'express';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json());

// Mock de l'API Stripe Checkout pour le développement local
app.post('/api/create-checkout', async (req, res) => {
  const { planId, successUrl, cancelUrl, customerEmail } = req.body;
  
  console.log('📦 Demande de checkout reçue:', { planId, customerEmail });
  
  // En développement, on simule une redirection Stripe
  // Dans un vrai environnement, cela créerait une vraie session Stripe
  
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Pour le dev local, on redirige vers une page de simulation
  const mockCheckoutUrl = `${successUrl}&mock=true&plan=${planId}`;
  
  res.json({
    url: mockCheckoutUrl,
    sessionId: `mock_session_${Date.now()}`,
  });
});

// Créer le serveur Vite
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// Utiliser Vite comme middleware
app.use(vite.middlewares);

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur de développement démarré sur http://localhost:${PORT}`);
  console.log(`✅ API Stripe mock disponible sur /api/create-checkout\n`);
});

