import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatarUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Manga schema
export const mangas = pgTable("mangas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  author: text("author"),
  status: text("status"), // 'ongoing', 'completed', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMangaSchema = createInsertSchema(mangas).pick({
  title: true,
  description: true,
  coverUrl: true,
  author: true,
  status: true,
});

export type InsertManga = z.infer<typeof insertMangaSchema>;
export type Manga = typeof mangas.$inferSelect;

// Genre schema
export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertGenreSchema = createInsertSchema(genres).pick({
  name: true,
});

export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type Genre = typeof genres.$inferSelect;

// MangaGenre relation schema
export const mangaGenres = pgTable("manga_genres", {
  id: serial("id").primaryKey(),
  mangaId: integer("manga_id").notNull(),
  genreId: integer("genre_id").notNull(),
});

export const insertMangaGenreSchema = createInsertSchema(mangaGenres).pick({
  mangaId: true,
  genreId: true,
});

export type InsertMangaGenre = z.infer<typeof insertMangaGenreSchema>;
export type MangaGenre = typeof mangaGenres.$inferSelect;

// Chapter schema
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  mangaId: integer("manga_id").notNull(),
  number: integer("number").notNull(),
  title: text("title"),
  releaseDate: timestamp("release_date").defaultNow().notNull(),
  pagesCount: integer("pages_count").notNull(),
});

export const insertChapterSchema = createInsertSchema(chapters).pick({
  mangaId: true,
  number: true,
  title: true,
  releaseDate: true,
  pagesCount: true,
});

export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;

// UserLibrary schema (for tracking reading progress)
export const userLibrary = pgTable("user_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mangaId: integer("manga_id").notNull(),
  status: text("status").notNull(), // 'reading', 'completed', 'plan_to_read', etc.
  currentChapter: integer("current_chapter"),
  lastReadAt: timestamp("last_read_at"),
});

export const insertUserLibrarySchema = createInsertSchema(userLibrary).pick({
  userId: true,
  mangaId: true,
  status: true,
  currentChapter: true,
  lastReadAt: true,
});

export type InsertUserLibrary = z.infer<typeof insertUserLibrarySchema>;
export type UserLibrary = typeof userLibrary.$inferSelect;

// Review schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mangaId: integer("manga_id").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  mangaId: true,
  rating: true,
  title: true,
  content: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Comment schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  chapterId: integer("chapter_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  chapterId: true,
  content: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
