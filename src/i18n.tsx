import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "fr" | "ar" | "en";

type Translations = Record<string, { fr: string; ar: string; en: string }>;

const translations: Translations = {
  nav_home: { fr: "Accueil", ar: "الرئيسية", en: "Home" },
  nav_shop: { fr: "Broduit", ar: "المنتجات", en: "Shop" },
  nav_collections: { fr: "Collections", ar: "التشكيلات", en: "Collections" },

  hero_cta: { fr: "Découvrir", ar: "اكتشف", en: "Discover" },

  footer_nav: { fr: "Navigation", ar: "التنقل", en: "Navigation" },
  footer_home: { fr: "Accueil", ar: "الرئيسية", en: "Home" },
  footer_shop: { fr: "Broduit", ar: "المنتجات", en: "Shop" },
  footer_collections: { fr: "Collections", ar: "التشكيلات", en: "Collections" },
  footer_cash_on_delivery: {
    fr: "Paiement à la livraison",
    ar: "الدفع عند الاستلام",
    en: "Cash on delivery",
  },

  page_shop_title: { fr: "Broduit", ar: "المنتجات", en: "Shop" },
  page_shop_count_suffix: { fr: "produits", ar: "منتجات", en: "products" },

  page_collections_title: { fr: "Collections", ar: "التشكيلات", en: "Collections" },

  order_title: { fr: "Commander", ar: "إتمام الطلب", en: "Checkout" },
  order_back: { fr: "Retour", ar: "رجوع", en: "Back" },
  order_sent_title: { fr: "Commande Envoyée", ar: "تم إرسال الطلب", en: "Order Sent" },
  order_sent_text_1: {
    fr: "Merci {name} ! Votre commande de {product} a été reçue.",
    ar: "شكراً {name}! تم استلام طلبك لـ {product}.",
    en: "Thank you {name}! Your order for {product} has been received.",
  },
  order_sent_text_2: {
    fr: "Nous vous contacterons au {phone} pour confirmer.",
    ar: "سنتصل بك على {phone} للتأكيد.",
    en: "We will contact you at {phone} to confirm.",
  },
  order_back_home: { fr: "Retour à l'accueil", ar: "العودة للرئيسية", en: "Back to home" },
  order_name_placeholder: { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  order_phone_placeholder: { fr: "Numéro de téléphone", ar: "رقم الهاتف", en: "Phone number" },
  order_choose_wilaya: { fr: "Choisir une wilaya", ar: "اختر الولاية", en: "Choose wilaya" },
  order_choose_commune: { fr: "Choisir une commune", ar: "اختر البلدية", en: "Choose commune" },
  order_delivery_home: { fr: "À domicile", ar: "إلى المنزل", en: "Home delivery" },
  order_delivery_stopdesk: { fr: "Stop Desk", ar: "مكتب تسليم", en: "Stop desk" },
  order_promo_label: { fr: "Code promo", ar: "كود التخفيض", en: "Promo code" },
  order_promo_placeholder: { fr: "Entrer un code", ar: "أدخل الكود", en: "Enter code" },
  order_promo_apply: { fr: "Appliquer", ar: "تطبيق", en: "Apply" },
  order_promo_applied: { fr: "Appliqué ✓", ar: "تم التطبيق ✓", en: "Applied ✓" },
  order_submit_loading: { fr: "Envoi...", ar: "جاري الإرسال...", en: "Sending..." },
  order_submit_label: {
    fr: "Confirmer la commande",
    ar: "تأكيد الطلب",
    en: "Confirm order",
  },
  order_summary_title: { fr: "Résumé", ar: "الملخص", en: "Summary" },
  order_reduction: { fr: "Réduction", ar: "التخفيض", en: "Discount" },
  order_delivery_label: { fr: "Livraison", ar: "التوصيل", en: "Delivery" },
  order_delivery_home_short: { fr: "Domicile", ar: "منزل", en: "Home" },
  order_delivery_stopdesk_short: { fr: "Stop Desk", ar: "مكتب", en: "Stop desk" },
  order_total: { fr: "Total", ar: "الإجمالي", en: "Total" },

  product_back_to_shop: { fr: "Broduit", ar: "المنتجات", en: "Shop" },
  product_color: { fr: "Couleur", ar: "اللون", en: "Color" },
  product_size: { fr: "Taille", ar: "المقاس", en: "Size" },
  product_quantity: { fr: "Quantité", ar: "الكمية", en: "Quantity" },
  product_cta: { fr: "Commander Maintenant", ar: "اطلب الآن", en: "Order now" },

  admin_login_title: { fr: "Admin", ar: "الإدارة", en: "Admin" },
  admin_email: { fr: "Email", ar: "البريد الإلكتروني", en: "Email" },
  admin_password: { fr: "Mot de passe", ar: "كلمة المرور", en: "Password" },
  admin_login_button_loading: { fr: "Connexion...", ar: "جارٍ الاتصال...", en: "Signing in..." },
  admin_login_button: { fr: "Se Connecter", ar: "تسجيل الدخول", en: "Sign in" },

  notfound_title: { fr: "Oops ! Page introuvable", ar: "الصفحة غير موجودة", en: "Oops! Page not found" },
  notfound_back: { fr: "Retour à l'accueil", ar: "العودة للرئيسية", en: "Return to home" },
};

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>("fr");

  useEffect(() => {
    const stored = localStorage.getItem("r3p_lang") as Language | null;
    if (stored === "fr" || stored === "ar" || stored === "en") {
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("r3p_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Language) => {
    setLangState(l);
  };

  const t: I18nContextValue["t"] = (key, vars) => {
    const entry = translations[key];
    if (!entry) return key;
    let value = entry[lang] ?? entry.fr;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

