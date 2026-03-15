import logo from "@/assets/logo-white.png";
import { Instagram } from "lucide-react";
import { useI18n } from "@/i18n";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <img src={logo} alt="R3P" className="h-6 mb-5" />
            <p className="text-muted-foreground text-xs leading-relaxed font-body max-w-xs">
              Streetwear — Livraison 58 Wilayas.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-lg text-foreground mb-4">
              {t("footer_nav")}
            </h4>
            <div className="flex flex-col gap-3 text-xs font-body text-muted-foreground tracking-wider uppercase">
              <a href="/" className="hover:text-foreground transition-colors">
                {t("footer_home")}
              </a>
              <a href="/broduit" className="hover:text-foreground transition-colors">
                {t("footer_shop")}
              </a>
              <a href="/collections" className="hover:text-foreground transition-colors">
                {t("footer_collections")}
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-heading text-lg text-foreground mb-4">Social</h4>
            <a
              href="https://www.instagram.com/r3pstore2/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-2"
            >
              <Instagram size={20} strokeWidth={1} />
              <span className="font-body text-xs">@r3pstore2</span>
            </a>
            <p className="text-muted-foreground text-[10px] tracking-wider uppercase mt-4 font-body">
              {t("footer_cash_on_delivery")}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-6 py-4 text-center text-muted-foreground text-[10px] tracking-[0.15em] uppercase font-body">
        © 2026 R3PSTORE
      </div>
    </footer>
  );
};

export default Footer;
