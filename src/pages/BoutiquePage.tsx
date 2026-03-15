import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";

const staticProducts = [
  { id: "1", name: "Hoodie Noir Oversize", price: 4500, oldPrice: 5900, image: product1, category: "Hoodies", isPromo: true },
  { id: "2", name: "Cargo Gris Streetwear", price: 3800, image: product2, category: "Pantalons" },
  { id: "3", name: "T-Shirt Blanc Oversize", price: 2200, oldPrice: 2900, image: product3, category: "T-Shirts", isPromo: true },
  { id: "4", name: "Bomber Jacket Noir", price: 6500, image: product4, category: "Vestes" },
];

const fallbackImages: Record<string, string> = {
  Hoodies: product1,
  Pantalons: product2,
  "T-Shirts": product3,
  Vestes: product4,
};

const slugToCategory = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const BoutiquePage = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category")?.toLowerCase() || null;
  const [products, setProducts] = useState<typeof staticProducts>(staticProducts);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, old_price, images, category, is_promo")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        let list = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          oldPrice: p.old_price ?? undefined,
          image: p.images?.[0] || fallbackImages[p.category] || product1,
          category: p.category,
          isPromo: p.is_promo,
        }));
        if (categorySlug) {
          const categoryMatch = slugToCategory(categorySlug);
          list = list.filter(
            (p) => p.category.toLowerCase().replace(/\s+/g, "-") === categorySlug || p.category === categoryMatch
          );
        }
        setProducts(list);
      } else if (categorySlug) {
        const categoryMatch = slugToCategory(categorySlug);
        setProducts(staticProducts.filter((p) => p.category.toLowerCase().replace(/\s+/g, "-") === categorySlug || p.category === categoryMatch));
      }
    };
    fetchProducts();
  }, [categorySlug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 px-6">
        <div className="container mx-auto">
          <div className="line-accent mb-4" />
          <h1 className="font-heading text-5xl md:text-7xl text-foreground leading-none mb-2">
            {t("page_shop_title")}
          </h1>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-12">
            {products.length} {t("page_shop_count_suffix")}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default BoutiquePage;
