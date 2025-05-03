import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { UserLibrary, Manga } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Star, Calendar, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface LibraryItem extends UserLibrary {
  manga: Manga;
}

const UserProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Get the active tab from URL query params (if any)
  const url = new URL(window.location.href);
  const tabParam = url.searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState(tabParam || "library");
  const [activeLibraryFilter, setActiveLibraryFilter] = useState("all");
  
  // Fetch user's library
  const { 
    data: libraryItems, 
    isLoading, 
    error 
  } = useQuery<LibraryItem[]>({
    queryKey: ["/api/user/library"],
  });
  
  // Filter library items based on the active filter
  const filteredLibraryItems = libraryItems?.filter(item => {
    if (activeLibraryFilter === "all") return true;
    return item.status === activeLibraryFilter;
  });
  
  // Update URL when tab changes
  useEffect(() => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", newUrl.toString());
  }, [activeTab]);
  
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Available</h2>
        <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
        <Link href="/auth">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#1A1A2E] text-white p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300 mb-4 md:mb-0 md:mr-6">
              <img 
                src={user.avatarUrl || "https://via.placeholder.com/150"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-300 mt-1">Joined {user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'recently'}</p>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <span className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-full text-sm mr-2">
                  Manga Reader
                </span>
                {libraryItems && libraryItems.some(item => item.status === 'completed') && (
                  <span className="bg-[#4ECDC4] bg-opacity-20 text-[#4ECDC4] px-3 py-1 rounded-full text-sm">
                    Collector
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b">
              <TabsTrigger value="library" className="px-4 py-2 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                My Library
              </TabsTrigger>
              <TabsTrigger value="history" className="px-4 py-2 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Reading History
              </TabsTrigger>
              <TabsTrigger value="reviews" className="px-4 py-2 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-4 py-2 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="library" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">My Library</h2>
                <div className="flex">
                  <Button 
                    variant={activeLibraryFilter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveLibraryFilter("all")}
                    className="rounded-l-md"
                  >
                    All
                  </Button>
                  <Button 
                    variant={activeLibraryFilter === "reading" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveLibraryFilter("reading")}
                  >
                    Reading
                  </Button>
                  <Button 
                    variant={activeLibraryFilter === "completed" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveLibraryFilter("completed")}
                  >
                    Completed
                  </Button>
                  <Button 
                    variant={activeLibraryFilter === "plan_to_read" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveLibraryFilter("plan_to_read")}
                    className="rounded-r-md"
                  >
                    Plan to Read
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden shadow-md">
                      <div className="relative pb-[140%]">
                        <Skeleton className="absolute inset-0 h-full w-full" />
                      </div>
                      <div className="p-2 bg-white">
                        <Skeleton className="h-5 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">Failed to load your library</p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredLibraryItems?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your library is empty</h3>
                  <p className="text-gray-600 mb-6">
                    {activeLibraryFilter === "all" 
                      ? "Start adding manga to your library" 
                      : `You don't have any manga marked as ${activeLibraryFilter.replace('_', ' ')}`}
                  </p>
                  <Link href="/catalog">
                    <Button>Browse Catalog</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredLibraryItems?.map((item) => (
                    <div key={item.id} className="manga-card relative group">
                      <Link href={`/manga/${item.mangaId}`}>
                        <div className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
                          <div className="relative pb-[140%]">
                            <img 
                              src={item.manga.coverUrl || "https://via.placeholder.com/300x400"} 
                              alt={item.manga.title} 
                              className="absolute h-full w-full object-cover"
                            />
                            <div className="absolute top-0 right-0 p-2">
                              <span className={`text-white text-xs px-2 py-1 rounded-md ${
                                item.status === 'reading' ? 'bg-primary' : 
                                item.status === 'completed' ? 'bg-[#4ECDC4]' : 
                                'bg-gray-500'
                              }`}>
                                {item.status === 'plan_to_read' ? 'Plan to Read' : 
                                 item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </span>
                            </div>
                            <div className="hover-info hidden absolute inset-0 bg-[#1A1A2E] bg-opacity-70 flex-col justify-end p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-sm">{item.manga.title}</h3>
                              </div>
                              <div className="flex items-center mt-1 text-xs">
                                <span>
                                  {item.currentChapter 
                                    ? `Progress: Chapter ${item.currentChapter}` 
                                    : 'Not started yet'}
                                </span>
                              </div>
                              {item.currentChapter && (
                                <div className="mt-2">
                                  <div className="h-1 bg-gray-600 rounded-full">
                                    <div 
                                      className="h-1 bg-primary rounded-full" 
                                      style={{ width: `${Math.min(100, (item.currentChapter / 100) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-2 bg-white">
                            <h3 className="font-bold text-gray-800 truncate">{item.manga.title}</h3>
                            <div className="flex items-center text-xs text-gray-600">
                              <span>
                                {item.lastReadAt 
                                  ? `Updated ${format(new Date(item.lastReadAt), 'MMM d, yyyy')}` 
                                  : 'Not started yet'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reading History</h3>
                <p className="text-gray-600 mb-6">
                  Track your reading progress and history over time
                </p>
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-4">
                  <p className="text-gray-500">
                    This feature is coming soon. Stay tuned!
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">My Reviews</h3>
                <p className="text-gray-600 mb-6">
                  View and manage all your manga reviews
                </p>
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-4">
                  <p className="text-gray-500">
                    You haven't written any reviews yet. Start rating your favorite manga!
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Settings</h3>
                <p className="text-gray-600 mb-6">
                  Manage your account settings and preferences
                </p>
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-4">
                  <p className="text-gray-500">
                    Account settings will be available soon!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
