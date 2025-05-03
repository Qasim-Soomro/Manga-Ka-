import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MangaDetailPage from "@/pages/manga-detail-page";
import MangaReaderPage from "@/pages/manga-reader-page";
import UserProfilePage from "@/pages/user-profile-page";
import CatalogPage from "@/pages/catalog-page";
import { ProtectedRoute } from "./lib/protected-route";
import MainLayout from "./components/layouts/main-layout";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/manga/:id" component={MangaDetailPage} />
      <Route path="/manga/:mangaId/chapter/:chapterId" component={MangaReaderPage} />
      <Route path="/catalog" component={CatalogPage} />
      <ProtectedRoute path="/profile" component={UserProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
