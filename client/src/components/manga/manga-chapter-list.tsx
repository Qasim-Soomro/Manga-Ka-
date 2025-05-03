import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chapter } from "@shared/schema";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface MangaChapterListProps {
  mangaId: number;
}

const MangaChapterList = ({ mangaId }: MangaChapterListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const { data: chapters, isLoading, error } = useQuery<Chapter[]>({
    queryKey: [`/api/mangas/${mangaId}/chapters`],
  });
  
  // Filter and sort chapters
  const filteredChapters = chapters
    ? chapters
        .filter(chapter => 
          chapter.title 
            ? chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
              chapter.number.toString().includes(searchTerm)
            : chapter.number.toString().includes(searchTerm)
        )
        .sort((a, b) => {
          if (sortOrder === "newest") {
            return b.number - a.number;
          } else if (sortOrder === "oldest") {
            return a.number - b.number;
          } else {
            // A-Z sort by title
            return (a.title || "").localeCompare(b.title || "");
          }
        })
    : [];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-['Poppins'] font-bold text-gray-900">Chapters</h2>
        <div className="flex items-center">
          <div className="relative mr-4">
            <Input 
              type="text" 
              placeholder="Search chapters..." 
              className="bg-white border border-gray-300 rounded-md px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Select 
            value={sortOrder} 
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-40">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="chapter-list max-h-[600px] overflow-y-auto">
          {isLoading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="border-b border-gray-200 last:border-b-0 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-md" />
                    <div className="ml-4">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">Failed to load chapters</p>
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No chapters found</p>
            </div>
          ) : (
            filteredChapters.map((chapter) => (
              <div key={chapter.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition duration-150">
                <Link href={`/manga/${mangaId}/chapter/${chapter.id}`}>
                  <a className="flex justify-between items-center p-4">
                    <div className="flex items-center">
                      <div className="bg-primary text-white w-10 h-10 rounded-md flex items-center justify-center font-bold">
                        {chapter.number}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">
                          Chapter {chapter.number}{chapter.title ? `: ${chapter.title}` : ""}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {chapter.releaseDate ? format(new Date(chapter.releaseDate), 'MMMM d, yyyy') : 'No date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {chapter.releaseDate && new Date(chapter.releaseDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-green-100 text-green-800 mr-4">New</Badge>
                      )}
                      <ChevronRight className="text-gray-400 h-5 w-5" />
                    </div>
                  </a>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaChapterList;
