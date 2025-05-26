import { Adopter } from '../types/adopter.js';
import { db } from '../db/index.js';

(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS adopters (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      date_of_birth DATE NOT NULL,
      phone VARCHAR(20),
      address VARCHAR(100)
    );
  `);
})();

export class AdopterService {

  async getAllAdopters(): Promise<Adopter[]> {
    const res = await db.query('SELECT * FROM adopters ORDER BY name');
    return res.rows;
  }
  
  async getAdopterById(id: number): Promise<Adopter | null> {
    const res = await db.query('SELECT * FROM adopters WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
  
  async createAdopter(data: Omit<Adopter, 'id'>): Promise<Adopter> {
    const res = await db.query(
      `INSERT INTO adopters (name, last_name, date_of_birth, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.lastName, data.dateOfBirth, data.phone, data.address]
    );
    return res.rows[0];
  }
  
  async updateAdopter(id: number, data: Partial<Omit<Adopter, 'id'>>): Promise<Adopter | null> {
    const existing = await this.getAdopterById(id);
    if (!existing) return null;
  
    const updated = { ...existing, ...data };
  
    await db.query(
      `UPDATE adopters SET name = $1, last_name = $2, date_of_birth = $3, phone = $4, address = $5 WHERE id = $6`,
      [updated.name, updated.lastName, updated.dateOfBirth, data.phone, data.address, id]
    );
  
    return this.getAdopterById(id);
  }
  
  async deleteAdopter(id: number): Promise<boolean> {
    const existing = await this.getAdopterById(id);
    if (!existing) return false;
    await db.query('DELETE FROM adopters WHERE id = $1', [id]);
    return true;
  }

  async getAdopterByPhone(phone: number): Promise<Adopter | null> {
    const res = await db.query('SELECT * FROM adopters WHERE phone = $1', [phone.toString()]);
    return res.rows[0] || null;
  }
}
