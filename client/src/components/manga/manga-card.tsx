import { Manga } from "@shared/schema";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MangaCardProps {
  manga: Manga;
  badge?: string;
}

const MangaCard = ({ manga, badge }: MangaCardProps) => {
  // Placeholder rating - in a real app this would come from reviews
  const rating = (4 + Math.random()).toFixed(1);
  
  return (
    <div className="manga-card relative group">
      <Link href={`/manga/${manga.id}`}>
        <div className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
          <div className="relative pb-[140%]">
            <img 
              src={manga.coverUrl || "https://via.placeholder.com/300x400"} 
              alt={manga.title} 
              className="absolute h-full w-full object-cover"
            />
            {badge && (
              <div className="absolute top-0 left-0 p-2">
                <Badge className="bg-primary text-white text-xs px-2 py-1 rounded-md">
                  {badge}
                </Badge>
              </div>
            )}
            <div className="hover-info hidden absolute inset-0 bg-[#1A1A2E] bg-opacity-70 flex-col justify-end p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="font-bold text-sm">{manga.title}</h3>
              <div className="flex items-center mt-1 text-xs">
                <Star className="text-yellow-400 h-3 w-3 mr-1" />
                <span>{rating}</span>
                <span className="mx-2">•</span>
                <span>{manga.status || "Ongoing"}</span>
              </div>
              <p className="mt-1 text-xs line-clamp-2">
                {manga.description || "No description available."}
              </p>
            </div>
          </div>
          <div className="p-2 bg-white">
            <h3 className="font-bold text-gray-800 truncate">{manga.title}</h3>
            <div className="flex items-center text-xs text-gray-600">
              <span>Ch. {/* Display latest chapter number */}</span>
              <span className="mx-1">•</span>
              <span>{manga.status || "Ongoing"}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MangaCard;
