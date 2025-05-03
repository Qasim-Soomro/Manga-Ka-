import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Manga, Genre } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, BookOpen, Star, Clock } from "lucide-react";
import MangaCard from "@/components/manga/manga-card";

const CatalogPage = () => {
  const [location] = useLocation();
  
  // Get view type and genre from URL query params
  const url = new URL(window.location.href);
  const viewParam = url.searchParams.get("view");
  const genreParam = url.searchParams.get("genre");
  
  const [activeView, setActiveView] = useState(viewParam || "all");
  const [selectedGenre, setSelectedGenre] = useState(genreParam || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  
  // Fetch all mangas
  const { 
    data: allMangas, 
    isLoading: isLoadingAllMangas, 
    error: allMangasError 
  } = useQuery<Manga[]>({
    queryKey: ["/api/mangas"],
  });
  
  // Fetch popular mangas
  const { 
    data: popularMangas, 
    isLoading: isLoadingPopular, 
    error: popularError 
  } = useQuery<Manga[]>({
    queryKey: ["/api/mangas/popular"],
    enabled: activeView === "popular"
  });
  
  // Fetch latest mangas
  const { 
    data: latestMangas, 
    isLoading: isLoadingLatest, 
    error: latestError 
  } = useQuery<Manga[]>({
    queryKey: ["/api/mangas/latest"],
    enabled: activeView === "latest"
  });
  
  // Fetch mangas by genre
  const {
    data: genreMangas,
    isLoading: isLoadingGenreMangas,
    error: genreMangasError
  } = useQuery<Manga[]>({
    queryKey: ["/api/genres", selectedGenre, "mangas"],
    queryFn: () => fetch(`/api/genres/${selectedGenre}/mangas`).then(res => res.json()),
    enabled: !!selectedGenre
  });
  
  // Fetch all genres
  const { 
    data: genres, 
    isLoading: isLoadingGenres, 
    error: genresError 
  } = useQuery<Genre[]>({
    queryKey: ["/api/genres"],
  });
  
  // Update URL when tab or genre changes
  useEffect(() => {
    const newUrl = new URL(window.location.href);
    
    if (activeView !== "all") {
      newUrl.searchParams.set("view", activeView);
    } else {
      newUrl.searchParams.delete("view");
    }
    
    if (selectedGenre) {
      newUrl.searchParams.set("genre", selectedGenre);
    } else {
      newUrl.searchParams.delete("genre");
    }
    
    window.history.replaceState({}, "", newUrl.toString());
  }, [activeView, selectedGenre]);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInputValue);
  };
  
  // Filter mangas based on selected view, genre, and search term
  const getFilteredMangas = () => {
    let filteredList: Manga[] = [];
    
    // If genre is selected, use that data source
    if (selectedGenre && genreMangas) {
      filteredList = [...genreMangas];
    }
    // Otherwise, determine base list based on active view
    else if (activeView === "popular" && popularMangas) {
      filteredList = [...popularMangas];
    } else if (activeView === "latest" && latestMangas) {
      filteredList = [...latestMangas];
    } else if (allMangas) {
      filteredList = [...allMangas];
    }
    
    // Apply search filter if provided
    if (searchTerm && filteredList.length > 0) {
      filteredList = filteredList.filter(manga => 
        manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (manga.description && manga.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (manga.author && manga.author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filteredList;
  };
  
  const filteredMangas = getFilteredMangas();
  const isLoading = isLoadingAllMangas || 
    (activeView === "popular" && isLoadingPopular) || 
    (activeView === "latest" && isLoadingLatest);
  
  const hasError = allMangasError || 
    (activeView === "popular" && popularError) || 
    (activeView === "latest" && latestError);
  
  // Handle view change
  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSelectedGenre(""); // Reset genre filter when view changes
  };
  
  // Handle genre change
  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId === "all" ? "" : genreId);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manga Catalog</h1>
          <p className="text-gray-600 mt-1">Discover your next favorite manga</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search manga..."
              className="pr-10 w-full sm:w-64"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <Select value={selectedGenre} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Genres</SelectLabel>
                <SelectItem value="all">All Genres</SelectItem>
                {isLoadingGenres ? (
                  <SelectItem value="loading" disabled>Loading genres...</SelectItem>
                ) : genresError ? (
                  <SelectItem value="error" disabled>Failed to load genres</SelectItem>
                ) : (
                  genres?.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeView} onValueChange={handleViewChange}>
        <div className="border-b mb-8">
          <TabsList className="flex gap-1">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>All Manga</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Popular</span>
            </TabsTrigger>
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Latest</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all">
          <div className="mb-4">
            {searchTerm && (
              <div className="text-sm text-gray-600 mb-4">
                Search results for: <span className="font-semibold">{searchTerm}</span>
                <Button 
                  variant="link" 
                  className="ml-2 p-0 h-auto"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchInputValue("");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
            {selectedGenre && genres && (
              <div className="text-sm text-gray-600 mb-4">
                Filtered by genre: <span className="font-semibold">
                  {genres.find(g => g.id.toString() === selectedGenre)?.name || "Unknown"}
                </span>
                <Button 
                  variant="link" 
                  className="ml-2 p-0 h-auto"
                  onClick={() => setSelectedGenre("")}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          
          {renderMangaGrid(isLoading, hasError, filteredMangas)}
        </TabsContent>
        
        <TabsContent value="popular">
          {renderMangaGrid(isLoadingPopular, popularError, filteredMangas)}
        </TabsContent>
        
        <TabsContent value="latest">
          {renderMangaGrid(isLoadingLatest, latestError, filteredMangas)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to render manga grid
const renderMangaGrid = (isLoading: boolean, error: unknown, mangas: Manga[]) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array(12).fill(0).map((_, i) => (
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
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-600 mb-2">Failed to load manga</h3>
        <p className="text-gray-600 mb-6">
          There was an error loading the manga catalog. Please try again later.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (mangas.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No manga found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any manga matching your criteria.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Reset Filters
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {mangas.map((manga) => (
        <MangaCard 
          key={manga.id} 
          manga={manga} 
          badge={manga.status === 'ongoing' ? 'HOT' : undefined}
        />
      ))}
    </div>
  );
};

export default CatalogPage;
