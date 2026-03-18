# GeoQuest

Geography quiz game built with React and Express.

## Setup

Requires Node 18+.

```bash
# client
cd client
npm install
npm run dev

# server (in a separate terminal)
cd server
npm install
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:8000`.

Create a `.env` file in the project root (not inside server/) with your Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
