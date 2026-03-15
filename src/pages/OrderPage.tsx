import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { wilayaShipping, communesByWilaya } from "@/data/shipping";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

const OrderPage = () => {
  const { t, lang } = useI18n();
  const [searchParams] = useSearchParams();
  const productName = searchParams.get("product") || "";
  const productPrice = Number(searchParams.get("price")) || 0;
  const productSize = searchParams.get("size") || "M";
  const productColor = searchParams.get("color") || "#000";
  const productQuantity = Number(searchParams.get("quantity")) || 1;
  const rawProductId = searchParams.get("productId") || null;
  const isUuid = rawProductId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawProductId);
  const productId = isUuid ? rawProductId : null;

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"domicile" | "stopDesk">("domicile");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedWilaya = useMemo(
    () => wilayaShipping.find((w) => w.wilaya === wilaya),
    [wilaya]
  );

  const communes = useMemo(
    () => (wilaya ? communesByWilaya[wilaya] || [] : []),
    [wilaya]
  );

  const shippingPrice = selectedWilaya
    ? deliveryType === "domicile"
      ? selectedWilaya.domicile
      : selectedWilaya.stopDesk
    : 0;

  const totalProduct = productPrice * productQuantity;
  const discountAmount = Math.round(totalProduct * (discount / 100));
  const totalFinal = totalProduct - discountAmount + shippingPrice;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.toUpperCase())
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!data) {
      toast.error("Code promo invalide ou expiré");
      return;
    }
    if (data.max_uses && data.used_count >= data.max_uses) {
      toast.error("Code promo épuisé");
      return;
    }
    setDiscount(data.discount_percent);
    setPromoApplied(true);
    toast.success(`-${data.discount_percent}% appliqué !`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !telephone.trim() || !wilaya || !commune) return;
    setSubmitting(true);

    const { error } = await supabase.from("orders").insert({
      product_id: productId,
      product_name: productName,
      product_price: productPrice,
      quantity: productQuantity,
      size: productSize,
      color: productColor,
      customer_name: nom.trim(),
      customer_phone: telephone.trim(),
      wilaya,
      commune,
      delivery_type: deliveryType,
      shipping_price: shippingPrice,
      total_price: totalFinal,
      promo_code: promoApplied ? promoCode.toUpperCase() : null,
      discount_amount: discountAmount,
    });

    if (error) {
      toast.error("Erreur lors de l'envoi de la commande");
      setSubmitting(false);
      return;
    }

    // Increment promo code usage
    if (promoApplied && promoCode) {
      await supabase.rpc("increment_promo_usage" as never, { promo_code: promoCode.toUpperCase() } as never).then(() => {});
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-14 flex items-center justify-center min-h-[80vh] px-6">
          <div className="text-center max-w-md">
            <CheckCircle size={48} className="text-accent mx-auto mb-6" strokeWidth={1} />
            <h1 className="font-heading text-4xl text-foreground mb-3">
              {t("order_sent_title")}
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-2">
              {t("order_sent_text_1", { name: nom, product: productName })}
            </p>
            <p className="font-body text-sm text-muted-foreground mb-8">
              {t("order_sent_text_2", { phone: telephone })}
            </p>
            <Link
              to="/"
              className="inline-block bg-accent text-accent-foreground font-heading text-sm tracking-[0.1em] px-8 py-4 rounded-lg hover:opacity-90 transition-all"
            >
              {t("order_back_home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-14">
        <div className="px-6 py-4 border-b border-border">
          <div className="container mx-auto">
            <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[11px] tracking-[0.2em] uppercase font-body">
              <ChevronLeft size={12} strokeWidth={1.5} />
              <span>{t("order_back")}</span>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-6 py-10">
          <div className="line-accent mb-4" />
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-10">
            {t("order_title")}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              {/* Product summary */}
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: productColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-lg text-foreground truncate">{productName}</p>
                    <p className="font-body text-xs text-muted-foreground">Taille: {productSize} · Qté: {productQuantity}</p>
                  </div>
                  <p className="font-heading text-lg text-accent flex-shrink-0">{totalProduct.toLocaleString()} DZD</p>
                </div>
              </div>

              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required maxLength={100} placeholder={t("order_name_placeholder")} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors" />
              <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} required maxLength={15} placeholder={t("order_phone_placeholder")} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors" />

              <select value={wilaya} onChange={(e) => { setWilaya(e.target.value); setCommune(""); }} required className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-accent transition-colors appearance-none">
                <option value="">{t("order_choose_wilaya")}</option>
                {wilayaShipping.map((w) => (<option key={w.wilaya} value={w.wilaya}>{w.wilaya}</option>))}
              </select>

              {wilaya && communes.length > 0 && (
                <select value={commune} onChange={(e) => setCommune(e.target.value)} required className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-accent transition-colors appearance-none">
                  <option value="">{t("order_choose_commune")}</option>
                  {communes.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              )}

              {wilaya && (
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setDeliveryType("domicile")} className={`border rounded-lg p-4 text-center transition-all duration-200 ${deliveryType === "domicile" ? "border-accent bg-accent/10" : "border-border hover:border-muted-foreground"}`}>
                    <p className="font-heading text-sm text-foreground">{t("order_delivery_home")}</p>
                    <p className="font-heading text-lg text-accent mt-1">{selectedWilaya?.domicile.toLocaleString()} DZD</p>
                  </button>
                  <button type="button" onClick={() => setDeliveryType("stopDesk")} className={`border rounded-lg p-4 text-center transition-all duration-200 ${deliveryType === "stopDesk" ? "border-accent bg-accent/10" : "border-border hover:border-muted-foreground"}`}>
                    <p className="font-heading text-sm text-foreground">{t("order_delivery_stopdesk")}</p>
                    <p className="font-heading text-lg text-accent mt-1">{selectedWilaya?.stopDesk.toLocaleString()} DZD</p>
                  </button>
                </div>
              )}

              {/* Promo code */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                  {t("order_promo_label")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t("order_promo_placeholder")}
                    disabled={promoApplied}
                    className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoApplied}
                    className="bg-muted border border-border text-foreground font-heading text-sm px-6 py-3 rounded-lg hover:border-accent transition-colors disabled:opacity-50"
                  >
                    {promoApplied ? t("order_promo_applied") : t("order_promo_apply")}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!nom.trim() || !telephone.trim() || !wilaya || !commune || submitting}
                className="w-full bg-accent text-accent-foreground font-heading text-xl tracking-[0.1em] py-5 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? t("order_submit_loading") : t("order_submit_label")}
              </button>
            </form>

            {/* Summary */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border rounded-lg p-6 lg:sticky lg:top-20">
                <h3 className="font-heading text-xl text-foreground mb-6">
                  {t("order_summary_title")}
                </h3>
                <div className="space-y-4 font-body text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{productName} × {productQuantity}</span>
                    <span className="text-foreground">{totalProduct.toLocaleString()} DZD</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>{t("order_reduction")} (-{discount}%)</span>
                      <span>-{discountAmount.toLocaleString()} DZD</span>
                    </div>
                  )}
                  {wilaya && (
                    <div className="flex justify_between text-muted-foreground">
                      <span>
                        {t("order_delivery_label")} (
                        {deliveryType === "domicile"
                          ? t("order_delivery_home_short")
                          : t("order_delivery_stopdesk_short")}
                        )
                      </span>
                      <span className="text-foreground">{shippingPrice.toLocaleString()} DZD</span>
                    </div>
                  )}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="font-heading text-lg text-foreground">
                      {t("order_total")}
                    </span>
                    <span className="font-heading text-2xl text-accent">{totalFinal.toLocaleString()} DZD</span>
                  </div>
                </div>
                <p className="font-body text-[10px] tracking-wider uppercase text-muted-foreground mt-6">
                  {t("footer_cash_on_delivery")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
