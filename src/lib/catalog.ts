import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  images: string[];
  category: string;
  is_promo: boolean;
};

const DEFAULT_PRODUCTS: TablesInsert<"products">[] = [
  { name: "R3P Hoodie Noir", price: 3200, old_price: null, category: "Hoodies", description: "Hoodie en coton épais, coupe oversize.", colors: ["#0a0a0a", "#ffffff", "#8B0000"], sizes: ["S", "M", "L", "XL", "XXL"], images: [], is_promo: false, is_active: true },
  { name: "R3P Hoodie Gris", price: 3200, old_price: 3800, category: "Hoodies", description: "Hoodie Gris chiné, pochette kangourou.", colors: ["#808080", "#0a0a0a"], sizes: ["S", "M", "L", "XL", "XXL"], images: [], is_promo: true, is_active: true },
  { name: "R3P Hoodie Rouge", price: 3400, old_price: null, category: "Hoodies", description: "Hoodie rouge flash, broderie R3P.", colors: ["#CC0000", "#0a0a0a"], sizes: ["M", "L", "XL"], images: [], is_promo: false, is_active: true },
  { name: "R3P Cargo Pants Noir", price: 2800, old_price: null, category: "Pantalons", description: "Cargo ample, 6 poches.", colors: ["#0a0a0a", "#2F4F2F"], sizes: ["S", "M", "L", "XL"], images: [], is_promo: false, is_active: true },
  { name: "R3P Sweatpants Gris", price: 2400, old_price: 2900, category: "Pantalons", description: "Sweatpants ajustables, molleton bio.", colors: ["#808080", "#0a0a0a"], sizes: ["S", "M", "L", "XL", "XXL"], images: [], is_promo: true, is_active: true },
  { name: "R3P T-Shirt Logo", price: 1800, old_price: null, category: "T-Shirts", description: "T-shirt coton peigné, logo R3P.", colors: ["#ffffff", "#0a0a0a", "#CC0000"], sizes: ["S", "M", "L", "XL", "XXL"], images: [], is_promo: false, is_active: true },
  { name: "R3P T-Shirt Signature", price: 2000, old_price: null, category: "T-Shirts", description: "T-shirt manches longues, signature R3P dos.", colors: ["#0a0a0a", "#ffffff"], sizes: ["M", "L", "XL"], images: [], is_promo: false, is_active: true },
  { name: "R3P Varsity Jacket", price: 5200, old_price: 6500, category: "Vestes", description: "Varsity en laine, manches cuir.", colors: ["#0a0a0a", "#8B0000"], sizes: ["M", "L", "XL"], images: [], is_promo: true, is_active: true },
  { name: "R3P Bomber Noir", price: 4600, old_price: null, category: "Vestes", description: "Bomber satin, col côtelé.", colors: ["#0a0a0a", "#2F4F2F"], sizes: ["S", "M", "L", "XL", "XXL"], images: [], is_promo: false, is_active: true },
];

/** Tente le seed serveur (nécessite supabase/bootstrap.sql exécuté une fois). */
export async function tryServerCatalogBootstrap() {
  const { error } = await supabase.rpc("seed_products_if_empty");
  if (error && !error.message.includes("Could not find the function")) {
    console.warn("seed_products_if_empty:", error.message);
  }
}

/** Seed catalogue par l'admin connecté si la table est vide. */
export async function seedCatalogAsAdmin(): Promise<boolean> {
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  if (count && count > 0) return false;

  const { error } = await supabase.from("products").insert(DEFAULT_PRODUCTS);
  if (error) {
    console.error("seedCatalogAsAdmin:", error.message);
    return false;
  }
  return true;
}

export async function fetchActiveProducts(): Promise<{
  data: CatalogProduct[];
  error: string | null;
}> {
  await tryServerCatalogBootstrap();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, old_price, images, category, is_promo")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}
