import { Link } from "react-router-dom";
import logo from "@/assets/logo-white.png";
import { Menu, X, Languages } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useI18n();

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
          <Link to="/" className="text-foreground hover:text-accent transition-colors duration-200">
            {t("nav_home")}
          </Link>
          <Link to="/broduit" className="text-foreground hover:text-accent transition-colors duration-200">
            {t("nav_shop")}
          </Link>
          <Link to="/collections" className="text-foreground hover:text-accent transition-colors duration-200">
            {t("nav_collections")}
          </Link>
        </div>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={logo} alt="R3P" className="h-7" />
        </Link>

        <div className="flex items-center justify-end w-[40px] lg:w-auto relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center justify-center w-7 h-7 rounded-full border border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
          >
            <Languages size={14} strokeWidth={1.5} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-9 z-50 bg-background border border-border rounded-lg shadow-lg px-3 py-2 flex flex-col gap-1 min-w-[90px]">
              <button
                onClick={() => { setLang("fr"); setLangOpen(false); }}
                className={`flex items-center justify-between text-[11px] font-body px-1 py-0.5 rounded ${
                  lang === "fr" ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>FR</span>
              </button>
              <button
                onClick={() => { setLang("ar"); setLangOpen(false); }}
                className={`flex items-center justify-between text-[11px] font-body px-1 py-0.5 rounded ${
                  lang === "ar" ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>عرب</span>
              </button>
              <button
                onClick={() => { setLang("en"); setLangOpen(false); }}
                className={`flex items-center justify-between text-[11px] font-body px-1 py-0.5 rounded ${
                  lang === "en" ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>EN</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-background border-t border-border px-6 py-8 flex flex-col gap-6 font-body text-[11px] font-medium tracking-[0.25em] uppercase">
          <Link to="/" className="text-foreground hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>
            {t("nav_home")}
          </Link>
          <Link to="/broduit" className="text-foreground hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>
            {t("nav_shop")}
          </Link>
          <Link to="/collections" className="text-foreground hover:text-accent transition-colors" onClick={() => setMenuOpen(false)}>
            {t("nav_collections")}
          </Link>
          <div className="pt-4">
            <div className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-1 gap-2 text-[10px]">
              <span className="text-muted-foreground tracking-[0.2em] uppercase">Lang</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setLang("fr")}
                  className={`px-2 py-0.5 rounded-full ${
                    lang === "fr"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLang("ar")}
                  className={`px-2 py-0.5 rounded-full ${
                    lang === "ar"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  عرب
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-2 py-0.5 rounded-full ${
                    lang === "en"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
