import { 
  users, type User, type InsertUser,
  mangas, type Manga, type InsertManga,
  genres, type Genre, type InsertGenre,
  mangaGenres, type MangaGenre, type InsertMangaGenre,
  chapters, type Chapter, type InsertChapter,
  userLibrary, type UserLibrary, type InsertUserLibrary,
  reviews, type Review, type InsertReview,
  comments, type Comment, type InsertComment
} from "@shared/schema";
import session from "express-session";
import { Store as SessionStore } from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Manga operations
  getAllMangas(): Promise<Manga[]>;
  getManga(id: number): Promise<Manga | undefined>;
  getMangasByGenre(genreId: number): Promise<Manga[]>;
  getPopularMangas(limit?: number): Promise<Manga[]>;
  getLatestMangas(limit?: number): Promise<Manga[]>;
  createManga(manga: InsertManga): Promise<Manga>;
  
  // Genre operations
  getAllGenres(): Promise<Genre[]>;
  getGenre(id: number): Promise<Genre | undefined>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  getMangaGenres(mangaId: number): Promise<Genre[]>;
  
  // MangaGenre operations
  createMangaGenre(mangaGenre: InsertMangaGenre): Promise<MangaGenre>;
  
  // Chapter operations
  getChapter(id: number): Promise<Chapter | undefined>;
  getMangaChapters(mangaId: number): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // UserLibrary operations
  getUserLibrary(userId: number): Promise<UserLibrary[]>;
  getUserMangaStatus(userId: number, mangaId: number): Promise<UserLibrary | undefined>;
  addToUserLibrary(userLibrary: InsertUserLibrary): Promise<UserLibrary>;
  updateUserLibrary(id: number, userLibrary: Partial<InsertUserLibrary>): Promise<UserLibrary | undefined>;
  
  // Review operations
  getMangaReviews(mangaId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Comment operations
  getChapterComments(chapterId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mangas: Map<number, Manga>;
  private genres: Map<number, Genre>;
  private mangaGenres: Map<number, MangaGenre>;
  private chapters: Map<number, Chapter>;
  private userLibraries: Map<number, UserLibrary>;
  private reviews: Map<number, Review>;
  private comments: Map<number, Comment>;
  
  private currentUserId: number;
  private currentMangaId: number;
  private currentGenreId: number;
  private currentMangaGenreId: number;
  private currentChapterId: number;
  private currentUserLibraryId: number;
  private currentReviewId: number;
  private currentCommentId: number;
  
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.mangas = new Map();
    this.genres = new Map();
    this.mangaGenres = new Map();
    this.chapters = new Map();
    this.userLibraries = new Map();
    this.reviews = new Map();
    this.comments = new Map();
    
    this.currentUserId = 1;
    this.currentMangaId = 1;
    this.currentGenreId = 1;
    this.currentMangaGenreId = 1;
    this.currentChapterId = 1;
    this.currentUserLibraryId = 1;
    this.currentReviewId = 1;
    this.currentCommentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    
    // Initialize with some default genres
    const defaultGenres = [
      { name: 'Action' },
      { name: 'Adventure' },
      { name: 'Comedy' },
      { name: 'Drama' },
      { name: 'Fantasy' },
      { name: 'Horror' },
      { name: 'Romance' },
      { name: 'Sci-Fi' },
      { name: 'Slice of Life' },
      { name: 'Supernatural' }
    ];
    
    defaultGenres.forEach(genre => {
      this.createGenre(genre);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser,
      id,
      createdAt: new Date(),
      email: insertUser.email || null,
      avatarUrl: insertUser.avatarUrl || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Manga operations
  async getAllMangas(): Promise<Manga[]> {
    return Array.from(this.mangas.values());
  }
  
  async getManga(id: number): Promise<Manga | undefined> {
    return this.mangas.get(id);
  }
  
  async getMangasByGenre(genreId: number): Promise<Manga[]> {
    const mangaIds = Array.from(this.mangaGenres.values())
      .filter(mg => mg.genreId === genreId)
      .map(mg => mg.mangaId);
    
    return Array.from(this.mangas.values())
      .filter(manga => mangaIds.includes(manga.id));
  }
  
  async getPopularMangas(limit: number = 6): Promise<Manga[]> {
    // In a real DB, we'd order by read count or rating
    // Here we'll just return all mangas, limited
    return Array.from(this.mangas.values()).slice(0, limit);
  }
  
  async getLatestMangas(limit: number = 6): Promise<Manga[]> {
    // In a real DB, we'd order by createdAt
    return Array.from(this.mangas.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async createManga(insertManga: InsertManga): Promise<Manga> {
    const id = this.currentMangaId++;
    const manga: Manga = {
      ...insertManga,
      id,
      createdAt: new Date(),
      description: insertManga.description || null,
      coverUrl: insertManga.coverUrl || null,
      author: insertManga.author || null,
      status: insertManga.status || null
    };
    this.mangas.set(id, manga);
    return manga;
  }
  
  // Genre operations
  async getAllGenres(): Promise<Genre[]> {
    return Array.from(this.genres.values());
  }
  
  async getGenre(id: number): Promise<Genre | undefined> {
    return this.genres.get(id);
  }
  
  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    const id = this.currentGenreId++;
    const genre: Genre = { ...insertGenre, id };
    this.genres.set(id, genre);
    return genre;
  }
  
  async getMangaGenres(mangaId: number): Promise<Genre[]> {
    const genreIds = Array.from(this.mangaGenres.values())
      .filter(mg => mg.mangaId === mangaId)
      .map(mg => mg.genreId);
    
    return Array.from(this.genres.values())
      .filter(genre => genreIds.includes(genre.id));
  }
  
  // MangaGenre operations
  async createMangaGenre(insertMangaGenre: InsertMangaGenre): Promise<MangaGenre> {
    const id = this.currentMangaGenreId++;
    const mangaGenre: MangaGenre = { ...insertMangaGenre, id };
    this.mangaGenres.set(id, mangaGenre);
    return mangaGenre;
  }
  
  // Chapter operations
  async getChapter(id: number): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }
  
  async getMangaChapters(mangaId: number): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.mangaId === mangaId)
      .sort((a, b) => b.number - a.number); // Latest chapters first
  }
  
  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = this.currentChapterId++;
    const chapter: Chapter = {
      ...insertChapter,
      id,
      releaseDate: insertChapter.releaseDate || new Date(),
      title: insertChapter.title || null
    };
    this.chapters.set(id, chapter);
    return chapter;
  }
  
  // UserLibrary operations
  async getUserLibrary(userId: number): Promise<UserLibrary[]> {
    return Array.from(this.userLibraries.values())
      .filter(library => library.userId === userId);
  }
  
  async getUserMangaStatus(userId: number, mangaId: number): Promise<UserLibrary | undefined> {
    return Array.from(this.userLibraries.values())
      .find(library => library.userId === userId && library.mangaId === mangaId);
  }
  
  async addToUserLibrary(insertUserLibrary: InsertUserLibrary): Promise<UserLibrary> {
    const id = this.currentUserLibraryId++;
    const userLibrary: UserLibrary = {
      ...insertUserLibrary,
      id,
      currentChapter: insertUserLibrary.currentChapter || null,
      lastReadAt: insertUserLibrary.lastReadAt || null
    };
    this.userLibraries.set(id, userLibrary);
    return userLibrary;
  }
  
  async updateUserLibrary(id: number, userLibraryUpdate: Partial<InsertUserLibrary>): Promise<UserLibrary | undefined> {
    const existing = this.userLibraries.get(id);
    if (!existing) return undefined;
    
    const updated: UserLibrary = {
      ...existing,
      ...userLibraryUpdate,
      currentChapter: userLibraryUpdate.currentChapter !== undefined ? userLibraryUpdate.currentChapter : existing.currentChapter,
      lastReadAt: userLibraryUpdate.lastReadAt || existing.lastReadAt
    };
    
    this.userLibraries.set(id, updated);
    return updated;
  }
  
  // Review operations
  async getMangaReviews(mangaId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.mangaId === mangaId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      title: insertReview.title || null,
      content: insertReview.content || null
    };
    this.reviews.set(id, review);
    return review;
  }
  
  // Comment operations
  async getChapterComments(chapterId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.chapterId === chapterId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Manga operations
  async getAllMangas(): Promise<Manga[]> {
    return db.select().from(mangas);
  }

  async getManga(id: number): Promise<Manga | undefined> {
    const [manga] = await db.select().from(mangas).where(eq(mangas.id, id));
    return manga || undefined;
  }

  async getMangasByGenre(genreId: number): Promise<Manga[]> {
    // Get manga IDs from junction table
    const mangaGenreEntries = await db
      .select()
      .from(mangaGenres)
      .where(eq(mangaGenres.genreId, genreId));
    
    const mangaIds = mangaGenreEntries.map(mg => mg.mangaId);
    
    if (mangaIds.length === 0) {
      return [];
    }
    
    // Get mangas by IDs
    return db
      .select()
      .from(mangas)
      .where(
        mangaIds.length === 1 
          ? eq(mangas.id, mangaIds[0]) 
          : or(...mangaIds.map(id => eq(mangas.id, id)))
      );
  }

  async getPopularMangas(limit: number = 6): Promise<Manga[]> {
    // For now, use the reviews count as a popularity metric
    // Join with the reviews table and count reviews per manga
    const results = await db
      .select({
        manga: mangas,
        reviewCount: sql<number>`count(${reviews.id})`.as('review_count')
      })
      .from(mangas)
      .leftJoin(reviews, eq(mangas.id, reviews.mangaId))
      .groupBy(mangas.id)
      .orderBy(desc(sql`review_count`), desc(mangas.createdAt))
      .limit(limit);
    
    // Extract just the manga objects from the results
    return results.map(r => r.manga);
  }

  async getLatestMangas(limit: number = 6): Promise<Manga[]> {
    return db
      .select()
      .from(mangas)
      .orderBy(desc(mangas.createdAt))
      .limit(limit);
  }

  async createManga(insertManga: InsertManga): Promise<Manga> {
    const [manga] = await db
      .insert(mangas)
      .values(insertManga)
      .returning();
    return manga;
  }

  // Genre operations
  async getAllGenres(): Promise<Genre[]> {
    return db.select().from(genres);
  }

  async getGenre(id: number): Promise<Genre | undefined> {
    const [genre] = await db.select().from(genres).where(eq(genres.id, id));
    return genre || undefined;
  }

  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    const [genre] = await db
      .insert(genres)
      .values(insertGenre)
      .returning();
    return genre;
  }

  async getMangaGenres(mangaId: number): Promise<Genre[]> {
    // Get genre IDs from junction table
    const mangaGenreEntries = await db
      .select()
      .from(mangaGenres)
      .where(eq(mangaGenres.mangaId, mangaId));
    
    const genreIds = mangaGenreEntries.map(mg => mg.genreId);
    
    if (genreIds.length === 0) {
      return [];
    }
    
    // Get genres by IDs
    return db
      .select()
      .from(genres)
      .where(
        genreIds.length === 1 
          ? eq(genres.id, genreIds[0]) 
          : or(...genreIds.map(id => eq(genres.id, id)))
      );
  }

  // MangaGenre operations
  async createMangaGenre(insertMangaGenre: InsertMangaGenre): Promise<MangaGenre> {
    const [mangaGenre] = await db
      .insert(mangaGenres)
      .values(insertMangaGenre)
      .returning();
    return mangaGenre;
  }

  // Chapter operations
  async getChapter(id: number): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter || undefined;
  }

  async getMangaChapters(mangaId: number): Promise<Chapter[]> {
    return db
      .select()
      .from(chapters)
      .where(eq(chapters.mangaId, mangaId))
      .orderBy(desc(chapters.number));
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const [chapter] = await db
      .insert(chapters)
      .values(insertChapter)
      .returning();
    return chapter;
  }

  // UserLibrary operations
  async getUserLibrary(userId: number): Promise<UserLibrary[]> {
    return db
      .select()
      .from(userLibrary)
      .where(eq(userLibrary.userId, userId));
  }

  async getUserMangaStatus(userId: number, mangaId: number): Promise<UserLibrary | undefined> {
    const [libraryEntry] = await db
      .select()
      .from(userLibrary)
      .where(and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.mangaId, mangaId)
      ));
    
    return libraryEntry || undefined;
  }

  async addToUserLibrary(insertUserLibrary: InsertUserLibrary): Promise<UserLibrary> {
    const [libraryEntry] = await db
      .insert(userLibrary)
      .values(insertUserLibrary)
      .returning();
    return libraryEntry;
  }

  async updateUserLibrary(id: number, userLibraryUpdate: Partial<InsertUserLibrary>): Promise<UserLibrary | undefined> {
    const [updatedLibraryEntry] = await db
      .update(userLibrary)
      .set(userLibraryUpdate)
      .where(eq(userLibrary.id, id))
      .returning();
    
    return updatedLibraryEntry || undefined;
  }

  // Review operations
  async getMangaReviews(mangaId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.mangaId, mangaId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  // Comment operations
  async getChapterComments(chapterId: number): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.chapterId, chapterId))
      .orderBy(comments.createdAt);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }
}

// Switch to database storage
// Temporarily using MemStorage instead of DatabaseStorage due to database connection issues
export const storage = new MemStorage();
