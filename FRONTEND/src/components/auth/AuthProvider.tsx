"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (mounted) {
        if (error) {
          console.error("Error fetching session:", error.message);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchRole(session.user.id);
        } else {
          setIsLoading(false);
        }
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchRole(session.user.id);
        } else {
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();
        
      if (error) {
        console.error("Error fetching role:", error.message);
      } else if (data) {
        setRole(data.role);
      }
    } catch (err) {
      console.error("Failed to fetch role:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Protect routes that are not login/signup
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = pathname === "/login" || pathname === "/signup" || pathname === "/";
      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && (pathname === "/login" || pathname === "/signup")) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Example role-based protection (can be expanded based on specific routes)
  // if (pathname.startsWith('/admin') && role !== 'admin') {
  //   return <div className="min-h-screen flex items-center justify-center bg-background text-2xl font-bold">Forbidden</div>;
  // }

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
