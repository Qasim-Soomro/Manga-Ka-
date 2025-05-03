import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const HeroSection = () => {
  return (
    <div className="relative bg-[#1A1A2E] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Discover Your Next</span>
                <span className="block text-primary">Manga Adventure</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Thousands of manga titles at your fingertips. Read, track, and discover stories that will take you to new worlds.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/catalog">
                    <Button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-primary hover:bg-opacity-90 md:py-4 md:text-lg md:px-10">
                      Explore Catalog
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/catalog?view=latest">
                    <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 border border-primary text-base font-medium rounded-md text-primary bg-transparent hover:bg-primary hover:bg-opacity-10 md:py-4 md:text-lg md:px-10">
                      Latest Releases
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img 
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
          src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
          alt="Manga collection" 
        />
      </div>
    </div>
  );
};

export default HeroSection;
