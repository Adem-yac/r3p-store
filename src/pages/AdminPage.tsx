import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Package, ShoppingBag, Tag, Plus, Trash2, Eye, EyeOff, BarChart3, Sparkles, Users, Globe, RefreshCw, Image, Shuffle, Pencil, X, ChevronDown, ChevronUp, ArrowUpDown, Phone, MapPin, Calendar, CreditCard, Hash } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Order = Tables<"orders">;
type PromoCode = Tables<"promo_codes">;

const generatePromoCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "R3P";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const inputClass = "bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent w-full";
const btnPrimary = "bg-accent text-accent-foreground font-heading text-xs tracking-wider px-5 py-2.5 rounded-lg hover:opacity-90 transition-all";
const btnSecondary = "border border-border text-muted-foreground font-heading text-xs tracking-wider px-5 py-2.5 rounded-lg hover:text-foreground hover:border-foreground/30 transition-all";

const AdminPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"stats" | "products" | "orders" | "promos" | "collections">("stats");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", oldPrice: "", category: "", description: "", isPromo: false });
  const [productColors, setProductColors] = useState<string[]>(["#0a0a0a"]);
  const [productImages, setProductImages] = useState<File[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Promos
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [newPromo, setNewPromo] = useState({ code: "", discount: "", days: "", maxUses: "" });

  // Collections
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionImages, setCollectionImages] = useState<Record<string, File | null>>({});
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: "", slug: "" });
  const [newCollectionImage, setNewCollectionImage] = useState<File | null>(null);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editCollectionName, setEditCollectionName] = useState("");

  // Visitor stats
  const [visitorStats, setVisitorStats] = useState<{ totalViews: number; uniqueSessions: number; topPages: [string, number][]; topViewedProducts: [string, number][] } | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/r3padmin/login"); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!data) { navigate("/r3padmin/login"); return; }
    setIsAdmin(true);
    setLoading(false);
    fetchAll();
  };

  const fetchAll = async () => {
    const [p, o, c, v, col] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("collections").select("*").order("display_order" as any),
    ]);
    if (p.data) setProducts(p.data);
    if (o.data) setOrders(o.data);
    if (c.data) setPromos(c.data);
    if ((col as any).data) setCollections((col as any).data);
    if (v.data) {
      const views = v.data as any[];
      const uniqueSessions = new Set(views.map(x => x.session_id)).size;
      const pageCounts: Record<string, number> = {};
      views.forEach(x => { pageCounts[x.page] = (pageCounts[x.page] || 0) + 1; });
      const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5) as [string, number][];
      const productViewCounts: Record<string, number> = {};
      views.filter(x => x.page.startsWith("/product/")).forEach(x => {
        const name = x.product_name || x.page;
        productViewCounts[name] = (productViewCounts[name] || 0) + 1;
      });
      const topViewedProducts = Object.entries(productViewCounts).sort((a, b) => b[1] - a[1]).slice(0, 5) as [string, number][];
      setVisitorStats({ totalViews: views.length, uniqueSessions, topPages, topViewedProducts });
    }
  };

  const fetchAiInsights = async () => {
    setInsightsLoading(true);
    setAiInsights(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights");
      if (error) throw error;
      setAiInsights(data.insights);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'analyse AI");
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/r3padmin/login");
  };

  // === PRODUCTS CRUD ===
  const uploadImages = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("products").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrls = await uploadImages(productImages);
    const { error } = await supabase.from("products").insert({
      name: newProduct.name,
      price: Number(newProduct.price),
      old_price: newProduct.oldPrice ? Number(newProduct.oldPrice) : null,
      category: newProduct.category,
      description: newProduct.description,
      colors: productColors.filter(c => c.trim()),
      images: imageUrls,
      is_promo: newProduct.isPromo,
    });
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Produit ajouté !");
    resetProductForm();
    fetchAll();
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p.id);
    setNewProduct({ name: p.name, price: String(p.price), oldPrice: p.old_price ? String(p.old_price) : "", category: p.category, description: p.description, isPromo: p.is_promo });
    setProductColors(p.colors.length > 0 ? p.colors : ["#0a0a0a"]);
    setProductImages([]);
    setShowAddProduct(false);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const existing = products.find(p => p.id === editingProduct);
    let imageUrls = existing?.images || [];
    if (productImages.length > 0) {
      const newUrls = await uploadImages(productImages);
      imageUrls = [...imageUrls, ...newUrls];
    }
    const { error } = await supabase.from("products").update({
      name: newProduct.name,
      price: Number(newProduct.price),
      old_price: newProduct.oldPrice ? Number(newProduct.oldPrice) : null,
      category: newProduct.category,
      description: newProduct.description,
      colors: productColors.filter(c => c.trim()),
      images: imageUrls,
      is_promo: newProduct.isPromo,
    }).eq("id", editingProduct);
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Produit modifié !");
    resetProductForm();
    fetchAll();
  };

  const resetProductForm = () => {
    setNewProduct({ name: "", price: "", oldPrice: "", category: "", description: "", isPromo: false });
    setProductColors(["#0a0a0a"]);
    setProductImages([]);
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const toggleProduct = async (id: string, active: boolean) => {
    await supabase.from("products").update({ is_active: !active }).eq("id", id);
    fetchAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchAll();
    toast.success("Produit supprimé");
  };

  // === ORDERS ===
  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchAll();
    toast.success("Statut mis à jour");
  };

  // === COLLECTIONS CRUD ===
  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = "";
    if (newCollectionImage) {
      const urls = await uploadImages([newCollectionImage]);
      if (urls.length > 0) imageUrl = urls[0];
    }
    const { error } = await (supabase.from("collections") as any).insert({
      name: newCollection.name,
      slug: newCollection.slug.toLowerCase().replace(/\s+/g, "-"),
      image_url: imageUrl,
      display_order: collections.length + 1,
    });
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Collection ajoutée !");
    setNewCollection({ name: "", slug: "" });
    setNewCollectionImage(null);
    setShowAddCollection(false);
    fetchAll();
  };

  const handleUpdateCollectionImage = async (id: string) => {
    const file = collectionImages[id];
    if (!file) return;
    const urls = await uploadImages([file]);
    if (urls.length === 0) return;
    await (supabase.from("collections") as any).update({ image_url: urls[0] }).eq("id", id);
    toast.success("Image mise à jour !");
    setCollectionImages({ ...collectionImages, [id]: null });
    fetchAll();
  };

  const handleUpdateCollectionName = async (id: string) => {
    if (!editCollectionName.trim()) return;
    await (supabase.from("collections") as any).update({ name: editCollectionName }).eq("id", id);
    toast.success("Nom mis à jour !");
    setEditingCollection(null);
    fetchAll();
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Supprimer cette collection ?")) return;
    await (supabase.from("collections") as any).delete().eq("id", id);
    toast.success("Collection supprimée");
    fetchAll();
  };

  // === PROMOS ===
  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(newPromo.days));
    const { error } = await supabase.from("promo_codes").insert({
      code: newPromo.code.toUpperCase(),
      discount_percent: Number(newPromo.discount),
      expires_at: expiresAt.toISOString(),
      max_uses: newPromo.maxUses ? Number(newPromo.maxUses) : null,
    });
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Code promo créé !");
    setNewPromo({ code: "", discount: "", days: "", maxUses: "" });
    fetchAll();
  };

  const togglePromo = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !active }).eq("id", id);
    fetchAll();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Supprimer ce code promo ?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    toast.success("Code promo supprimé");
    fetchAll();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return null;

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending: { label: "En attente", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
    confirmed: { label: "Confirmée", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    shipped: { label: "Expédiée", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    delivered: { label: "Livrée", bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
    cancelled: { label: "Annulée", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  };

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total_price, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / Math.max(orders.filter(o => o.status !== "cancelled").length, 1)) : 0;
  const topProducts = orders.reduce((acc, o) => { acc[o.product_name] = (acc[o.product_name] || 0) + o.quantity; return acc; }, {} as Record<string, number>);
  const topProductsList = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topWilayas = orders.reduce((acc, o) => { acc[o.wilaya] = (acc[o.wilaya] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topWilayasList = Object.entries(topWilayas).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split("T")[0]; });
  const ordersByDay = last7Days.map(day => ({
    day: new Date(day).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    count: orders.filter(o => o.created_at.startsWith(day)).length,
    revenue: orders.filter(o => o.created_at.startsWith(day) && o.status !== "cancelled").reduce((s, o) => s + o.total_price, 0),
  }));

  const filteredOrders = orderFilter === "all" ? orders : orders.filter(o => o.status === orderFilter);

  const tabs = [
    { key: "stats" as const, label: "Stats", icon: BarChart3, count: null },
    { key: "orders" as const, label: "Commandes", icon: ShoppingBag, count: orders.length },
    { key: "products" as const, label: "Produits", icon: Package, count: products.length },
    { key: "collections" as const, label: "Collections", icon: Image, count: collections.length },
    { key: "promos" as const, label: "Promos", icon: Tag, count: promos.length },
  ];

  // Product form (shared between add & edit)
  const renderProductForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg text-foreground">{isEdit ? "Modifier le produit" : "Nouveau produit"}</h3>
        <button type="button" onClick={resetProductForm} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nom du produit" required className={inputClass} />
        <input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Catégorie" required className={inputClass} />
        <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Prix (DZD)" required className={inputClass} />
        <input type="number" value={newProduct.oldPrice} onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })} placeholder="Ancien prix (optionnel)" className={inputClass} />
      </div>
      <div>
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Couleurs (max 7)</p>
        <div className="flex flex-wrap gap-3 items-center">
          {productColors.map((color, i) => (
            <div key={i} className="flex items-center gap-1">
              <input type="color" value={color} onChange={(e) => { const u = [...productColors]; u[i] = e.target.value; setProductColors(u); }}
                className="w-10 h-10 rounded-full border-2 border-border cursor-pointer bg-transparent" />
              {productColors.length > 1 && (
                <button type="button" onClick={() => setProductColors(productColors.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive text-xs">✕</button>
              )}
            </div>
          ))}
          {productColors.length < 7 && (
            <button type="button" onClick={() => setProductColors([...productColors, "#888888"])}
              className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-colors">
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={newProduct.isPromo} onChange={(e) => setNewProduct({ ...newProduct, isPromo: e.target.checked })} className="w-4 h-4 accent-accent" />
        <span className="font-body text-sm text-muted-foreground">En promo</span>
      </div>
      <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" rows={3} className={inputClass + " resize-none"} />
      <div>
        <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">{isEdit ? "Ajouter des images" : "Images du produit"}</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setProductImages(Array.from(e.target.files || []))} className="font-body text-sm text-muted-foreground" />
      </div>
      <div className="flex gap-3">
        <button type="submit" className={btnPrimary}>{isEdit ? "Sauvegarder" : "Enregistrer"}</button>
        <button type="button" onClick={resetProductForm} className={btnSecondary}>Annuler</button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">R3P Admin</h1>
        <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors"><LogOut size={20} strokeWidth={1.5} /></button>
      </div>

      <div className="border-b border-border px-6 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 font-body text-xs tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={16} strokeWidth={1.5} />
            {t.label}
            {t.count !== null && <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px]">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* STATS TAB */}
        {tab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Visiteurs", value: visitorStats?.uniqueSessions ?? 0, sub: `${visitorStats?.totalViews ?? 0} pages vues` },
                { label: "Chiffre d'affaires", value: `${totalRevenue.toLocaleString()} DZD`, sub: "hors annulées" },
                { label: "Commandes", value: totalOrders, sub: `${pendingOrders} en attente · ${deliveredOrders} livrées` },
                { label: "Panier moyen", value: `${avgOrderValue.toLocaleString()} DZD`, sub: `${cancelledOrders} annulées` },
              ].map((kpi, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{kpi.label}</p>
                  <p className="font-heading text-2xl text-foreground mt-1">{kpi.value}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2"><Globe size={18} strokeWidth={1.5} /> Pages les plus visitées</h3>
                {(!visitorStats || visitorStats.topPages.length === 0) && <p className="text-muted-foreground font-body text-sm">Aucune donnée encore</p>}
                <div className="space-y-3">
                  {visitorStats?.topPages.map(([page, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-body text-sm text-foreground truncate">{page}</span>
                      <span className="font-heading text-sm text-accent">{count} vues</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2"><Eye size={18} strokeWidth={1.5} /> Produits les plus vus</h3>
                {(!visitorStats || visitorStats.topViewedProducts.length === 0) && <p className="text-muted-foreground font-body text-sm">Aucune visite produit encore</p>}
                <div className="space-y-3">
                  {visitorStats?.topViewedProducts.map(([name, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-body text-sm text-foreground truncate">{name}</span>
                      <span className="font-heading text-sm text-accent">{count} vues</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-heading text-lg text-foreground mb-4">Commandes (7 derniers jours)</h3>
              <div className="flex items-end gap-2 h-32">
                {ordersByDay.map((d, i) => {
                  const maxCount = Math.max(...ordersByDay.map(x => x.count), 1);
                  const height = (d.count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="font-body text-[10px] text-accent">{d.count}</span>
                      <div className="w-full bg-accent/20 rounded-t" style={{ height: `${Math.max(height, 4)}%` }}>
                        <div className="w-full h-full bg-accent rounded-t" />
                      </div>
                      <span className="font-body text-[9px] text-muted-foreground">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-lg text-foreground mb-4">Top Produits</h3>
                {topProductsList.length === 0 && <p className="text-muted-foreground font-body text-sm">Aucune donnée</p>}
                <div className="space-y-3">
                  {topProductsList.map(([name, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-body text-sm text-foreground truncate">{name}</span>
                      <span className="font-heading text-sm text-accent">{count} vendus</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-lg text-foreground mb-4">Top Wilayas</h3>
                {topWilayasList.length === 0 && <p className="text-muted-foreground font-body text-sm">Aucune donnée</p>}
                <div className="space-y-3">
                  {topWilayasList.map(([name, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-body text-sm text-foreground truncate">{name}</span>
                      <span className="font-heading text-sm text-accent">{count} commandes</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
                  <Sparkles size={18} strokeWidth={1.5} className="text-accent" /> Insights AI
                </h3>
                <button onClick={fetchAiInsights} disabled={insightsLoading}
                  className={btnPrimary + " flex items-center gap-2 disabled:opacity-50"}>
                  <RefreshCw size={14} strokeWidth={2} className={insightsLoading ? "animate-spin" : ""} />
                  {insightsLoading ? "Analyse..." : "Analyser avec l'AI"}
                </button>
              </div>
              {aiInsights ? (
                <div className="font-body text-sm text-foreground leading-relaxed whitespace-pre-line">{aiInsights}</div>
              ) : (
                <p className="font-body text-sm text-muted-foreground">Clique sur "Analyser avec l'AI" pour obtenir des conseils personnalisés.</p>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB - Redesigned */}
        {tab === "orders" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {[
                { key: "all", label: "Toutes" },
                { key: "pending", label: "En attente" },
                { key: "confirmed", label: "Confirmées" },
                { key: "shipped", label: "Expédiées" },
                { key: "delivered", label: "Livrées" },
                { key: "cancelled", label: "Annulées" },
              ].map(f => (
                <button key={f.key} onClick={() => setOrderFilter(f.key)}
                  className={`font-body text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border transition-colors ${
                    orderFilter === f.key ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  {f.label}
                  {f.key !== "all" && <span className="ml-1 opacity-60">({orders.filter(o => o.status === f.key).length})</span>}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 && <p className="text-muted-foreground font-body text-sm text-center py-10">Aucune commande</p>}

            {filteredOrders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden transition-all">
                  {/* Header row - always visible */}
                  <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-heading text-base text-foreground truncate">{order.product_name}</h4>
                        <span className={`font-body text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-body text-muted-foreground">
                        <span className="flex items-center gap-1"><Users size={12} /> {order.customer_name}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {order.wilaya}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="font-heading text-lg text-accent">{order.total_price.toLocaleString()} DZD</p>
                      {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 px-5 py-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Client info */}
                        <div className="space-y-2">
                          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Client</p>
                          <div className="space-y-1.5 text-sm font-body">
                            <p className="text-foreground flex items-center gap-2"><Users size={14} className="text-muted-foreground" /> {order.customer_name}</p>
                            <p className="text-foreground flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /> {order.customer_phone}</p>
                            <p className="text-foreground flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" /> {order.wilaya}, {order.commune}</p>
                            <p className="text-muted-foreground text-xs">{order.delivery_type === "domicile" ? "🏠 Livraison à domicile" : "📦 Stop Desk"}</p>
                          </div>
                        </div>

                        {/* Product info */}
                        <div className="space-y-2">
                          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Produit</p>
                          <div className="space-y-1.5 text-sm font-body">
                            <p className="text-foreground">{order.product_name}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Taille: <span className="text-foreground font-medium">{order.size}</span></span>
                              <span className="flex items-center gap-1.5">Couleur: <span className="inline-block w-4 h-4 rounded-full border border-border" style={{ backgroundColor: order.color }} /></span>
                              <span>Qté: <span className="text-foreground font-medium">{order.quantity}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing breakdown */}
                      <div className="bg-card border border-border rounded-lg p-4">
                        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Détail prix</p>
                        <div className="space-y-1.5 text-sm font-body">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prix produit</span>
                            <span className="text-foreground">{order.product_price.toLocaleString()} DZD</span>
                          </div>
                          {order.quantity > 1 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">× {order.quantity}</span>
                              <span className="text-foreground">{(order.product_price * order.quantity).toLocaleString()} DZD</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Livraison</span>
                            <span className="text-foreground">{order.shipping_price.toLocaleString()} DZD</span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-accent">
                              <span>Remise {order.promo_code && `(${order.promo_code})`}</span>
                              <span>-{order.discount_amount.toLocaleString()} DZD</span>
                            </div>
                          )}
                          <div className="border-t border-border pt-2 flex justify-between font-heading text-base">
                            <span className="text-foreground">Total</span>
                            <span className="text-accent">{order.total_price.toLocaleString()} DZD</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <p className="font-body text-[10px] text-muted-foreground">
                          <Hash size={10} className="inline" /> {order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-muted border border-border rounded-lg px-3 py-2 text-foreground font-body text-xs focus:outline-none focus:border-accent">
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            {!editingProduct && (
              <button onClick={() => { setShowAddProduct(!showAddProduct); setEditingProduct(null); }}
                className={btnPrimary + " mb-6 flex items-center gap-2"}>
                <Plus size={16} strokeWidth={2} /> Ajouter un produit
              </button>
            )}

            {showAddProduct && !editingProduct && renderProductForm(handleAddProduct, false)}
            {editingProduct && renderProductForm(handleEditProduct, true)}

            <div className="space-y-3">
              {products.length === 0 && <p className="text-muted-foreground font-body text-sm text-center py-10">Aucun produit</p>}
              {products.map((p) => (
                <div key={p.id} className={`bg-card border rounded-lg p-4 flex items-center gap-4 transition-all ${editingProduct === p.id ? "border-accent" : "border-border"}`}>
                  {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-16 h-20 object-cover rounded-lg" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-lg text-foreground truncate">{p.name}</p>
                      {!p.is_active && <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">Masqué</span>}
                      {p.is_promo && <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent">Promo</span>}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{p.category} · {p.price.toLocaleString()} DZD{p.old_price ? ` (ancien: ${p.old_price.toLocaleString()} DZD)` : ""}</p>
                    {p.colors.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5">
                        {p.colors.map((color, i) => (
                          <span key={i} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditProduct(p)} className="text-muted-foreground hover:text-accent transition-colors p-2" title="Modifier">
                      <Pencil size={16} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => toggleProduct(p.id, p.is_active)} className="text-muted-foreground hover:text-foreground transition-colors p-2" title={p.is_active ? "Masquer" : "Afficher"}>
                      {p.is_active ? <Eye size={16} strokeWidth={1.5} /> : <EyeOff size={16} strokeWidth={1.5} />}
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2" title="Supprimer">
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COLLECTIONS TAB - Full CRUD */}
        {tab === "collections" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-sm text-muted-foreground">Gère les collections affichées sur le site.</p>
              <button onClick={() => setShowAddCollection(!showAddCollection)} className={btnPrimary + " flex items-center gap-2"}>
                <Plus size={14} /> Ajouter
              </button>
            </div>

            {showAddCollection && (
              <form onSubmit={handleAddCollection} className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-heading text-lg text-foreground">Nouvelle collection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={newCollection.name} onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })} placeholder="Nom (ex: Hoodies)" required className={inputClass} />
                  <input value={newCollection.slug} onChange={(e) => setNewCollection({ ...newCollection, slug: e.target.value })} placeholder="Slug (ex: hoodies)" required className={inputClass} />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setNewCollectionImage(e.target.files?.[0] || null)} className="font-body text-sm text-muted-foreground" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className={btnPrimary}>Créer</button>
                  <button type="button" onClick={() => setShowAddCollection(false)} className={btnSecondary}>Annuler</button>
                </div>
              </form>
            )}

            {collections.map((col) => (
              <div key={col.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
                {col.image_url ? (
                  <img src={col.image_url} alt={col.name} className="w-24 h-20 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-24 h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground flex-shrink-0">
                    <Image size={24} strokeWidth={1} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {editingCollection === col.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input value={editCollectionName} onChange={(e) => setEditCollectionName(e.target.value)} className={inputClass + " !py-2"} />
                      <button onClick={() => handleUpdateCollectionName(col.id)} className={btnPrimary}>OK</button>
                      <button onClick={() => setEditingCollection(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-heading text-lg text-foreground">{col.name}</p>
                      <button onClick={() => { setEditingCollection(col.id); setEditCollectionName(col.name); }} className="text-muted-foreground hover:text-accent"><Pencil size={14} /></button>
                    </div>
                  )}
                  <p className="font-body text-xs text-muted-foreground mb-2">/{col.slug}</p>
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={(e) => setCollectionImages({ ...collectionImages, [col.id]: e.target.files?.[0] || null })} className="font-body text-xs text-muted-foreground max-w-[200px]" />
                    {collectionImages[col.id] && (
                      <button onClick={() => handleUpdateCollectionImage(col.id)} className={btnPrimary}>Sauvegarder</button>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDeleteCollection(col.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 flex-shrink-0" title="Supprimer">
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PROMOS TAB */}
        {tab === "promos" && (
          <div>
            <form onSubmit={handleAddPromo} className="bg-card border border-border rounded-lg p-6 mb-8">
              <h3 className="font-heading text-xl text-foreground mb-4">Nouveau Code Promo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })} placeholder="Code (ex: R3P20)" required className={inputClass + " pr-12"} />
                  <button type="button" onClick={() => setNewPromo({ ...newPromo, code: generatePromoCode() })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors p-1" title="Générer un code">
                    <Shuffle size={18} strokeWidth={1.5} />
                  </button>
                </div>
                <input type="number" value={newPromo.discount} onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })} placeholder="Réduction (%)" required min="1" max="100" className={inputClass} />
                <input type="number" value={newPromo.days} onChange={(e) => setNewPromo({ ...newPromo, days: e.target.value })} placeholder="Durée (jours)" required min="1" className={inputClass} />
                <input type="number" value={newPromo.maxUses} onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })} placeholder="Max utilisations (optionnel)" className={inputClass} />
              </div>
              <button type="submit" className={btnPrimary + " mt-4"}>Créer le code</button>
            </form>

            <div className="space-y-3">
              {promos.length === 0 && <p className="text-muted-foreground font-body text-sm text-center py-10">Aucun code promo</p>}
              {promos.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading text-lg text-foreground">{p.code}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      -{p.discount_percent}% · Expire le {new Date(p.expires_at).toLocaleDateString("fr-FR")} · {p.used_count}{p.max_uses ? `/${p.max_uses}` : ""} utilisations
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePromo(p.id, p.is_active)} className={`font-body text-xs px-3 py-1.5 rounded-lg border transition-colors ${p.is_active ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>
                      {p.is_active ? "Actif" : "Inactif"}
                    </button>
                    <button onClick={() => deletePromo(p.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2" title="Supprimer">
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
