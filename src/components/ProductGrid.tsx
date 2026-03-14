import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { supabase } from "@/integrations/supabase/client";

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

const ProductGrid = () => {
  const [products, setProducts] = useState<typeof staticProducts>(staticProducts);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, old_price, images, category, is_promo")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
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
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="bg-background px-6 py-16">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="line-accent mb-4" />
            <h2 className="font-heading text-5xl md:text-6xl text-foreground leading-none">
              Nouveautés
            </h2>
          </div>
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden md:block">
            {products.length} produits
          </span>
        </div>

        {/* Grid — asymmetric: first item large, rest smaller */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Marquee strip */}
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
