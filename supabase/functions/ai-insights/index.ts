import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Verify admin
    const authHeader = req.headers.get("authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check admin role
    const { data: roleData } = await serviceClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Fetch stats data
    const [ordersRes, viewsRes, productsRes] = await Promise.all([
      serviceClient.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
      serviceClient.from("page_views").select("*").order("created_at", { ascending: false }).limit(500),
      serviceClient.from("products").select("name, price, category").limit(50),
    ]);

    const orders = ordersRes.data || [];
    const views = viewsRes.data || [];
    const products = productsRes.data || [];

    // Build summary for AI
    const totalViews = views.length;
    const uniqueSessions = new Set(views.map((v: any) => v.session_id)).size;
    const totalOrders = orders.length;
    const totalRevenue = orders.filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + o.total_price, 0);
    const cancelledOrders = orders.filter((o: any) => o.status === "cancelled").length;

    // Top pages
    const pageCounts: Record<string, number> = {};
    views.forEach((v: any) => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1; });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Top products by views
    const productViewCounts: Record<string, number> = {};
    views.filter((v: any) => v.page.startsWith("/product/")).forEach((v: any) => {
      const name = v.product_name || v.page;
      productViewCounts[name] = (productViewCounts[name] || 0) + 1;
    });
    const topViewedProducts = Object.entries(productViewCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Top products by sales
    const salesCounts: Record<string, number> = {};
    orders.forEach((o: any) => { salesCounts[o.product_name] = (salesCounts[o.product_name] || 0) + o.quantity; });
    const topSoldProducts = Object.entries(salesCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Top wilayas
    const wilayaCounts: Record<string, number> = {};
    orders.forEach((o: any) => { wilayaCounts[o.wilaya] = (wilayaCounts[o.wilaya] || 0) + 1; });
    const topWilayas = Object.entries(wilayaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const summary = `
Données du site R3PSTORE (streetwear algérien, paiement à la livraison):
- Visiteurs uniques: ${uniqueSessions}
- Pages vues totales: ${totalViews}
- Pages les plus visitées: ${topPages.map(([p, c]) => `${p} (${c})`).join(", ")}
- Produits les plus vus: ${topViewedProducts.map(([p, c]) => `${p} (${c} vues)`).join(", ") || "pas encore de données"}
- Total commandes: ${totalOrders}
- Chiffre d'affaires: ${totalRevenue} DZD
- Commandes annulées: ${cancelledOrders}
- Produits les plus vendus: ${topSoldProducts.map(([p, c]) => `${p} (${c})`).join(", ") || "pas encore"}
- Top wilayas: ${topWilayas.map(([w, c]) => `${w} (${c})`).join(", ") || "pas encore"}
- Produits en catalogue: ${products.map((p: any) => `${p.name} (${p.price} DZD, ${p.category})`).join(", ") || "aucun"}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Tu es un expert marketing e-commerce algérien. Analyse les données du site et donne des conseils concrets et actionnables en français. Sois bref (5-6 bullet points max). Inclus des suggestions pour améliorer les ventes, des idées de publicités Meta (Facebook/Instagram), et des observations sur le trafic. Utilise des émojis pour rendre le texte lisible.`
          },
          {
            role: "user",
            content: `Analyse ces données et donne-moi des insights pour améliorer mon business:\n${summary}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez plus tard." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits AI épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const insights = aiData.choices?.[0]?.message?.content || "Pas d'insights disponibles.";

    return new Response(JSON.stringify({
      insights,
      stats: { totalViews, uniqueSessions, topPages, topViewedProducts, topSoldProducts, topWilayas }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
