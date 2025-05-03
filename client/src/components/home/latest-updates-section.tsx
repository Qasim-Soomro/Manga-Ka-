import { useQuery } from "@tanstack/react-query";
import { Manga, Chapter } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface LatestUpdate {
  manga: Manga;
  chapter: Chapter;
}

const LatestUpdatesSection = () => {
  // First, get the latest manga
  const { data: latestMangas, isLoading: mangasLoading, error: mangasError } = useQuery<Manga[]>({
    queryKey: ["/api/mangas/latest"],
  });
  
  // Then get chapters for each manga
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters/latest"],
    enabled: !!latestMangas
  });
  
  // Combine manga and chapters into LatestUpdate objects
  const latestUpdates: LatestUpdate[] = [];
  if (latestMangas && chapters) {
    for (const chapter of chapters) {
      const manga = latestMangas.find(m => m.id === chapter.mangaId);
      if (manga) {
        latestUpdates.push({
          manga,
          chapter
        });
      }
    }
  }
  
  const isLoading = mangasLoading || chaptersLoading;
  const error = mangasError || chaptersError;

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-['Poppins'] font-bold text-gray-900">Latest Updates</h2>
          <Link href="/catalog?view=latest" className="text-primary hover:text-opacity-80 font-medium flex items-center">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="p-3 flex-1">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-10">
              <p className="text-red-500 mb-2">Failed to load latest updates</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Retry loading data
                  window.location.reload();
                }}
              >
                Try Again
              </Button>
            </div>
          ) : (
            latestUpdates?.map((update, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={update.manga.coverUrl || "https://via.placeholder.com/150"} 
                      alt={update.manga.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex-1">
                    <h3 className="font-bold text-gray-800">{update.manga.title}</h3>
                    <div className="text-xs text-gray-600 mb-1">
                      <span className="font-semibold">Chapter {update.chapter.number}:</span> {update.chapter.title}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">New</span>
                      <span className="text-xs text-gray-500">
                        {update.chapter.releaseDate 
                          ? format(new Date(update.chapter.releaseDate), 'PPP') 
                          : 'Today'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestUpdatesSection;
