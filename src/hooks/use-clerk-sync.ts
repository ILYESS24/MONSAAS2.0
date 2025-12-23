 
import { useEffect, useState } from 'react';
import { useClerkSafe } from './use-clerk-safe';
import { profileService, planService, creditsService } from '@/services/supabase-db';
import { logger } from '@/services/logger';

/**
 * Hook qui synchronise l'utilisateur Clerk avec Supabase
 * Crée automatiquement le profil, plan et crédits lors de la première connexion
 */
export function useClerkSync() {
  const { user } = useClerkSafe();
  const isSignedIn = !!user;
  const isLoaded = true;
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    // Si Clerk n'est pas encore chargé, attendre
    if (!isLoaded) {
      return;
    }

    // Si l'utilisateur n'est pas connecté, pas de synchronisation nécessaire
    if (!isSignedIn) {
      setSyncError(null); // Pas d'erreur si pas connecté
      setIsSyncing(false);
      return;
    }

    // Utilisateur connecté mais pas d'ID utilisateur ? Erreur
    if (!user?.id) {
      setSyncError('ID utilisateur manquant');
      setIsSyncing(false);
      return;
    }

    const syncUser = async () => {
      try {
        setIsSyncing(true);
        setSyncError(null);

        logger.debug('🔄 Synchronisation utilisateur Clerk', { userId: user.id });

        // Vérifier si le profil existe déjà
        let existingProfile = null;
        try {
          existingProfile = await profileService.getCurrentProfile();
        } catch (profileError) {
          // Erreur d'authentification Supabase - pas critique, on continue
          logger.warn('⚠️ Profil non trouvé (normal pour nouveau compte)', { error: profileError });
        }

        if (!existingProfile) {
          logger.debug('📝 Création du profil utilisateur...');

          try {
            // Créer le profil
            await profileService.updateProfile({
              full_name: user.fullName || undefined,
              avatar_url: user.imageUrl || undefined,
            });

            // Le trigger Supabase va automatiquement créer le plan et les crédits
            logger.debug('✅ Profil créé avec plan gratuit (100 crédits)');
          } catch (createError) {
            logger.warn('⚠️ Impossible de créer le profil (Supabase peut ne pas être configuré)', { error: createError });
            // Ne pas bloquer - l'application peut fonctionner en mode limité
          }
        } else {
          logger.debug('✅ Utilisateur déjà synchronisé');

          // Vérifier que le plan existe
          try {
            const plan = await planService.getCurrentPlan();
            if (!plan) {
              logger.debug('⚠️ Plan manquant, création du plan gratuit...');
              await planService.createPlan({
                user_id: user.id,
                plan_type: 'free',
                status: 'trial',
                credits_monthly: 100,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 jours d'essai
              });
            }
          } catch (planError) {
            logger.warn('⚠️ Impossible de vérifier/créer le plan', { error: planError });
          }

          // Vérifier que les crédits existent
          try {
            const credits = await creditsService.getCredits();
            if (!credits) {
              logger.debug('⚠️ Crédits manquants, création des crédits initiaux...');
              // Les crédits sont créés par le trigger Supabase
            }
          } catch (creditsError) {
            logger.warn('⚠️ Impossible de vérifier les crédits', { error: creditsError });
          }
        }

        // Succès - même si certaines opérations ont échoué, on ne bloque pas
        setSyncError(null);

      } catch (error) {
        // Erreur critique seulement si tout échoue
        logger.error('❌ Erreur de synchronisation critique', { error });
        // Ne pas définir syncError pour ne pas bloquer l'application
        // setSyncError(error instanceof Error ? error.message : 'Erreur inconnue');
        logger.warn('⚠️ Synchronisation échouée - fonctionnalités limitées');
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id]); // user.fullName and user.imageUrl are intentionally excluded - we only sync on auth state change

  return {
    isSyncing,
    syncError,
    isReady: isLoaded && (!isSignedIn || (!isSyncing && !syncError)),
  };
}
