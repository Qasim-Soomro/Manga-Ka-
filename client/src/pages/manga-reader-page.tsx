import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Chapter, Manga } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  ArrowRight,
  Settings,
  List,
  Loader2
} from "lucide-react";
import MangaComments from "@/components/manga/manga-comments";

const MangaReaderPage = () => {
  const { mangaId: mangaIdParam, chapterId: chapterIdParam } = useParams<{ mangaId: string, chapterId: string }>();
  const mangaId = parseInt(mangaIdParam);
  const chapterId = parseInt(chapterIdParam);
  const { user } = useAuth();
  const { toast } = useToast();
  const [updateProgress, setUpdateProgress] = useState(false);
  
  // Fetch chapter details
  const { 
    data: chapter, 
    isLoading: isLoadingChapter, 
    error: chapterError 
  } = useQuery<Chapter>({
    queryKey: [`/api/chapters/${chapterId}`],
  });
  
  // Fetch manga details
  const { 
    data: manga, 
    isLoading: isLoadingManga, 
    error: mangaError 
  } = useQuery<Manga>({
    queryKey: [`/api/mangas/${mangaId}`],
  });
  
  // Fetch all chapters to determine prev/next
  const { 
    data: allChapters, 
    isLoading: isLoadingAllChapters, 
    error: allChaptersError 
  } = useQuery<Chapter[]>({
    queryKey: [`/api/mangas/${mangaId}/chapters`],
  });
  
  // Determine previous and next chapter IDs
  const chapterIndex = allChapters?.findIndex(c => c.id === chapterId) ?? -1;
  const prevChapter = chapterIndex > 0 ? allChapters?.[chapterIndex - 1] : null;
  const nextChapter = chapterIndex >= 0 && chapterIndex < (allChapters?.length ?? 0) - 1 
    ? allChapters?.[chapterIndex + 1] 
    : null;
  
  // Mock image URLs for the pages
  const pageSources = [
    "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80",
    "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  ];
  
  // Update user library with current reading progress
  const updateLibraryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/library", {
        mangaId,
        status: "reading",
        currentChapter: chapter?.number,
        lastReadAt: new Date()
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/library"] });
    },
    onError: (error) => {
      console.error("Failed to update reading progress:", error);
    }
  });
  
  // Update reading progress when a chapter is loaded (if user is logged in)
  useEffect(() => {
    if (user && chapter && !updateProgress) {
      setUpdateProgress(true);
      updateLibraryMutation.mutate();
    }
  }, [user, chapter, updateProgress]);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterId]);
  
  if (isLoadingChapter || isLoadingManga || isLoadingAllChapters) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <div className="bg-[#1A1A2E] text-white sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="w-6 h-6 mr-4 bg-gray-700" />
                <Skeleton className="w-64 h-6 bg-gray-700" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="w-6 h-6 bg-gray-700" />
                <Skeleton className="w-6 h-6 bg-gray-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="w-36 h-10 bg-gray-700" />
            <Skeleton className="w-20 h-6 bg-gray-700" />
            <Skeleton className="w-36 h-10 bg-gray-700" />
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="w-full h-[500px] bg-gray-700" />
            <Skeleton className="w-full h-[500px] bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }
  
  if (chapterError || !chapter || mangaError || !manga) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chapter Not Found</h2>
          <p className="text-gray-400 mb-6">
            The chapter you're looking for doesn't exist or there was an error loading it.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href={`/manga/${mangaId}`}>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Back to Manga
              </Button>
            </Link>
            <Link href="/catalog">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="bg-[#1A1A2E] text-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href={`/manga/${mangaId}`}>
                <a className="text-white mr-4 hover:text-primary transition duration-150">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Link>
              <h1 className="text-lg font-medium truncate pr-4">
                {manga.title}: Chapter {chapter.number} {chapter.title ? `- ${chapter.title}` : ""}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="hover:text-primary transition duration-150">
                <Settings className="h-5 w-5" />
              </button>
              <div className="relative">
                <button className="hover:text-primary transition duration-150">
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          {prevChapter ? (
            <Link href={`/manga/${mangaId}/chapter/${prevChapter.id}`}>
              <Button className="text-white bg-primary bg-opacity-80 hover:bg-opacity-100 transition duration-150 flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Chapter
              </Button>
            </Link>
          ) : (
            <Button disabled className="text-white bg-gray-600 cursor-not-allowed flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous Chapter
            </Button>
          )}
          
          <div className="text-white">
            Chapter {chapter.number}
          </div>
          
          {nextChapter ? (
            <Link href={`/manga/${mangaId}/chapter/${nextChapter.id}`}>
              <Button className="text-white bg-primary bg-opacity-80 hover:bg-opacity-100 transition duration-150 flex items-center">
                Next Chapter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button disabled className="text-white bg-gray-600 cursor-not-allowed flex items-center">
              Next Chapter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="reading-page mb-6 overflow-y-auto flex flex-col items-center">
          {/* Display chapter pages */}
          {pageSources.map((src, index) => (
            <img 
              key={index} 
              src={src} 
              alt={`Page ${index + 1}`} 
              className="max-w-full h-auto mb-4"
              loading="lazy"
            />
          ))}
        </div>

        <MangaComments chapterId={chapterId} />
      </div>
    </div>
  );
};

export default MangaReaderPage;
