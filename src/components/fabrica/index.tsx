import Navigation from "./Navigation";
import HeroTypography from "./HeroTypography";
import ServiceList from "./ServiceList";
import MissionStatement from "./MissionStatement";
import Footer from "./Footer";
import LavaLampBackground from "./LavaLampBackground";
import CustomCursor from "./CustomCursor";

const FabricaLanding = () => {
  return (
    <div className="relative min-h-screen h-screen w-full bg-black overflow-hidden cursor-none md:cursor-none">
      {/* White Border Frame - Top */}
      <div className="fixed top-0 left-0 right-0 h-[1px] bg-white/20 z-[100]" />
      
      {/* White Border Frame - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[1px] bg-white/20 z-[100]" />
      
      {/* White Border Frame - Left */}
      <div className="fixed top-0 left-0 bottom-0 w-[1px] bg-white/20 z-[100]" />
      
      {/* White Border Frame - Right */}
      <div className="fixed top-0 right-0 bottom-0 w-[1px] bg-white/20 z-[100]" />
      
      {/* Vertical Divider Line - Center-Right for Services */}
      <div className="hidden lg:block fixed top-0 bottom-0 right-[280px] xl:right-[320px] w-[1px] bg-white/10 z-[90]" />
      
      {/* Horizontal Divider Line - Below Navigation */}
      <div className="fixed top-16 md:top-20 left-0 right-0 h-[1px] bg-white/10 z-[90]" />
      
      {/* Horizontal Divider Line - Above Footer */}
      <div className="fixed bottom-20 md:bottom-24 left-0 right-0 h-[1px] bg-white/10 z-[90]" />
      
      {/* Custom Cursor */}
      <CustomCursor />
      
      {/* Animated Background */}
      <LavaLampBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10 h-full flex flex-col px-6 md:px-12 lg:px-16 pt-20 md:pt-24 pb-6 md:pb-8">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-16">
          {/* Left: Hero Typography */}
          <div className="flex-1">
            <HeroTypography />
          </div>

          {/* Right: Services - with left border on large screens */}
          <div className="lg:self-start lg:mt-[15%] lg:pl-8 lg:border-l lg:border-white/10">
            <ServiceList />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-16 pt-4 border-t border-white/10">
          {/* Left: Mission Statement */}
          <div className="order-2 lg:order-1 max-w-md">
            <MissionStatement />
          </div>

          {/* Right: Footer (Confidentialité & Politique) */}
          <div className="order-1 lg:order-2">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FabricaLanding;
