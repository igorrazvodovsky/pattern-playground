# Pattern Playground Server

This is the backend server for the Pattern Playground application. It provides an API for generating pasteurizer models using OpenAI's GPT-4o model.

## Features

- RESTful API for generating pasteurizer models
- Support for both streaming and non-streaming responses
- Structured JSON schema validation using Zod
- Comprehensive error handling
- Configurable logging
- CORS support for cross-origin requests

## Project Structure

```
server/
├── config.js         # Configuration settings and environment variables
├── logger.js         # Logging utility
├── middleware.js     # Express middleware setup
├── routes.js         # API route handlers
├── schemas.js        # JSON schema definitions
├── server.js         # Main server entry point
├── package.json      # Project dependencies
├── .env.example      # Example environment variables
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

5. Edit the `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Server

Development mode with auto-restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Generate Pasteurizer Model

```
POST /api/generate
```

#### Request Body

```json
{
  "prompt": "milk pasteurization"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "model": [
      {
        "id": "component-1",
        "type": "component",
        "name": "Raw Milk Storage Tank",
        "label": "Storage Tank",
        "description": "Insulated tank for storing raw milk before processing",
        ...
      },
      ...
    ]
  },
  "error": null
}
```

#### Streaming Response

To receive a streaming response, set the `Accept` header to `text/event-stream`. The server will send Server-Sent Events (SSE) with each component as it's generated.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `PORT` | Server port | 3000 |
| `OPENAI_MODEL` | OpenAI model to use | gpt-4o |
| `LOG_LEVEL` | Logging level (error, warn, info, debug) | info |

## License

This project is licensed under the MIT License.
