import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerkSafe } from "@/hooks/use-clerk-safe";
import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardStudio from "./dashboard/DashboardStudio";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useClerkSafe();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Rediriger vers la page d'accueil si pas connecté
      navigate('/');
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Afficher rien pendant le chargement ou si pas connecté
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <DashboardStudio />
    </DashboardLayout>
  );
}