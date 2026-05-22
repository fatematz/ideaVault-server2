# IdeaVault Server

Backend API server for the **IdeaVault** platform — a place to share, explore, and discuss innovative ideas.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB (Native Driver)
- **Auth:** JWT verification via `jose-cjs` (Better Auth integration)
- **Deployment:** Vercel

## Features

- Browse all ideas with pagination support
- Trending ideas endpoint
- Add, edit, and delete ideas
- Comment system (add, edit, delete)
- User-specific idea and comment fetching
- JWT-based route protection

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/all-ideas` | Get all ideas (paginated) |
| GET | `/trending-ideas` | Get trending ideas (supports `?limit=6`) |
| GET | `/myidea?email=` | Get ideas by user (protected) |
| POST | `/addidea` | Add a new idea (protected) |
| PUT | `/ideas/:id` | Update an idea |
| DELETE | `/ideas/:id` | Delete an idea (protected) |
| GET | `/comments/:ideaId` | Get comments for an idea |
| POST | `/my-interactions` | Add a comment (protected) |
| PATCH | `/comments/:id` | Edit a comment |
| DELETE | `/comments/:id` | Delete a comment (protected) |
| GET | `/user-comments?email=` | Get all comments by a user |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/fatematz/ideaVault-server2.git
cd ideaVault-server2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=your_frontend_url
```

### 4. Run the server

```bash
node index.js
```

Server will start on `http://localhost:5000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL (used for JWKS verification) |

## Deployment

This project is configured for **Vercel** deployment via `vercel.json`.

