import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertChapterSchema, insertCommentSchema, insertMangaSchema, insertReviewSchema, insertUserLibrarySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Manga routes
  app.get("/api/mangas", async (req, res) => {
    try {
      const mangas = await storage.getAllMangas();
      res.json(mangas);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mangas" });
    }
  });

  app.get("/api/mangas/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const mangas = await storage.getPopularMangas(limit);
      res.json(mangas);
    } catch (error) {
      res.status(500).json({ message: "Failed to get popular mangas" });
    }
  });

  app.get("/api/mangas/latest", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const mangas = await storage.getLatestMangas(limit);
      res.json(mangas);
    } catch (error) {
      res.status(500).json({ message: "Failed to get latest mangas" });
    }
  });

  app.get("/api/mangas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const manga = await storage.getManga(id);
      
      if (!manga) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      // Get genres for this manga
      const genres = await storage.getMangaGenres(id);
      
      res.json({ ...manga, genres });
    } catch (error) {
      res.status(500).json({ message: "Failed to get manga" });
    }
  });

  app.post("/api/mangas", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertMangaSchema.parse(req.body);
      const manga = await storage.createManga(validatedData);
      
      res.status(201).json(manga);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid manga data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create manga" });
    }
  });

  // Genre routes
  app.get("/api/genres", async (req, res) => {
    try {
      const genres = await storage.getAllGenres();
      res.json(genres);
    } catch (error) {
      res.status(500).json({ message: "Failed to get genres" });
    }
  });

  app.get("/api/genres/:id/mangas", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mangas = await storage.getMangasByGenre(id);
      res.json(mangas);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mangas by genre" });
    }
  });

  // Chapter routes
  app.get("/api/mangas/:mangaId/chapters", async (req, res) => {
    try {
      const mangaId = parseInt(req.params.mangaId);
      const chapters = await storage.getMangaChapters(mangaId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chapters" });
    }
  });

  app.get("/api/chapters/latest", async (req, res) => {
    try {
      // Get all mangas and their chapters
      const mangas = await storage.getAllMangas();
      const latestChapters = [];
      
      // For each manga, get its latest chapter
      for (const manga of mangas.slice(0, 6)) { // Limit to 6 mangas
        const chapters = await storage.getMangaChapters(manga.id);
        if (chapters && chapters.length > 0) {
          // Find the latest chapter for this manga
          const latestChapter = chapters.reduce((latest, current) => {
            const latestDate = latest.releaseDate ? new Date(latest.releaseDate).getTime() : 0;
            const currentDate = current.releaseDate ? new Date(current.releaseDate).getTime() : 0;
            return currentDate > latestDate ? current : latest;
          });
          
          latestChapters.push(latestChapter);
        }
      }
      
      // If we didn't find any chapters, return empty array instead of 404
      res.json(latestChapters);
    } catch (error) {
      console.error('Error getting latest chapters:', error);
      res.status(500).json({ message: "Failed to get latest chapters" });
    }
  });

  // This route should come AFTER /api/chapters/latest to avoid path conflicts
  app.get("/api/chapters/:id([0-9]+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chapter = await storage.getChapter(id);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chapter" });
    }
  });

  app.post("/api/mangas/:mangaId/chapters", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const mangaId = parseInt(req.params.mangaId);
      const manga = await storage.getManga(mangaId);
      
      if (!manga) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      const validatedData = insertChapterSchema.parse({
        ...req.body,
        mangaId
      });
      
      const chapter = await storage.createChapter(validatedData);
      res.status(201).json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // User Library routes
  app.get("/api/user/library", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const libraryEntries = await storage.getUserLibrary(userId);
      
      // Get manga details for each entry
      const libraryWithMangas = await Promise.all(
        libraryEntries.map(async (entry) => {
          const manga = await storage.getManga(entry.mangaId);
          return { ...entry, manga };
        })
      );
      
      res.json(libraryWithMangas);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user library" });
    }
  });

  app.post("/api/user/library", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const validatedData = insertUserLibrarySchema.parse({
        ...req.body,
        userId
      });
      
      // Check if manga exists
      const manga = await storage.getManga(validatedData.mangaId);
      if (!manga) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      // Check if already in library
      const existing = await storage.getUserMangaStatus(userId, validatedData.mangaId);
      if (existing) {
        const updated = await storage.updateUserLibrary(existing.id, validatedData);
        return res.json(updated);
      }
      
      const userLibrary = await storage.addToUserLibrary(validatedData);
      res.status(201).json(userLibrary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid library entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update library" });
    }
  });

  app.patch("/api/user/library/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if entry exists and belongs to user
      const existing = await storage.getUserLibrary(userId);
      const entry = existing.find(e => e.id === id);
      
      if (!entry) {
        return res.status(404).json({ message: "Library entry not found" });
      }
      
      const updated = await storage.updateUserLibrary(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update library entry" });
    }
  });

  // Review routes
  app.get("/api/mangas/:mangaId/reviews", async (req, res) => {
    try {
      const mangaId = parseInt(req.params.mangaId);
      const reviews = await storage.getMangaReviews(mangaId);
      
      // Include user details but exclude password
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          if (!user) return review;
          
          const { password, ...userWithoutPassword } = user;
          return { ...review, user: userWithoutPassword };
        })
      );
      
      res.json(reviewsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });

  app.post("/api/mangas/:mangaId/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const mangaId = parseInt(req.params.mangaId);
      const userId = req.user!.id;
      
      // Check if manga exists
      const manga = await storage.getManga(mangaId);
      if (!manga) {
        return res.status(404).json({ message: "Manga not found" });
      }
      
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId,
        mangaId
      });
      
      const review = await storage.createReview(validatedData);
      
      // Include user details but exclude password
      const { password, ...userWithoutPassword } = req.user!;
      
      res.status(201).json({ ...review, user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Comment routes
  app.get("/api/chapters/:chapterId/comments", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const comments = await storage.getChapterComments(chapterId);
      
      // Include user details but exclude password
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          if (!user) return comment;
          
          const { password, ...userWithoutPassword } = user;
          return { ...comment, user: userWithoutPassword };
        })
      );
      
      res.json(commentsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/chapters/:chapterId/comments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const chapterId = parseInt(req.params.chapterId);
      const userId = req.user!.id;
      
      // Check if chapter exists
      const chapter = await storage.getChapter(chapterId);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId,
        chapterId
      });
      
      const comment = await storage.createComment(validatedData);
      
      // Include user details but exclude password
      const { password, ...userWithoutPassword } = req.user!;
      
      res.status(201).json({ ...comment, user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
