import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/components/home";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Cookies from "@/pages/Cookies";
import Legal from "@/pages/Legal";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardStudio from "@/pages/dashboard/DashboardStudio";
import DashboardCode from "@/pages/dashboard/DashboardCode";
import DashboardImages from "@/pages/dashboard/DashboardImages";
import DashboardAI from "@/pages/dashboard/DashboardAI";
import DashboardApps from "@/pages/dashboard/DashboardApps";
import DashboardAgents from "@/pages/dashboard/DashboardAgents";
import DashboardVideo from "@/pages/dashboard/DashboardVideo";
import DashboardWebsites from "@/pages/dashboard/DashboardWebsites";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/dashboard" element={<DashboardLayout><DashboardStudio /></DashboardLayout>} />
        <Route path="/dashboard/code" element={<DashboardLayout><DashboardCode /></DashboardLayout>} />
        <Route path="/dashboard/images" element={<DashboardLayout><DashboardImages /></DashboardLayout>} />
        <Route path="/dashboard/ai" element={<DashboardLayout><DashboardAI /></DashboardLayout>} />
        <Route path="/dashboard/apps" element={<DashboardLayout><DashboardApps /></DashboardLayout>} />
        <Route path="/dashboard/agents" element={<DashboardLayout><DashboardAgents /></DashboardLayout>} />
        <Route path="/dashboard/video" element={<DashboardLayout><DashboardVideo /></DashboardLayout>} />
        <Route path="/dashboard/websites" element={<DashboardLayout><DashboardWebsites /></DashboardLayout>} />
        <Route path="/dashboard/*" element={<DashboardLayout><DashboardStudio /></DashboardLayout>} />
      </Routes>
    </Suspense>
  );
}

export default App;