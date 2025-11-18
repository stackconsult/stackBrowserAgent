import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { generateToken, generateDemoToken, authenticateToken, AuthenticatedRequest } from './auth/jwt';
import { validateRequest, schemas } from './middleware/validation';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { getHealthStatus } from './utils/health';
import { validateEnvironment, printEnvironmentSummary } from './utils/env';
import { MetaAgentOrchestrator, RepositoryAnalyzer, AgentType } from './agents';

// Load environment variables
dotenv.config();

// Validate environment configuration
const envConfig = validateEnvironment();
printEnvironmentSummary(envConfig);

const app = express();
const PORT = envConfig.port;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter); // Apply rate limiting to all routes

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
});

// Health check endpoint with enhanced metrics
app.get('/health', (req: Request, res: Response) => {
  const health = getHealthStatus();
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Generate token endpoint (for testing) - with stricter rate limiting and validation
app.post('/auth/token', authLimiter, validateRequest(schemas.generateToken), (req: Request, res: Response) => {
  const { userId, role } = req.body;

  const token = generateToken({ userId, role });
  
  logger.info('Token generated', { userId, role });
  
  res.json({ token });
});

// Demo token endpoint - with stricter rate limiting
app.get('/auth/demo-token', authLimiter, (req: Request, res: Response) => {
  const token = generateDemoToken();
  res.json({ 
    token,
    message: 'Use this token for testing. Add it to Authorization header as: Bearer <token>'
  });
});

// Protected route example
app.get('/api/protected', authenticateToken, (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  res.json({ 
    message: 'Access granted to protected resource',
    user: authenticatedReq.user 
  });
});

// Protected agent status endpoint
app.get('/api/agent/status', authenticateToken, (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  res.json({
    status: 'running',
    user: authenticatedReq.user,
    timestamp: new Date().toISOString()
  });
});

// Agent orchestration endpoints

// Store ongoing orchestrations (in-memory for now)
const orchestrations = new Map<string, { status: string; result?: unknown; error?: string }>();

// POST /api/v1/agents/orchestrate - Start full orchestration
app.post('/api/v1/agents/orchestrate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { repositoryPath, targetScope, autoFix } = req.body;

    if (!repositoryPath) {
      res.status(400).json({ error: 'repositoryPath is required' });
      return;
    }

    // Generate orchestration ID
    const orchestrationId = `orch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Start orchestration asynchronously
    orchestrations.set(orchestrationId, { status: 'running' });

    // Execute orchestration in background
    (async () => {
      try {
        const orchestrator = new MetaAgentOrchestrator();
        const result = await orchestrator.execute({
          repositoryPath,
          targetScope: targetScope || 'full',
          autoFix: autoFix !== false
        });

        orchestrations.set(orchestrationId, {
          status: result.status,
          result: result.data
        });
      } catch (error) {
        orchestrations.set(orchestrationId, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    })();

    res.json({
      orchestrationId,
      status: 'started',
      message: 'Orchestration started successfully',
      statusUrl: `/api/v1/agents/status/${orchestrationId}`
    });
  } catch (error) {
    logger.error('Orchestration start failed', { error });
    res.status(500).json({
      error: 'Failed to start orchestration',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /api/v1/agents/analyze - Analyze repository only
app.post('/api/v1/agents/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { repositoryPath } = req.body;

    if (!repositoryPath) {
      res.status(400).json({ error: 'repositoryPath is required' });
      return;
    }

    const analyzer = new RepositoryAnalyzer();
    const result = await analyzer.execute({
      repositoryPath,
      includeHidden: false,
      maxDepth: 10,
      scanDependencies: true
    });

    res.json({
      status: result.status,
      message: result.message,
      data: result.data,
      metrics: result.metrics
    });
  } catch (error) {
    logger.error('Repository analysis failed', { error });
    res.status(500).json({
      error: 'Failed to analyze repository',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/v1/agents/status/:id - Get orchestration status
app.get('/api/v1/agents/status/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;

  const orchestration = orchestrations.get(id);

  if (!orchestration) {
    res.status(404).json({ error: 'Orchestration not found' });
    return;
  }

  res.json({
    orchestrationId: id,
    status: orchestration.status,
    result: orchestration.result,
    error: orchestration.error
  });
});

// GET /api/v1/agents/types - List available agent types
app.get('/api/v1/agents/types', authenticateToken, (req: Request, res: Response) => {
  res.json({
    agentTypes: Object.values(AgentType),
    description: 'Available agent types in the orchestration system'
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server started`, {
      port: PORT,
      environment: envConfig.nodeEnv,
      nodeVersion: process.version,
    });
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Environment: ${envConfig.nodeEnv}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Demo token: http://localhost:${PORT}/auth/demo-token`);
  });
}

export default app;
