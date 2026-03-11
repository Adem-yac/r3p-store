import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const allProducts = [
  { id: "1", name: "Hoodie Noir Oversize", price: 4500, oldPrice: 5900, image: product1, category: "Hoodies", isPromo: true },
  { id: "2", name: "Cargo Gris Streetwear", price: 3800, image: product2, category: "Pantalons" },
  { id: "3", name: "T-Shirt Blanc Oversize", price: 2200, oldPrice: 2900, image: product3, category: "T-Shirts", isPromo: true },
  { id: "4", name: "Bomber Jacket Noir", price: 6500, image: product4, category: "Vestes" },
];

const BoutiquePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 px-6">
        <div className="container mx-auto">
          <div className="line-accent mb-4" />
          <h1 className="font-heading text-5xl md:text-7xl text-foreground leading-none mb-2">
            Boutique
          </h1>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-12">
            {allProducts.length} produits
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {allProducts.map((product) => (
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
