import { Link } from "react-router-dom";
import logo from "@/assets/logo-white.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-12 px-6">
        <button
          className="lg:hidden text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} strokeWidth={1} /> : <Menu size={22} strokeWidth={1} />}
        </button>

        <div className="hidden lg:flex items-center gap-10 font-body text-[11px] font-medium tracking-[0.25em] uppercase">
          <Link to="/" className="text-foreground hover:text-accent transition-colors duration-200">Accueil</Link>
          <Link to="/broduit" className="text-foreground hover:text-accent transition-colors duration-200">Broduit</Link>
          <Link to="/collections" className="text-foreground hover:text-accent transition-colors duration-200">Collections</Link>
        </div>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={logo} alt="R3P" className="h-7" />
        </Link>

        {/* Empty div for flex balance */}
        <div className="w-[22px] lg:w-0" />
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-background border-t border-border px-6 py-8 flex flex-col gap-6 font-body text-[11px] font-medium tracking-[0.25em] uppercase">
          <Link to="/" className="text-foreground hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link to="/broduit" className="text-foreground hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>Broduit</Link>
          <Link to="/collections" className="text-foreground hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>Collections</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
