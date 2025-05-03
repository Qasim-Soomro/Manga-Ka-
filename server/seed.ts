import { storage } from './storage';
import { hashPassword } from './auth';

// This function will seed the database with some initial data
export async function seedDatabase() {
  console.log('Seeding database with initial data...');

  // Check if demo user exists
  let demoUser = await storage.getUserByUsername('demo');
  
  // Add default users if they don't exist
  if (!demoUser) {
    demoUser = await storage.createUser({
      username: 'demo',
      password: await hashPassword('password'),
      email: 'demo@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    });
  }

  // Create genres if they don't exist already
  let genres = await storage.getAllGenres();
  
  // If no genres exist, create default ones
  if (genres.length === 0) {
    await storage.createGenre({ name: 'Action' });
    await storage.createGenre({ name: 'Adventure' });
    await storage.createGenre({ name: 'Comedy' });
    await storage.createGenre({ name: 'Drama' });
    await storage.createGenre({ name: 'Fantasy' });
    await storage.createGenre({ name: 'Horror' });
    await storage.createGenre({ name: 'Mystery' });
    await storage.createGenre({ name: 'Romance' });
    await storage.createGenre({ name: 'Sci-Fi' });
    await storage.createGenre({ name: 'Slice of Life' });
    await storage.createGenre({ name: 'Sports' });
    await storage.createGenre({ name: 'Supernatural' });
    
    // Fetch genres again after creating them
    genres = await storage.getAllGenres();
  }
  
  // Check if we already have manga data
  const existingMangas = await storage.getAllMangas();
  
  if (existingMangas.length === 0) {
    console.log('Adding sample manga data...');
    
    // Add popular manga
    const onePiece = await storage.createManga({
      title: 'One Piece',
      description: 'As a child, Monkey D. Luffy was inspired to become a pirate by listening to the tales of the buccaneer "Red-Haired" Shanks. But Luffy\'s life changed when he accidentally ate the Gum-Gum Devil Fruit and gained the power to stretch like rubber at the cost of never being able to swim again. Years later, still vowing to become the king of the pirates, Luffy sets out on his adventure...',
      coverUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      author: 'Eiichiro Oda',
      status: 'ongoing'
    });
  
    const attackOnTitan = await storage.createManga({
      title: 'Attack on Titan',
      description: 'In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans seemingly without reason.',
      coverUrl: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80',
      author: 'Hajime Isayama',
      status: 'completed'
    });
  
    const jujutsuKaisen = await storage.createManga({
      title: 'Jujutsu Kaisen',
      description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a school for jujutsu sorcerers to be able to locate the demon\'s other body parts and thus exorcise himself.',
      coverUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=869&q=80',
      author: 'Gege Akutami',
      status: 'ongoing'
    });
  
    const myHeroAcademia = await storage.createManga({
      title: 'My Hero Academia',
      description: 'In a world where people with superpowers (called Quirks) are the norm, Izuku Midoriya has dreams of one day becoming a Hero, despite being bullied by his classmates for not having a Quirk.',
      coverUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      author: 'Kohei Horikoshi',
      status: 'ongoing'
    });
  
    const demonSlayer = await storage.createManga({
      title: 'Demon Slayer',
      description: 'Tanjiro sets out to avenge his family and cure his sister after they were attacked by demons.',
      coverUrl: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80',
      author: 'Koyoharu Gotouge',
      status: 'completed'
    });
  
    const tokyoRevengers = await storage.createManga({
      title: 'Tokyo Revengers',
      description: 'Takemichi Hanagaki learns that his ex-girlfriend has been killed. When he\'s nearly killed himself, he travels 12 years into the past to save her.',
      coverUrl: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      author: 'Ken Wakui',
      status: 'ongoing'
    });
    
    // Associate mangas with genres
    // Find Action genre
    const actionGenre = genres.find(g => g.name === 'Action');
    if (actionGenre) {
      await storage.createMangaGenre({ mangaId: onePiece.id, genreId: actionGenre.id });
      await storage.createMangaGenre({ mangaId: attackOnTitan.id, genreId: actionGenre.id });
      await storage.createMangaGenre({ mangaId: demonSlayer.id, genreId: actionGenre.id });
    }
  
    // Find Adventure genre
    const adventureGenre = genres.find(g => g.name === 'Adventure');
    if (adventureGenre) {
      await storage.createMangaGenre({ mangaId: onePiece.id, genreId: adventureGenre.id });
    }
  
    // Find Fantasy genre
    const fantasyGenre = genres.find(g => g.name === 'Fantasy');
    if (fantasyGenre) {
      await storage.createMangaGenre({ mangaId: onePiece.id, genreId: fantasyGenre.id });
      await storage.createMangaGenre({ mangaId: jujutsuKaisen.id, genreId: fantasyGenre.id });
    }
  
    // Find Supernatural genre
    const supernaturalGenre = genres.find(g => g.name === 'Supernatural');
    if (supernaturalGenre) {
      await storage.createMangaGenre({ mangaId: jujutsuKaisen.id, genreId: supernaturalGenre.id });
      await storage.createMangaGenre({ mangaId: demonSlayer.id, genreId: supernaturalGenre.id });
    }
  
    // Create some chapters for each manga
    for (let i = 1; i <= 5; i++) {
      await storage.createChapter({
        mangaId: onePiece.id,
        number: i,
        title: `Chapter ${i}: Adventure Begins`,
        releaseDate: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000), // More recent chapters are newer
        pagesCount: 20
      });
    }
  
    for (let i = 1; i <= 3; i++) {
      await storage.createChapter({
        mangaId: attackOnTitan.id,
        number: i,
        title: `Chapter ${i}: The Fall`,
        releaseDate: new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000),
        pagesCount: 18
      });
    }
  
    for (let i = 1; i <= 4; i++) {
      await storage.createChapter({
        mangaId: jujutsuKaisen.id,
        number: i,
        title: `Chapter ${i}: Cursed Energy`,
        releaseDate: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        pagesCount: 22
      });
    }
  
    // Create some reviews
    if (demoUser) {
      await storage.createReview({
        userId: demoUser.id,
        mangaId: onePiece.id,
        rating: 5,
        title: "The best manga ever!",
        content: "I've been following One Piece for years and it never disappoints. The world building is incredible and the characters are so well developed."
      });
  
      await storage.createReview({
        userId: demoUser.id,
        mangaId: attackOnTitan.id,
        rating: 4,
        title: "Dark and intense",
        content: "Attack on Titan is a masterpiece of storytelling with plot twists that will leave you shocked."
      });
  
      // Add manga to user's library
      await storage.addToUserLibrary({
        userId: demoUser.id,
        mangaId: onePiece.id,
        status: 'reading',
        currentChapter: 3,
        lastReadAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      });
  
      await storage.addToUserLibrary({
        userId: demoUser.id,
        mangaId: jujutsuKaisen.id,
        status: 'plan_to_read',
        currentChapter: null,
        lastReadAt: null
      });
    }
  } else {
    console.log('Manga data already exists, skipping seed data creation...');
  }

  console.log('Database seeding completed successfully!');
}
