import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import HeroSection from "@/components/home/hero-section";
import PopularMangaSection from "@/components/home/popular-manga-section";
import LatestUpdatesSection from "@/components/home/latest-updates-section";
import GenresSection from "@/components/home/genres-section";
import CommunitySection from "@/components/home/community-section";

const HomePage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // If there's a redirect param, handle it after auth check
  useEffect(() => {
    const url = new URL(window.location.href);
    const redirectTo = url.searchParams.get("redirectTo");
    
    if (redirectTo && user) {
      // Clean up URL and redirect
      url.searchParams.delete("redirectTo");
      window.history.replaceState({}, document.title, url.pathname);
      setLocation(redirectTo);
    }
  }, [user, setLocation]);

  return (
    <div>
      <HeroSection />
      <PopularMangaSection />
      <LatestUpdatesSection />
      <GenresSection />
      <CommunitySection />
    </div>
  );
};

export default HomePage;
