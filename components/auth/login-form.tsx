"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, Building, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation"; // ✅ Import router

export type UserRole = "admin" | "seller" | "both";

export interface UserType {
  id: string;
  email: string;
  fname: string;
  lname: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface LoginFormProps {
  onLogin: (user: UserType) => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserType | null>(null);

  const router = useRouter(); // ✅ Initialize router

  useEffect(() => {
    const storedUser = localStorage.getItem("auction_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    const supaUser: SupabaseUser = data.user;
    const session = data.session;

    const meta = supaUser.user_metadata || {};
    let userTypeData: UserType = {
      id: supaUser.id,
      email: supaUser.email || meta.email || "",
      fname: "",
      lname: "",
      role: (meta.role as UserRole) || "seller",
      organization: meta.organization || "",
      avatar: meta.avatar || "",
      isVerified: !!supaUser.email_confirmed_at,
      createdAt: supaUser.created_at,
      lastLogin: new Date().toISOString(),
    };

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("fname, lname")
        .eq("id", supaUser.id)
        .single();

      if (profileError) throw profileError;
      if (profile) {
        userTypeData = {
          ...userTypeData,
          fname: profile.fname || "",
          lname: profile.lname || "",
        };
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile data.");
      setIsLoading(false);
      await supabase.auth.signOut();
      return;
    }

    const allowedRoles = ["seller", "both", "admin"];
    if (!allowedRoles.includes(userTypeData.role.toLowerCase())) {
      setError("Access denied. Only sellers or accounts with both roles can log in to this portal.");
      setIsLoading(false);
      await supabase.auth.signOut();
      return;
    }

// ✅ Final step after saving to localStorage
localStorage.setItem("auction_user", JSON.stringify(userTypeData));
localStorage.setItem("auction_session", JSON.stringify(session));
setUser(userTypeData);
onLogin(userTypeData);

// ✅ Role-based redirect
if (userTypeData.role === "admin") {
  router.push("/admin-panel");
} else if (userTypeData.role === "seller" || userTypeData.role === "both") {
  router.push("/seller-panel");
}


    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-corporate-100 dark:bg-corporate-900 rounded-full mx-auto mb-4">
            <Building className="w-8 h-8 text-corporate-600 dark:text-corporate-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to Auction Portal</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to access the auction management system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-corporate-500 focus:border-corporate-500 transition-colors"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-corporate-500 focus:border-corporate-500 transition-colors"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-corporate-600 hover:bg-corporate-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
