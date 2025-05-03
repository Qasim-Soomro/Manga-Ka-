# 📚 MangaKnight

**MangaKnight** is a modern web application that allows users to browse, search, and read manga online through a clean and responsive interface.

## 🚀 Live Demo

Check out the live version here:  
👉 [MangaKnight on Replit](https://97290b76-901b-45f3-9142-1c611463fca3-00-1c6kfvzrckjx.kirk.replit.dev/)

---

## 🔥 Features

- 🧭 User-friendly interface for smooth navigation
- 📱 Fully responsive design
- 🔍 Search bar for quick manga discovery
- 📖 Seamless manga reading experience
- ❤️ Favorite/save manga titles
- 🌙 Dark mode toggle
- 🔐 User authentication & sessions

---

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- Drizzle ORM

### Database
- PostgreSQL

### Other
- Prisma (for migrations)
- Replit (for deployment)

---

## 🧪 Getting Started

### Prerequisites
- Node.js
- PostgreSQL

### 🗂️ Project Structure

MangaKnight/
├── public/             # Static assets
├── server/             # Backend logic (Express)
├── src/                # Frontend (React)
│   ├── components/     
│   ├── pages/
│   ├── styles/
├── .env                # Environment variables
├── package.json        
└── vite.config.ts

### 🤝 Contributing
Contributions, suggestions, and improvements are welcome! Fork the repository and submit a pull request.

### 📄 License
This project is licensed under the MIT License.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/MangaKnight.git
cd MangaKnight

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env  # then edit .env with your database and auth values

# 4. Run database migrations
npx prisma migrate dev

# 5. Start the server
npm run dev


