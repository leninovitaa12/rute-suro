// src/lib/auth.js
import { getCurrentUser, checkIsAdmin, getCurrentUserProfile } from "./authService";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Belum login.");

  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) throw new Error("Akses ditolak: bukan admin.");

  const profile = await getCurrentUserProfile(user.id);
  return { user, profile };
}
