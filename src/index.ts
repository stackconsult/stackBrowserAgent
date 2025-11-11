import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateToken, generateDemoToken, authenticateToken } from './auth/jwt';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate token endpoint (for testing)
app.post('/auth/token', (req: Request, res: Response) => {
  const { userId, role } = req.body;
  
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  const token = generateToken({ userId, role: role || 'user' });
  res.json({ token });
});

// Demo token endpoint
app.get('/auth/demo-token', (req: Request, res: Response) => {
  const token = generateDemoToken();
  res.json({ 
    token,
    message: 'Use this token for testing. Add it to Authorization header as: Bearer <token>'
  });
});

// Protected route example
app.get('/api/protected', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ 
    message: 'Access granted to protected resource',
    user 
  });
});

// Protected agent status endpoint
app.get('/api/agent/status', authenticateToken, (req: Request, res: Response) => {
  res.json({
    status: 'running',
    user: (req as any).user,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Demo token: http://localhost:${PORT}/auth/demo-token`);
});

export default app;
