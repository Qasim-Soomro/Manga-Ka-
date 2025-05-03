import { useQuery } from "@tanstack/react-query";
import { Genre } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Sword, 
  Heart, 
  Ghost, 
  Rocket, 
  Laugh,
  Crown
} from "lucide-react";

// Map genre names to icons
const getGenreIcon = (name: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Action': <Sword className="text-primary group-hover:text-white text-2xl" />,
    'Romance': <Heart className="text-primary group-hover:text-white text-2xl" />,
    'Horror': <Ghost className="text-primary group-hover:text-white text-2xl" />,
    'Sci-Fi': <Rocket className="text-primary group-hover:text-white text-2xl" />,
    'Comedy': <Laugh className="text-primary group-hover:text-white text-2xl" />,
    'Fantasy': <Crown className="text-primary group-hover:text-white text-2xl" />,
  };
  
  return iconMap[name] || <Sword className="text-primary group-hover:text-white text-2xl" />;
};

const GenresSection = () => {
  const { data: genres, isLoading, error } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-['Poppins'] font-bold text-gray-900 mb-6">Browse by Genre</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
              <Skeleton className="h-5 w-20 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-10">
            <p className="text-red-500 mb-2">Failed to load genres</p>
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
          genres?.slice(0, 6).map((genre) => (
            <div key={genre.id} className="relative">
              <Link href={`/catalog?genre=${genre.id}`}>
                <div className="group block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-3 bg-primary bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition duration-300">
                    {getGenreIcon(genre.name)}
                  </div>
                  <h3 className="font-bold text-gray-800">{genre.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {/* In a real app, we'd fetch the count of manga for each genre */}
                    {Math.floor(Math.random() * 1000) + 100} titles
                  </p>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default GenresSection;
