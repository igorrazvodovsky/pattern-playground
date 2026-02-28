---
paths:
  - "server/**/*.ts"
---

# Server

## Development commands
- `cd server && npm run dev` - Start Express server with hot reload
- `cd server && npm run build` - Compile TypeScript
- `cd server && npm run start` - Run production server
- `cd server && npm run typecheck` - TypeScript type checking

## Architecture
- Node.js/Express server with OpenAI API integration
- TypeScript with ES modules
- AI adapters for different component suggestion types
- Streaming API responses with Server-Sent Events
