"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/auth/auth-provider";
import LoginForm from "../components/auth/login-form";
import { ThemeProvider } from "../theme-context";
import { AuthProvider } from "../components/auth/auth-provider";
import { UserType } from "../components/auth/login-form";

function AuthenticatedApp() {
  const { user } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (user && !hasRedirected) {
      setHasRedirected(true);
      
      if (user.role === "admin") {
        router.push("/admin-panel");
      } else if (user.role === "seller" || user.role === "both") {
        router.push("/seller-panel");
      }
    }
  }, [user, router, hasRedirected]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
    </div>
  );
}

function UnauthenticatedApp() {
  const { login } = useAuth(); // Get the login method from AuthProvider
  
  const handleLogin = (user: UserType) => {
    console.log("User logged in:", user);
    
    // Call AuthProvider's login method to update the user state
    login(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => alert("Register flow coming soon")}
      />
    </div>
  );
}

function RootApp() {
  const { user, isLoading } = useAuth(); // Assuming your AuthProvider has isLoading
  
  console.log("RootApp - user:", user, "isLoading:", isLoading); // Debug log
  
  // If AuthProvider doesn't have isLoading, you can remove this and the check below
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Checking session...</p>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

export default function Page() {
  return <RootApp />;
}
