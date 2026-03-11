import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-12">
        {/* Hero banner */}
        <div className="relative w-full h-[75vh] overflow-hidden">
          <img
            src={heroBanner}
            alt="R3PSTORE"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
          
          <div className="absolute bottom-10 left-6 md:left-12">
            <h1 className="font-heading text-7xl md:text-9xl text-foreground leading-[0.85] tracking-tight">
              R3P<span className="text-accent">.</span>
            </h1>
          </div>
        </div>

        <ProductGrid />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
