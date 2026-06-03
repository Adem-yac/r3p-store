import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("r3prabah23@r3p.store");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSignup = async () => {
    if (!email.trim() || !password) {
      toast.error("Email et mot de passe requis");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user) {
      toast.success(
        "Compte créé ! Connectez-vous. Si besoin, exécutez supabase/bootstrap.sql dans Supabase (trigger admin auto)."
      );
      setMode("login");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      toast.error(
        error.message.includes("Invalid")
          ? "Compte introuvable. Cliquez « Créer le compte admin » ci-dessous."
          : error.message
      );
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
      toast.error("Erreur serveur : " + roleError.message);
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (!roleData) {
      toast.error(
        "Pas encore admin. Exécutez supabase/bootstrap.sql dans Supabase, ou recréez le compte après ce SQL."
      );
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
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("admin_password")}
            required
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

        <button
          type="button"
          disabled={loading}
          onClick={handleSignup}
          className="w-full mt-3 border border-border text-muted-foreground font-heading text-sm tracking-wider py-3 rounded-lg hover:text-foreground hover:border-accent transition-all disabled:opacity-40"
        >
          Créer le compte admin (première fois)
        </button>

        <p className="mt-6 text-center text-muted-foreground font-body text-xs leading-relaxed">
          Mot de passe oublié ou erreur ? Utilisez « Créer le compte admin », puis connectez-vous.
          <br />
          SQL une fois : fichier <code className="text-accent">supabase/bootstrap.sql</code>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
