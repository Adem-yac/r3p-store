const STORAGE_PREFIX = "r3p_";

function getTable(name: string): any[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + name) || "[]"); }
  catch { return []; }
}
function setTable(name: string, data: any[]) {
  localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(data));
}
function genId() { return crypto.randomUUID(); }

class QueryChain {
  private filters: Array<{ col: string; op: string; val: any }> = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private isSingle = false;
  private isMaybe = false;
  private lim: number | null = null;
  private fields: string[] = ["*"];

  constructor(private table: string) {}

  select(cols: string) { this.fields = cols.split(",").map((c) => c.trim()); return this; }
  eq(col: string, val: any) { this.filters.push({ col, op: "eq", val }); return this; }
  gt(col: string, val: any) { this.filters.push({ col, op: "gt", val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orderCol = col; this.orderAsc = opts?.ascending ?? true; return this; }
  single() { this.isSingle = true; return this; }
  maybeSingle() { this.isMaybe = true; return this; }
  limit(n: number) { this.lim = n; return this; }

  then(resolve: (v: { data: any; error: any }) => any) {
    let result = getTable(this.table);
    for (const f of this.filters) {
      if (f.op === "eq") result = result.filter((r: any) => r[f.col] === f.val);
      else if (f.op === "gt") result = result.filter((r: any) => r[f.col] > f.val);
    }
    if (this.orderCol) {
      result.sort((a: any, b: any) => {
        const va = a[this.orderCol!], vb = b[this.orderCol!];
        return va < vb ? (this.orderAsc ? -1 : 1) : va > vb ? (this.orderAsc ? 1 : -1) : 0;
      });
    }
    if (this.lim) result = result.slice(0, this.lim);
    if (this.fields[0] !== "*") {
      result = result.map((r: any) => { const o: any = {}; for (const f of this.fields) o[f] = r[f]; return o; });
    }
    if (this.isMaybe) return resolve({ data: result[0] ?? null, error: null });
    if (this.isSingle) return resolve(result[0] ? { data: result[0], error: null } : { data: null, error: new Error("Not found") });
    return resolve({ data: result, error: null });
  }
}

class WriteChain {
  private filterCol: string | null = null;
  private filterVal: any = null;
  constructor(private table: string, private row: any, private isDelete = false) {}
  eq(col: string, val: any) { this.filterCol = col; this.filterVal = val; return this; }
  then(resolve: (v: { data: any; error: any }) => any) {
    if (this.isDelete && this.filterCol) {
      setTable(this.table, getTable(this.table).filter((r: any) => r[this.filterCol!] !== this.filterVal));
    } else if (this.filterCol) {
      setTable(this.table, getTable(this.table).map((r: any) =>
        r[this.filterCol!] === this.filterVal ? { ...r, ...this.row, updated_at: new Date().toISOString() } : r
      ));
    }
    return resolve({ data: null, error: null });
  }
}

const auth = {
  _user: JSON.parse(sessionStorage.getItem(STORAGE_PREFIX + "auth_user") || "null"),

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "r3prabah23@r3p.store";
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "rabah2002";
    if (email === adminEmail && password === adminPass) {
      this._user = { id: genId(), email };
      sessionStorage.setItem(STORAGE_PREFIX + "auth_user", JSON.stringify(this._user));
      const roles = getTable("user_roles");
      if (!roles.find((r: any) => r.user_id === this._user.id)) {
        roles.push({ id: genId(), user_id: this._user.id, role: "admin" });
        setTable("user_roles", roles);
      }
      return { data: { user: this._user }, error: null };
    }
    return { data: null, error: new Error("Email ou mot de passe incorrect") };
  },

  async getUser() { return { data: { user: this._user }, error: null }; },

  async signOut() { this._user = null; sessionStorage.removeItem(STORAGE_PREFIX + "auth_user"); return { error: null }; },
};

const storage = {
  from() {
    return {
      async upload(_path: string, file: File) {
        return new Promise<{ error: any }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const stored = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "files") || "{}");
            stored[_path] = reader.result as string;
            localStorage.setItem(STORAGE_PREFIX + "files", JSON.stringify(stored));
            resolve({ error: null });
          };
          reader.onerror = () => resolve({ error: new Error("File read failed") });
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl(path: string) {
        const stored = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "files") || "{}");
        return { data: { publicUrl: stored[path] || path } };
      },
    };
  },
};

function seed() {
  const tables = ["products", "orders", "promo_codes", "collections", "page_views", "user_roles"];
  for (const t of tables) { if (!localStorage.getItem(STORAGE_PREFIX + t)) setTable(t, []); }
  if (getTable("collections").length === 0) {
    const names = ["Hoodies", "Pantalons", "T-Shirts", "Vestes"];
    setTable("collections", names.map((n, i) => ({
      id: genId(), name: n, slug: n.toLowerCase().replace(/\s+/g, "-"), image_url: "", display_order: i + 1, created_at: new Date().toISOString(),
    })));
  }
}

seed();

export const localDb = {
  from(table: string) {
    const chain = new QueryChain(table);
    return {
      select: chain.select.bind(chain),
      eq: chain.eq.bind(chain),
      gt: chain.gt.bind(chain),
      order: chain.order.bind(chain),
      single: chain.single.bind(chain),
      maybeSingle: chain.maybeSingle.bind(chain),
      limit: chain.limit.bind(chain),
      then: chain.then.bind(chain),
      insert: (row: any) => {
        const newRow = { ...row, id: row.id || genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        const d = getTable(table); d.push(newRow); setTable(table, d);
        return { data: newRow, error: null };
      },
      update: (row: any) => new WriteChain(table, row, false),
      delete: () => new WriteChain(table, null, true),
      upsert: () => ({ data: null, error: null }),
    };
  },
  auth,
  storage,
  rpc: (_name: string, _args?: any) => ({ then(resolve: any) { resolve({ data: null, error: null }); } }),
  functions: {
    invoke: () => ({ then(resolve: any) { resolve({ data: { insights: "Analyse basée sur les données locales.\n\n• Ajoutez plus de produits.\n• Confirmez les commandes en attente rapidement.\n• Utilisez les promos pour booster les ventes." }, error: null }); } }),
  },
};
