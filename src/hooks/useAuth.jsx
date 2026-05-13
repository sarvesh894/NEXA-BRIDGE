import {
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";

import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [session, setSession] = useState(null);

  const [profile, setProfile] = useState(null);

  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    setProfile(data);
  };

  const fetchRole = async (userId) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    setRole(data?.role ?? null);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);

            fetchRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);

          setRole(null);
        }

        setLoading(false);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);

        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id);

          fetchRole(session.user.id);
        }

        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const updateLastSeen = () => {
      supabase
        .from("profiles")
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .then();
    };

    updateLastSeen();

    const interval = setInterval(
      updateLastSeen,
      2 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [user]);

  const signUp = async (
    email,
    password,
    fullName,
    selectedRole,
    institutionName
  ) => {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,

        options: {
          data: {
            full_name: fullName,

            role: selectedRole,

            institution_name:
              selectedRole === "institution"
                ? institutionName?.trim() ||
                  fullName
                : undefined,
          },
        },
      });

    if (error) throw error;

    if (data.user) {
      const roleToInsert = selectedRole;

      await supabase
        .from("user_roles")
        .upsert(
          {
            user_id: data.user.id,
            role: roleToInsert,
          },
          {
            onConflict: "user_id,role",
          }
        );

      if (selectedRole === "institution") {
        const institutionDisplayName =
          institutionName?.trim() || fullName;

        await supabase
          .from("profiles")
          .update({
            full_name: fullName,

            company: institutionDisplayName,
          })
          .eq("user_id", data.user.id);

        const {
          data: existingInstitution,
        } = await supabase
          .from("institutions")
          .select("id")
          .eq("managed_by", data.user.id)
          .maybeSingle();

        if (!existingInstitution) {
          await supabase
            .from("institutions")
            .insert({
              name: institutionDisplayName,

              managed_by: data.user.id,

              description: "",

              location: "",

              city: "",

              state: "",

              website: "",

              type: "government",

              affiliation: "",

              departments: [],

              total_students: 0,

              placement_rate: 0,

              highest_package: "",

              average_package: "",

              is_featured: false,
            });
        }
      }
    }
  };

  const signIn = async (
    email,
    password
  ) => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);

      await fetchRole(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        refreshProfile,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}