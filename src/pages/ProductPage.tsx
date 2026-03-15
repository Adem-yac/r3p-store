import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { useI18n } from "@/i18n";

// Fallback static data for demo products
const staticProducts: Record<string, { name: string; price: number; oldPrice?: number; images: string[]; category: string; isPromo?: boolean; colors: string[]; description: string }> = {
  "1": { name: "Hoodie Noir Oversize", price: 4500, oldPrice: 5900, images: [product1, product2], category: "Hoodies", isPromo: true, colors: ["#0a0a0a", "#f5f5f5", "#6b7280"], description: "Hoodie oversize en coton épais 380g, coupe droite tombante avec finition brossée intérieure." },
  "2": { name: "Cargo Gris Streetwear", price: 3800, images: [product2, product3], category: "Pantalons", colors: ["#9ca3af", "#0a0a0a", "#d4c9a8"], description: "Pantalon cargo coupe décontractée avec poches latérales fonctionnelles. Taille élastiquée avec cordon." },
  "3": { name: "T-Shirt Blanc Oversize", price: 2200, oldPrice: 2900, images: [product3, product1], category: "T-Shirts", isPromo: true, colors: ["#f5f5f5", "#0a0a0a"], description: "T-shirt oversize en coton 100% premium. Coupe drop shoulder, col renforcé." },
  "4": { name: "Bomber Jacket Noir", price: 6500, images: [product4, product1], category: "Vestes", colors: ["#0a0a0a", "#3b3b3b"], description: "Bomber jacket en nylon avec doublure matelassée. Poches zippées, bords-côtes élastiques." },
};

const sizes = ["S", "M", "L", "XL", "XXL"];

interface ProductData {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: string;
  isPromo?: boolean;
  colors: string[];
  description: string;
  sizes: string[];
}

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      // Try database first (only if id looks like a UUID)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");
      const data = isUuid ? (await supabase.from("products").select("*").eq("id", id!).single()).data : null;
      if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          oldPrice: data.old_price || undefined,
          images: data.images.length > 0 ? data.images : [product1],
          category: data.category,
          isPromo: data.is_promo,
          colors: data.colors,
          description: data.description,
          sizes: data.sizes,
        });
      } else {
        // Fallback to static
        const sp = staticProducts[id || "1"];
        if (sp) {
          setProduct({ id: id || "1", ...sp, sizes });
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground font-heading text-2xl">Produit non trouvé</p>
      </div>
    );
  }

  const handleOrder = () => {
    const params = new URLSearchParams({
      product: product.name,
      price: product.price.toString(),
      size: selectedSize,
      color: product.colors[selectedColor] || "#000",
      quantity: quantity.toString(),
      image: product.images[0],
      productId: product.id,
    });
    navigate(`/commander?${params.toString()}`);
  };

  const productSizes = product.sizes.length > 0 ? product.sizes : sizes;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-14">
        <div className="px-6 py-4 border-b border-border">
        <div className="container mx-auto">
          <Link
            to="/broduit"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[11px] tracking-[0.2em] uppercase font-body"
          >
            <ChevronLeft size={12} strokeWidth={1.5} />
            <span>{t("product_back_to_shop")}</span>
          </Link>
        </div>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 pt-6 lg:pt-10">
            
            {/* Images */}
            <div className="lg:col-span-7 lg:sticky lg:top-20 lg:self-start">
              <div className="relative overflow-hidden rounded-lg group">
                {product.isPromo && (
                  <span className="badge-promo absolute top-4 left-4 z-10 rounded-md">Promo</span>
                )}
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="w-full aspect-[4/5] object-cover rounded-lg transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        activeImage === i ? "border-accent" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-5 py-6 lg:py-0">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-accent">
                {product.category}
              </p>

              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground leading-[0.95] mt-2">
                {product.name}
              </h1>

              <div className="mt-6 flex items-end gap-4">
                <span className="font-heading text-4xl text-accent leading-none">
                  {product.price.toLocaleString()} DZD
                </span>
                {product.oldPrice && (
                  <span className="text-muted-foreground text-sm line-through font-body pb-1">
                    {product.oldPrice.toLocaleString()} DZD
                  </span>
                )}
              </div>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-6">
                {product.description}
              </p>

              <div className="w-full h-px bg-border my-8" />

              {/* Color selector */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    {t("product_color")}
                  </p>
                  <div className="flex gap-3">
                    {product.colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(i)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          selectedColor === i ? "border-accent scale-110" : "border-border hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    {t("product_size")}
                  </p>
                  <p className="font-heading text-sm text-foreground">{selectedSize}</p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {productSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 rounded-lg font-body text-xs tracking-wider border transition-all duration-200 ${
                        selectedSize === size
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  {t("product_quantity")}
                </p>
                <div className="flex items-center border border-border rounded-lg w-fit overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <span className="w-14 h-12 flex items-center justify-center text-foreground font-heading text-lg border-l border-r border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleOrder}
                className="mt-8 w-full bg-accent text-accent-foreground font-heading text-xl tracking-[0.1em] py-5 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-3"
              >
                {t("product_cta")}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
