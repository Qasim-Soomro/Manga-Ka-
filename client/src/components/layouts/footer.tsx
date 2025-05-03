import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Twitter,
  Facebook,
  Instagram,
  Send,
  BookOpen,
  List,
  Star
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1A1A2E] text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <span className="font-['Bangers'] text-3xl text-primary mr-1">Manga</span>
              <span className="font-['Bangers'] text-3xl text-[#4ECDC4]">KA</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Your ultimate destination for manga reading. Discover, track, and enjoy thousands of manga titles in one place.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition duration-150">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-400 hover:text-white transition duration-150">
                  Catalog
                </Link>
              </li>
              <li>
                <Link href="/catalog?view=genres" className="text-gray-400 hover:text-white transition duration-150">
                  Genres
                </Link>
              </li>
              <li>
                <Link href="/catalog?view=latest" className="text-gray-400 hover:text-white transition duration-150">
                  Latest Updates
                </Link>
              </li>
              <li>
                <Link href="/catalog?view=popular" className="text-gray-400 hover:text-white transition duration-150">
                  Popular Manga
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                  DMCA
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Subscribe</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter to get updates on the latest manga releases.
            </p>
            <form className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="bg-primary hover:bg-opacity-90 rounded-r-md">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Manga-KA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
