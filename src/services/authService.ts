import { hashPassword, verifyPassword } from '../middleware/auth';
import { User } from '../types/user.ts';
import { db } from '../db/index.ts';

// DB setup
(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
})();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  };
}

export class AuthService {

  async getUserById(id: string): Promise<User | null> {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] ? rowToUser(res.rows[0]) : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const res = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0] ? rowToUser(res.rows[0]) : null;
  }

  // Register a new user
  async registerUser(username: string, plainPassword: string): Promise<User> {
    const existing = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rowCount && existing.rowCount > 0) {
      throw new Error('Username already exists');
    }

    const id = crypto.randomUUID();
    const hashedPassword = await hashPassword(plainPassword);

    const res = await db.query(
      `INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING id, username, password, created_at`,
      [id, username, hashedPassword]
    );

    return rowToUser(res.rows[0]);
  }

  // Login (return user if valid, null if not)
  async authenticateUser(username: string, plainPassword: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const passwordValid = await verifyPassword(plainPassword, user.password);
    return passwordValid ? rowToUser(user) : null;
  }
}