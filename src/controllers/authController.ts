import { Request, Response } from 'express';
import { generateTokens } from '../middleware/auth';
import { AuthService } from '../services/authService';
import jwt from 'jsonwebtoken';

const authService = new AuthService();

interface JwtPayload {
    userId: string;
    username: string;
  }

export class AuthController {
  async register(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const user = await authService.registerUser(username, password);
      res.status(201).json({ 
        message: 'User registered successfully',
        userId: user.id 
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'Username already exists') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      res.status(500).json({ error: 'Error creating user. ' + err});
    }
  }

  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const user = await authService.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const tokens = generateTokens({
        userId: user.id,
        username: user.username
      });

      res.json(tokens);
    } catch (err) {
      res.status(500).json({ error: 'Login failed. ' + err});
    }
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as JwtPayload;
      const user = await authService.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const tokens = generateTokens({
        userId: user.id,
        username: user.username
      });

      res.json(tokens);
    } catch (err) {
      res.status(401).json({ error: 'Invalid refresh token. ' + err});
    }
  }
}

export const authController = new AuthController();