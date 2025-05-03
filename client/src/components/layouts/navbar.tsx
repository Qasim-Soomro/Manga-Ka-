import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, User } from "lucide-react";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    return location === path ? "text-primary" : "text-white hover:text-primary";
  };
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Force a navigation to refresh the page state
        navigate("/");
        // Force reload to ensure the auth state is completely refreshed
        window.location.reload();
      }
    });
  };
  
  return (
    <nav className="bg-[#1A1A2E] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-['Bangers'] text-3xl text-primary mr-1">Manga</span>
              <span className="font-['Bangers'] text-3xl text-[#4ECDC4]">KA</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-6">
              <Link href="/" className={`px-3 py-2 text-sm font-medium transition duration-150 ${isActive("/")}`}>
                Home
              </Link>
              <Link href="/catalog" className={`px-3 py-2 text-sm font-medium transition duration-150 ${isActive("/catalog")}`}>
                Catalog
              </Link>
              <Link href="/catalog?view=genres" className={`px-3 py-2 text-sm font-medium transition duration-150 ${isActive("/catalog?view=genres")}`}>
                Genres
              </Link>
              <Link href="/catalog?view=latest" className={`px-3 py-2 text-sm font-medium transition duration-150 ${isActive("/catalog?view=latest")}`}>
                Latest
              </Link>
              <Link href="/catalog?view=popular" className={`px-3 py-2 text-sm font-medium transition duration-150 ${isActive("/catalog?view=popular")}`}>
                Popular
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search for manga..." 
                className="bg-gray-700 text-white rounded-full px-4 py-1 pl-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm w-64"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="user-controls ml-4 flex">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white">
                      <User className="h-5 w-5 mr-1" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=library">My Library</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="outline" className="text-white bg-transparent hover:bg-primary border border-primary mr-2">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register">
                    <Button className="text-white bg-primary hover:bg-opacity-90">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white p-2"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white p-2 ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#1A1A2E] text-white">
                <div className="py-4">
                  <Link href="/" className="flex-shrink-0 flex items-center mb-6">
                    <span className="font-['Bangers'] text-3xl text-primary mr-1">Manga</span>
                    <span className="font-['Bangers'] text-3xl text-[#4ECDC4]">KA</span>
                  </Link>
                  
                  <div className="space-y-3">
                    <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                      Home
                    </Link>
                    <Link href="/catalog" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                      Catalog
                    </Link>
                    <Link href="/catalog?view=genres" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                      Genres
                    </Link>
                    <Link href="/catalog?view=latest" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                      Latest
                    </Link>
                    <Link href="/catalog?view=popular" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                      Popular
                    </Link>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    {user ? (
                      <>
                        <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                          Profile
                        </Link>
                        <Link href="/profile?tab=library" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                          My Library
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <div className="flex space-x-2 px-3">
                        <Link href="/auth" className="w-1/2">
                          <Button variant="outline" className="w-full">Login</Button>
                        </Link>
                        <Link href="/auth?tab=register" className="w-1/2">
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden bg-[#1A1A2E] pb-3 px-4">
          <Input 
            type="text" 
            placeholder="Search for manga..." 
            className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
