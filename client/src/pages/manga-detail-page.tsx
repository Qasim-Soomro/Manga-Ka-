import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Manga, Genre } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, List, Star, Bookmark, Loader2 } from "lucide-react";
import MangaChapterList from "@/components/manga/manga-chapter-list";
import MangaReviews from "@/components/manga/manga-reviews";

interface MangaWithGenres extends Manga {
  genres: Genre[];
}

const MangaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const mangaId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("chapters");
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  
  // Fetch manga details
  const { 
    data: manga, 
    isLoading: isLoadingManga, 
    error: mangaError 
  } = useQuery<MangaWithGenres>({
    queryKey: [`/api/mangas/${mangaId}`],
  });
  
  // Check if manga is in user's library
  const { 
    data: libraryStatus, 
    isLoading: isLoadingLibraryStatus 
  } = useQuery({
    queryKey: ["/api/user/library"],
    enabled: !!user,
  });
  
  const isInLibrary = libraryStatus?.some((item: any) => item.mangaId === mangaId);
  
  // Add manga to library
  const addToLibrary = async () => {
    if (!user) {
      // Save the current URL to return to after login
      setLocation(`/auth?redirectTo=/manga/${mangaId}`);
      return;
    }
    
    setIsAddingToLibrary(true);
    
    try {
      await apiRequest("POST", "/api/user/library", {
        mangaId,
        status: "plan_to_read",
      });
      
      // Invalidate library query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["/api/user/library"] });
      
      toast({
        title: "Added to library",
        description: "This manga has been added to your library",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add manga to library",
        variant: "destructive",
      });
    } finally {
      setIsAddingToLibrary(false);
    }
  };
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  if (isLoadingManga) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <Skeleton className="rounded-lg w-full h-[500px]" />
          </div>
          <div className="md:w-2/3 md:pl-8">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-6" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }
  
  if (mangaError || !manga) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manga Not Found</h2>
        <p className="text-gray-600 mb-6">
          The manga you're looking for doesn't exist or there was an error loading it.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/catalog"}
        >
          Browse Catalog
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-[#1A1A2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={manga.coverUrl || "https://via.placeholder.com/500x700"} 
                  alt={manga.title} 
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {manga.genres.map((genre) => (
                  <Link key={genre.id} href={`/catalog?genre=${genre.id}`}>
                    <Badge variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600 cursor-pointer">
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div className="md:w-2/3 md:pl-8">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold font-['Poppins']">{manga.title}</h1>
                <div className="flex space-x-2">
                  <Button 
                    variant={isInLibrary ? "default" : "outline"} 
                    onClick={addToLibrary}
                    disabled={isAddingToLibrary || isLoadingLibraryStatus}
                    className="bg-transparent border border-primary hover:bg-primary text-white font-bold transition duration-300 flex items-center"
                  >
                    {isAddingToLibrary ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark className="mr-2 h-4 w-4" />
                    )}
                    {isInLibrary ? "In Library" : "Add to Library"}
                  </Button>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  <Star className="text-yellow-400 mr-1 h-5 w-5" />
                  <span className="text-lg font-bold">4.9</span>
                </div>
                <span className="mx-2 text-gray-400">•</span>
                <span>{manga.status === 'completed' ? 'Completed' : 'Ongoing'}</span>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-300">
                {manga.author && (
                  <>
                    <span className="flex items-center">
                      <i className="fas fa-user mr-1"></i> {manga.author}
                    </span>
                    <span className="mx-2">•</span>
                  </>
                )}
                <span className="flex items-center">
                  <i className="fas fa-eye mr-1"></i> 10.2M reads
                </span>
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Synopsis</h2>
                <p className="text-gray-300">
                  {manga.description || "No description available."}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/manga/${mangaId}/chapter/1`}>
                  <Button className="bg-primary hover:bg-opacity-90 text-white font-bold transition duration-300 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" /> Read First Chapter
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="bg-transparent border border-white hover:border-primary hover:text-primary text-white font-bold transition duration-300 flex items-center"
                  onClick={() => setActiveTab("chapters")}
                >
                  <List className="mr-2 h-4 w-4" /> View All Chapters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="reviews">Reviews & Ratings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chapters">
            <MangaChapterList mangaId={mangaId} />
          </TabsContent>
          
          <TabsContent value="reviews">
            <MangaReviews mangaId={mangaId} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MangaDetailPage;
