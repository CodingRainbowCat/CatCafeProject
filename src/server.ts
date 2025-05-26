import express from 'express';
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.js';
import catRoutes from './routes/catRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import adopterRoutes from './routes/adopterRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

// Enable trust proxy
app.set('trust proxy', 1);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, (req: Request, res: Response, next: NextFunction) => {
  const host = `${req.protocol}://${req.headers.host}`;
  specs.servers = [
    {
      url: host,
      description: 'Current host',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local dev (fallback)',
    }
  ];
  swaggerUi.setup(specs)(req, res, next);
});

app.get('/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Cat Café API',
    endpoints: {
      docs: '/api-docs',
      swagger_json: '/swagger.json',
      auth: '/api/auth',
      cats: '/api/cats',
      staff: '/api/staff', //protected
      adopters: '/api/adopters',
    },
  });
});

app.use('/api', authRoutes);
app.use('/api', catRoutes);
app.use('/api', adopterRoutes);
app.use('/api', authenticateToken, staffRoutes);

console.log('ENV USER:', process.env.RDS_USERNAME);

const hostname = process.env.PUBLIC_HOSTNAME || `http://localhost:${port}`;

app.listen(port, '0.0.0.0', () => {
  console.log(`🐱 Cat Café API is running at ${hostname}`);
  console.log(`📜 API documentation available at ${hostname}/api-docs`);
  console.log(`📄 Swagger JSON available at ${hostname}/swagger.json`);
});