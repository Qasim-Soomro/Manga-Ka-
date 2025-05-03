import { useQuery } from "@tanstack/react-query";
import { Manga } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import MangaCard from "../manga/manga-card";

const PopularMangaSection = () => {
  const { data: mangas, isLoading, error } = useQuery<Manga[]>({
    queryKey: ["/api/mangas/popular"],
  });

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-['Poppins'] font-bold text-gray-900">Popular This Week</h2>
        <Link href="/catalog?view=popular" className="text-primary hover:text-opacity-80 font-medium flex items-center">
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-md">
              <div className="relative pb-[140%]">
                <Skeleton className="absolute inset-0 h-full w-full" />
              </div>
              <div className="p-2 bg-white">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-10">
            <p className="text-red-500 mb-2">Failed to load popular manga</p>
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
          mangas?.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))
        )}
      </div>
    </section>
  );
};

export default PopularMangaSection;
