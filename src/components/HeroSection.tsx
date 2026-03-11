import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="R3PSTORE"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-24 px-4">
        <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-glow-primary text-primary italic">
          R3PSTORE
        </h1>
        <p className="font-heading text-foreground text-lg md:text-xl tracking-wider mt-2 text-center">
          Explore the unknown
        </p>
        <p className="font-body text-muted-foreground text-sm md:text-base tracking-wide italic">
          feel the comfort
        </p>
        <a
          href="#products"
          className="mt-8 font-heading text-xs tracking-widest uppercase border border-primary text-primary px-8 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          Découvrir
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
