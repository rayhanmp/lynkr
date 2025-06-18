# Lynkr

A truly useful OSS URL Shortener for small to medium sized organisations.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, shareable links with custom slugs
- **Caching**: Redis-powered caching for fast redirects
- **Modern Tech Stack**: Built with TypeScript, Fastify, React, and PostgreSQL
- **Docker Support**: Easy deployment with Docker Compose

## 🎯 Roadmap
Full roadmap can be accessed on [Lynkr Featurebase](https://lynkr.featurebase.app/roadmap).

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- pnpm (package manager)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lynkr
   ```

2. **Start the services**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6432
   - PgBouncer connection pooler

3. **Set up environment variables**
   Create a `.env` file in the backend directory:

   ```env
   DATABASE_URL=postgresql://lynkr:lynkr@localhost:5432/lynkr
   BASE_URL=http://localhost:3000
   GENERATED_SLUG_LENGTH=8
   MAX_COLLISION_RETRIES=5
   ```

4. **Install dependencies and start the backend**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Install dependencies and start the frontend**

   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

## 🗂️ Project Structure

```text
lynkr/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── db/              # Database schema and connection
│   │   ├── plugins/         # Fastify plugins
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic and external services
│   │   └── index.ts         # Application entry point
│   ├── drizzle.config.ts    # Drizzle ORM configuration
│   └── tsconfig.json        # TypeScript configuration
├── frontend/
│   ├── src/                 # React application source
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── docker-compose.yaml      # Docker services configuration
└── README.md               # Project documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://lynkr:lynkr@localhost:5432/lynkr

# Application
BASE_URL=http://localhost:3000
GENERATED_SLUG_LENGTH=8
MAX_COLLISION_RETRIES=5
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
