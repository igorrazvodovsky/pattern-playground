import * as dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config({ quiet: true });

// Environment variable validation
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Server configuration types
type ReasoningEffort = 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';

interface OpenAIConfig {
  apiKey: string;
  model: string;
  /** For calls a reader is waiting on, where latency beats depth. */
  fastModel: string;
  /* Current models reason before answering, and the default effort (medium)
     adds seconds to every call. The demos ask for short transformations, so
     low is enough. */
  reasoningEffort: ReasoningEffort;
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
    model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    fastModel: process.env.OPENAI_FAST_MODEL || 'gpt-5.6-luna',
    reasoningEffort: (process.env.OPENAI_REASONING_EFFORT as ReasoningEffort | undefined) || 'low',
  },
  cors: {
    allowedOrigins: [
      'http://localhost:6006', // Storybook (packages/components)
      'http://localhost:4321', // Patterns site dev (apps/patterns)
      // Astro's next free port, which a second checkout or worktree lands on
      'http://localhost:4322',
      process.env.FRONTEND_URL || '', // Frontend URL from environment variable
      // Render.com domains
      'https://pattern-playground.onrender.com',
      // Add other production domains here
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'] as const,
    allowedHeaders: ['Content-Type', 'Authorization'] as const
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;
