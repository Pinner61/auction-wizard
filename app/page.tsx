"use client"

import { useState } from "react"
import AuctionBuilderWizard from "../auction-wizard"
import AuctionDashboard from "../components/dashboard/auction-dashboard"
import UserProfile from "../components/auth/user-profile"
import { AuthProvider, useAuth } from "../components/auth/auth-provider"
import AuthGuard from "../components/auth/auth-guard"
import { ThemeProvider } from "../theme-context"
import { User, Plus, Gavel, ArrowLeft, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

type ViewMode = "dashboard" | "create-auction"

function DashboardHeader({ viewMode, onViewChange }: { viewMode: ViewMode; onViewChange: (mode: ViewMode) => void }) {
  const { user, logout, updateUser } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  if (!user) return null

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <img
                  src="/briskon-auction-horizontal-logo-white.png"
                  alt="Briskon logo"
                  className="w-15 h-7 mr-6" // Reduced from w-8 h-8 to w-6 h-6
                />
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Auction Portal</h1>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user.name}</span>
                <span className="px-2 py-1 text-xs font-medium bg-corporate-100 text-corporate-800 dark:bg-corporate-900/30 dark:text-corporate-300 rounded-full">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {viewMode === "create-auction" ? (
                <Button onClick={() => onViewChange("dashboard")} variant="outline" className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => onViewChange("dashboard")}
                    variant={viewMode === "dashboard" ? "default" : "outline"}
                    className="flex items-center"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => onViewChange("create-auction")}
                    className="flex items-center bg-corporate-600 hover:bg-corporate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Auction
                  </Button>
                </>
              )}

              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <UserProfile
              user={user}
              onLogout={() => {
                logout()
                setShowProfile(false)
              }}
              onUpdateUser={updateUser}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AuthenticatedApp() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {viewMode === "dashboard" ? (
          <AuctionDashboard onCreateAuction={() => setViewMode("create-auction")} />
        ) : (
          <AuthGuard requiredRole={["admin", "auctioneer", "organization"]}>
            <AuctionBuilderWizard />
          </AuthGuard>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <AuthenticatedApp />
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
