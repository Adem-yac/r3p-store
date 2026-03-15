import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { useI18n } from "@/i18n";

const fallbackImages: Record<string, string> = {
  hoodies: product1,
  pantalons: product2,
  "t-shirts": product3,
  vestes: product4,
};

const CollectionsPage = () => {
  const { t } = useI18n();
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("collections").select("*").order("display_order");
      if (data) setCollections(data);
    };
    fetch();
  }, []);

  // Fallback if DB empty
  const displayCollections = collections.length > 0 ? collections : [
    { name: "Hoodies", slug: "hoodies", image_url: "" },
    { name: "Pantalons", slug: "pantalons", image_url: "" },
    { name: "T-Shirts", slug: "t-shirts", image_url: "" },
    { name: "Vestes", slug: "vestes", image_url: "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 px-6">
        <div className="container mx-auto">
          <div className="line-accent mb-4" />
          <h1 className="font-heading text-5xl md:text-7xl text-foreground leading-none mb-12">
            {t("page_collections_title")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayCollections.map((col) => (
              <Link
                key={col.slug}
                to={`/broduit?category=${col.slug}`}
                className="group relative overflow-hidden aspect-[4/3] rounded-lg"
              >
                <img
                  src={col.image_url || fallbackImages[col.slug] || product1}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/50 group-hover:bg-background/30 transition-colors duration-300" />
                <div className="absolute bottom-6 left-6">
                  <h2 className="font-heading text-4xl text-foreground">{col.name}</h2>
                </div>
              </Link>
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

export default CollectionsPage;
