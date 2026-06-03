import { toast } from "sonner";

/** Affiche l'erreur Supabase et retourne false si échec */
export function handleDbError(error: { message: string } | null, successMsg?: string): boolean {
  if (error) {
    toast.error(error.message);
    return false;
  }
  if (successMsg) toast.success(successMsg);
  return true;
}
