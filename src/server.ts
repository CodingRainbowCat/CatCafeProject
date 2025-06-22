import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.ts';
import catRoutes from './routes/catRoutes.ts';
import staffRoutes from './routes/staffRoutes.ts';
import adopterRoutes from './routes/adopterRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import { authenticateToken } from './middleware/auth.ts';
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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

const hostname = process.env.PUBLIC_HOSTNAME || `http://localhost:${port}`;

app.listen(port, '0.0.0.0', () => {
  console.log(`🐱 Cat Café API is running at ${hostname}`);
  console.log(`📜 API documentation available at ${hostname}/api-docs`);
  console.log(`📄 Swagger JSON available at ${hostname}/swagger.json`);
});
