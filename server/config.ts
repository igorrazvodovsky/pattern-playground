import * as dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

// Environment variable validation
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Server configuration types
interface OpenAIConfig {
  apiKey: string;
  model: string;
}

interface CorsConfig {
  allowedOrigins: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

interface LoggingConfig {
  level: string;
}

interface ServerConfig {
  port: number;
  openai: OpenAIConfig;
  cors: CorsConfig;
  logging: LoggingConfig;
}

// Server configuration
const config: ServerConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4.1',
  },
  cors: {
    allowedOrigins: [
      'http://localhost:6006', // Storybook
      'http://localhost:7007', // React Storybook
      'http://localhost:3000', // Development
      process.env.FRONTEND_URL || '', // Frontend URL from environment variable
      // Render.com domains
      'https://pattern-playground.onrender.com/',
      // Add other production domains here
    ].filter(Boolean), // Remove empty strings
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;
