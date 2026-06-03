import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { fetchActiveProducts } from "@/lib/catalog";
import { useI18n } from "@/i18n";

type GridProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  isPromo?: boolean;
};

const fallbackImages: Record<string, string> = {
  Hoodies: product1,
  Pantalons: product2,
  "T-Shirts": product3,
  Vestes: product4,
};

const ProductGrid = () => {
  const [products, setProducts] = useState<GridProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await fetchActiveProducts();
      if (!error && data.length > 0) {
        setProducts(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.old_price ?? undefined,
            image: p.images?.[0] || fallbackImages[p.category] || product1,
            category: p.category,
            isPromo: p.is_promo,
          }))
        );
      } else {
        setProducts([]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <section className="bg-background px-6 py-16">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="line-accent mb-4" />
            <h2 className="font-heading text-5xl md:text-6xl text-foreground leading-none">
              {t("home_new_arrivals_title")}
            </h2>
          </div>
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden md:block">
            {products.length} produits
          </span>
        </div>

        {loading && (
          <p className="text-muted-foreground font-body text-sm mb-6">Chargement…</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="mt-16 border-t border-b border-border py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-12">
            {Array(4).fill(null).map((_, i) => (
              <span key={i} className="font-heading text-2xl text-muted-foreground/30 flex items-center gap-12">
                <span>R3PSTORE</span>
                <span className="text-accent">×</span>
                <span>STREETWEAR</span>
                <span className="text-accent">×</span>
                <span>DZ</span>
                <span className="text-accent">×</span>
                <span>EXPLORE THE UNKNOWN</span>
                <span className="text-accent">×</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
