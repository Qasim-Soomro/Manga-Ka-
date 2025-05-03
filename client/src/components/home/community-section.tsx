import { Bookmark, Star, Bell } from "lucide-react";

const CommunitySection = () => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-['Poppins'] font-bold text-gray-900 mb-8 text-center">Join Our Community</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#4ECDC4] bg-opacity-10 rounded-full flex items-center justify-center">
              <Bookmark className="text-[#4ECDC4] text-2xl" />
            </div>
            <h3 className="font-bold text-xl mb-2">Track Your Manga</h3>
            <p className="text-gray-600">Keep track of manga you've read and maintain your reading list with our tracker.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#4ECDC4] bg-opacity-10 rounded-full flex items-center justify-center">
              <Star className="text-[#4ECDC4] text-2xl" />
            </div>
            <h3 className="font-bold text-xl mb-2">Rate & Review</h3>
            <p className="text-gray-600">Share your thoughts and read what others think about your favorite titles.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#4ECDC4] bg-opacity-10 rounded-full flex items-center justify-center">
              <Bell className="text-[#4ECDC4] text-2xl" />
            </div>
            <h3 className="font-bold text-xl mb-2">Get Notified</h3>
            <p className="text-gray-600">Receive notifications when new chapters of your favorite manga are released.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
