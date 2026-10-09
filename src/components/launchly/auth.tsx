import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
type Profile = {
  id: string;
  full_name: string;
  approval_status: string;
  role: "donor" | "organizer" | "admin";
};
const AuthContext = createContext<{
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}>({ user: null, profile: null, loading: true, error: "", reload: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  async function reload() {
    const { data } = await supabase.auth.getSession();
    const current = data.session?.user ?? null;
    setUser(current);
    setError("");
    if (current) {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", current.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", current.id).single(),
      ]);
      if (p.error || r.error) {
        setError("Your account could not be loaded. Please try again.");
        setProfile(null);
      } else setProfile({ ...p.data, role: r.data.role });
    } else setProfile(null);
    setLoading(false);
  }
  useEffect(() => {
    let live = true;
    void reload();
    const { data } = supabase.auth.onAuthStateChange(() => {
      if (live) {
        queryClient.clear();
        setTimeout(() => {
          if (live) void reload();
        }, 0);
      }
    });
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ user, profile, loading, error, reload }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
