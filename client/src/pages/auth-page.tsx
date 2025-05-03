import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AuthForms from "@/components/auth/auth-forms";

const AuthPage = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Get the default tab from URL query params (if any)
  const url = new URL(window.location.href);
  const tabParam = url.searchParams.get("tab");
  const defaultTab = (tabParam === "register") ? "register" : "login";

  // If user is already logged in, redirect to home or requested page
  useEffect(() => {
    if (user) {
      const redirectTo = url.searchParams.get("redirectTo") || "/";
      setLocation(redirectTo);
    }
  }, [user, setLocation, url.searchParams]);

  return (
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-8 items-center">
        {/* Left column - Auth forms */}
        <div className="w-full md:w-1/2">
          <AuthForms defaultTab={defaultTab} />
        </div>
        
        {/* Right column - Hero content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-primary">Manga-KA</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your ultimate destination for manga reading. Join our community to discover, 
            track, and enjoy thousands of manga titles all in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">Keep track of what you're reading and never lose your place.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Rate & Review</h3>
              <p className="text-gray-600 text-sm">Share your thoughts on your favorite manga titles.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Latest Updates</h3>
              <p className="text-gray-600 text-sm">Stay up to date with the newest chapter releases.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Discover New Series</h3>
              <p className="text-gray-600 text-sm">Find your next favorite manga with personalized recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
