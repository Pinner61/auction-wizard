"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Mail, Lock, Building, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "admin" | "auctioneer" | "organization"

export interface UserType {
  id: string
  email: string
  name: string
  role: UserRole
  organization?: string
  avatar?: string
  isVerified: boolean
  createdAt: string
  lastLogin?: string
}

interface LoginFormProps {
  onLogin: (user: UserType) => void
  onSwitchToRegister: () => void
}

export default function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<UserType | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auction_user")
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Supabase sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }
    const supaUser: SupabaseUser = data.user
    const session = data.session

    // Extract info from user_metadata
    const meta = supaUser.user_metadata || {}
    let userTypeData: UserType = {
      id: supaUser.id,
      email: supaUser.email || meta.email || "",
      name: meta.name || "",
      role: (meta.role as UserRole) || "auctioneer",
      organization: meta.organization || "",
      avatar: meta.avatar || "",
      isVerified: !!supaUser.email_confirmed_at,
      createdAt: supaUser.created_at,
      lastLogin: new Date().toISOString(),
    }
    
    // // Optionally fetch from profiles table for more info
    // try {
    //   const { data: profile } = await supabase
    //     .from("profiles")
    //     .select("*")
    //     .eq("id", supaUser.id)
    //     .single()
    //   if (profile) {
    //     userType = {
    //       ...userType,
    //       name: profile.name || userType.name,
    //       role: (profile.role as UserRole) || userType.role,
    //       organization: profile.organization || userType.organization,
    //       avatar: profile.avatar || userType.avatar,
    //     }
    //   }
    // } catch {}

    // Store in localStorage and state
    localStorage.setItem("auction_user", JSON.stringify(userTypeData))
    localStorage.setItem("auction_session", JSON.stringify(session))
    setUser(userTypeData)
    onLogin(userTypeData)
    setIsLoading(false)
  }

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
{/* 
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Demo Accounts</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("auctioneer")}
              className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Auctioneer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("organization")}
              className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Organization Demo
            </button>
          </div>
        </div> */}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium text-corporate-600 dark:text-corporate-400 hover:text-corporate-500 dark:hover:text-corporate-300"
            >
              Sign up here
            </button>
          </p>
        </div>

        {/* <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Demo Credentials:</strong> Use any demo account above or email: any demo email, password:
            password123
          </p>
        </div> */}
      </div>
    </div>
  )
}
