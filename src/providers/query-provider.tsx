import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';

// Configuration optimisée pour la production
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Données considérées fraîches pendant 5 minutes
      staleTime: 1000 * 60 * 5,
      
      // Garder en cache pendant 30 minutes
      gcTime: 1000 * 60 * 30,
      
      // Réessayer 2 fois en cas d'échec
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Désactiver le refetch automatique pour de meilleures performances
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      
      // Timeout de 30 secondes
      networkMode: 'online',
    },
    mutations: {
      // Réessayer 1 fois pour les mutations
      retry: 1,
      networkMode: 'online',
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  // Mémoiser le client pour éviter les re-créations
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
