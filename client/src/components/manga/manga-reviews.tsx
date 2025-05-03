import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review, insertReviewSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Star, ThumbsUp, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

interface MangaReviewsProps {
  mangaId: number;
}

// Extended schema for front-end validation
const reviewFormSchema = insertReviewSchema.extend({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewWithUser extends Review {
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

const MangaReviews = ({ mangaId }: MangaReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const { data: reviews, isLoading, error } = useQuery<ReviewWithUser[]>({
    queryKey: [`/api/mangas/${mangaId}/reviews`],
  });
  
  // Calculate average rating
  const averageRating = reviews?.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  
  // Calculate rating breakdown
  const ratingCounts = reviews?.reduce((counts, review) => {
    counts[review.rating] = (counts[review.rating] || 0) + 1;
    return counts;
  }, {} as Record<number, number>) || {};
  
  const totalReviews = reviews?.length || 0;
  
  // Get rating percentages
  const ratingPercentages = [5, 4, 3, 2, 1].map(rating => {
    const count = ratingCounts[rating] || 0;
    return {
      rating,
      percentage: totalReviews ? Math.round((count / totalReviews) * 100) : 0,
      count
    };
  });
  
  // Form for submitting a review
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      mangaId,
      rating: 5,
      title: "",
      content: "",
    },
  });
  
  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const res = await fetch(`/api/mangas/${mangaId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Your review has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/mangas/${mangaId}/reviews`] });
      form.reset();
      setIsReviewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: ReviewFormValues) => {
    submitReviewMutation.mutate(values);
  };
  
  // Generate star rating display
  const renderStarRating = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };
  
  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-['Poppins'] font-bold text-gray-900">Reviews & Ratings</h2>
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-opacity-90 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your thoughts about this manga with the community.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Star
                                key={rating}
                                className={`h-8 w-8 cursor-pointer ${
                                  rating <= field.value
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                                onClick={() => field.onChange(rating)}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Give your review a title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your thoughts about this manga..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={submitReviewMutation.isPending}
                      className="w-full"
                    >
                      {submitReviewMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
                <div className="flex justify-center text-yellow-400 my-2">
                  {renderStarRating(Number(averageRating))}
                </div>
                <div className="text-gray-600 mb-4">Based on {totalReviews} reviews</div>
              </div>
              
              <div className="space-y-3">
                {ratingPercentages.map(({ rating, percentage, count }) => (
                  <div key={rating} className="flex items-center">
                    <div className="w-20 text-sm text-gray-600">{rating} stars</div>
                    <div className="flex-1 h-4 mx-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-10 text-sm text-gray-600 text-right">{percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeletons for reviews
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <Skeleton className="w-10 h-10 rounded-full mr-4" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-1" />
                          <Skeleton className="h-3 w-32 mb-2" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-5 w-48 mt-2 mb-2" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-16 mr-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-red-500 mb-2">Failed to load reviews</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: [`/api/mangas/${mangaId}/reviews`] });
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : reviews?.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400">Be the first to review this manga!</p>
                </div>
              ) : (
                reviews?.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <img 
                          src={review.user.avatarUrl || "https://via.placeholder.com/80"} 
                          alt={review.user.username} 
                          className="w-10 h-10 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900">{review.user.username}</h3>
                          <div className="flex text-yellow-400 mt-1 mb-2">
                            {renderStarRating(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {review.title && (
                      <h4 className="font-bold text-gray-900 mt-2">{review.title}</h4>
                    )}
                    <p className="text-gray-600 mt-2">{review.content}</p>
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                      <button className="flex items-center mr-4 hover:text-gray-700">
                        <ThumbsUp className="mr-1 h-4 w-4" /> 0
                      </button>
                      <button className="flex items-center hover:text-gray-700">
                        <MessageSquare className="mr-1 h-4 w-4" /> Reply
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {reviews && reviews.length > 2 && (
              <div className="mt-6 text-center">
                <Button variant="outline" className="text-primary hover:text-opacity-80 font-medium">
                  Load More Reviews
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaReviews;
