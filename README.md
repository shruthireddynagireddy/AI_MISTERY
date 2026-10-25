# AI Mystery Room

A fictional AI detective game built with React, Vite, Express, MongoDB/Mongoose, and Google Gemini. The server validates and stores a case solution before gameplay; the public case response never contains the answer key. With no database or Gemini key configured, the API uses a built-in fictional case so the full experience can be tried locally.

## Run locally

1. Install Node.js 20+ and (optionally) MongoDB.
2. Copy `.env.example` to `server/.env` and add `GEMINI_API_KEY` and `MONGODB_URI` as needed.
3. Run `npm install`, `npm install --prefix client`, and `npm install --prefix server`.
4. Run `npm run dev` from the project root. The UI is at http://localhost:5173 and API at http://localhost:4000.

MongoDB and Gemini are optional for the demo mode. Cases created in demo mode are held in server memory and reset when the server restarts. Never put provider keys in the client environment.
