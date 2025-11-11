# stackBrowserAgent

Browser Agent with JWT Authentication and Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/stackbrowseragent)

## Features

- 🔐 JWT Authentication with Express
- 🚀 One-click deployment to Railway
- 🐳 Docker containerization
- 📝 TypeScript for type safety
- ⚡ Fast development with ts-node

## Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/stackconsult/stackBrowserAgent.git
cd stackBrowserAgent
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your JWT secret:
```env
JWT_SECRET=your-secure-secret-key
JWT_EXPIRATION=24h
PORT=3000
```

5. Run in development mode:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Generate Demo Token
```bash
GET /auth/demo-token
```
Returns a demo JWT token for testing.

### Generate Custom Token
```bash
POST /auth/token
Content-Type: application/json

{
  "userId": "user123",
  "role": "admin"
}
```

### Protected Route Example
```bash
GET /api/protected
Authorization: Bearer <your-jwt-token>
```

### Agent Status (Protected)
```bash
GET /api/agent/status
Authorization: Bearer <your-jwt-token>
```

## Railway Deployment

### Option 1: One-Click Deploy

Click the "Deploy on Railway" button above to deploy instantly.

### Option 2: Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize and deploy:
```bash
railway init
railway up
```

4. Set environment variables in Railway dashboard:
   - `JWT_SECRET`: Your secure secret key
   - `JWT_EXPIRATION`: Token expiration time (e.g., "24h")
   - `PORT`: Will be set automatically by Railway

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT signing | `default-secret...` | Yes (in production) |
| `JWT_EXPIRATION` | JWT token expiration time | `24h` | No |
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |

## Testing JWT Authentication

1. Get a demo token:
```bash
curl http://localhost:3000/auth/demo-token
```

2. Use the token to access protected routes:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/protected
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t stackbrowseragent .

# Run container
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  stackbrowseragent
```

## Security Notes

⚠️ **Important**: Always set a strong `JWT_SECRET` in production. Never use the default value.

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## License

ISC
