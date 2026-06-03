import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("r3prabah23@r3p.store");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        toast.error("Email non confirmé. Dans Supabase : Users → Confirm email, ou exécutez supabase/confirm-admin.sql");
      } else if (msg.includes("invalid")) {
        toast.error("Email ou mot de passe incorrect");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      toast.error("Erreur : " + roleError.message);
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (!roleData) {
      toast.error("Accès refusé — compte sans rôle administrateur");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    navigate("/r3padmin");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-4xl text-foreground text-center mb-8">
          {t("admin_login_title")}
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("admin_email")}
            required
            autoComplete="email"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("admin_password")}
            required
            autoComplete="current-password"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground font-heading text-lg tracking-wider py-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
          >
            {loading ? t("admin_login_button_loading") : t("admin_login_button")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
