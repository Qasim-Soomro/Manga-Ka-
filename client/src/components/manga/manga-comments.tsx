import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Comment, insertCommentSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ThumbsUp, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

interface MangaCommentsProps {
  chapterId: number;
}

// Extended schema for front-end validation
const commentFormSchema = insertCommentSchema.extend({
  content: z.string().min(3, "Comment must be at least 3 characters"),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

interface CommentWithUser extends Comment {
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

const MangaComments = ({ chapterId }: MangaCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { data: comments, isLoading, error } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/chapters/${chapterId}/comments`],
  });
  
  // Form for submitting a comment
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      chapterId,
      content: "",
    },
  });
  
  // Submit comment mutation
  const submitCommentMutation = useMutation({
    mutationFn: async (values: CommentFormValues) => {
      const res = await fetch(`/api/chapters/${chapterId}/comments`, {
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
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${chapterId}/comments`] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: CommentFormValues) => {
    submitCommentMutation.mutate(values);
  };
  
  // Simulate loading more comments (in a real app this would fetch more from API)
  const loadMoreComments = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setLoadingMore(false);
      toast({
        title: "No more comments",
        description: "You've reached the end of comments for this chapter.",
      });
    }, 1000);
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-bold">Comments</h2>
        <span className="text-gray-400 text-sm">{comments?.length || 0} comments</span>
      </div>
      
      {user ? (
        <div className="mb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Leave a comment..."
                        className="w-full bg-gray-700 text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  type="submit" 
                  disabled={submitCommentMutation.isPending}
                  className="bg-primary hover:bg-opacity-90 text-white"
                >
                  {submitCommentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <div className="mb-6 bg-gray-700 rounded-md p-4 text-center">
          <p className="text-gray-300 mb-2">Please log in to leave a comment</p>
          <Button 
            variant="outline" 
            className="bg-transparent text-white border border-white hover:bg-white hover:text-gray-800"
            onClick={() => window.location.href = "/auth"}
          >
            Log In
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons for comments
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <Skeleton className="w-8 h-8 rounded-full mr-3 bg-gray-600" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1 bg-gray-600" />
                    <Skeleton className="h-3 w-16 bg-gray-600" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-12 w-full mt-2 mb-2 bg-gray-600" />
              <div className="flex items-center mt-2">
                <Skeleton className="h-4 w-12 mr-4 bg-gray-600" />
                <Skeleton className="h-4 w-12 bg-gray-600" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-red-400 mb-2">Failed to load comments</p>
            <Button 
              variant="outline" 
              className="bg-transparent text-white border border-white hover:bg-white hover:text-gray-800"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/chapters/${chapterId}/comments`] });
              }}
            >
              Try Again
            </Button>
          </div>
        ) : comments?.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-300 mb-2">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to comment on this chapter!</p>
          </div>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <img 
                    src={comment.user.avatarUrl || "https://via.placeholder.com/80"} 
                    alt={comment.user.username} 
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-white">{comment.user.username}</h3>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-200 mt-2">{comment.content}</p>
              <div className="flex items-center mt-3 text-sm text-gray-400">
                <button className="flex items-center mr-4 hover:text-white">
                  <ThumbsUp className="mr-1 h-4 w-4" /> 0
                </button>
                <button className="flex items-center hover:text-white">
                  <MessageSquare className="mr-1 h-4 w-4" /> Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {comments && comments.length > 0 && (
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            className="text-primary hover:text-opacity-80 font-medium"
            onClick={loadMoreComments}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Comments"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MangaComments;
