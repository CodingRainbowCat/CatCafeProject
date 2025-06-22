import { Staff } from '../types/staff.ts';
import { db } from '../db/index.ts';


(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      age INTEGER NOT NULL,
      date_joined TIMESTAMP NOT NULL,
      role VARCHAR(50) NOT NULL
    );
  `);

  await db.query(`
    INSERT INTO staff (id, name, last_name, age, date_joined, role)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'The',
      'Boss',
      30,
      '2021-01-01T00:00:00.000Z',
      'Boss'
    )
    ON CONFLICT (id) DO NOTHING;
  `);
})();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStaff(row: any): Staff {
  return {
    id: row.id,
    name: row.name,
    lastName: row.last_name,
    age: row.age,
    dateJoined: row.date_joined,
    role: row.role
  };
}

export class StaffService {
  
  async getAllStaff(): Promise<Staff[] | null> {
    const res = await db.query('SELECT * FROM staff ORDER BY name');
    if (!res.rows[0]) return null;
    return res.rows;
  }
  
  async getStaffById(id: string): Promise<Staff | null> {
    const res = await db.query('SELECT * FROM staff WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
  
  async createStaff(data: Staff): Promise<Staff> {
    const id = crypto.randomUUID();
    const res = await db.query(`
      INSERT INTO staff (id, name, last_name, age, date_joined, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [id, data.name, data.lastName, data.age, data.dateJoined, data.role]
    );
    return rowToStaff(res.rows[0]);
  }
  
  async updateStaff(id: string, data: Partial<Omit<Staff, 'id'>>): Promise<Staff | null> {
    const existing = await this.getStaffById(id);
    if (!existing) return null;
  
    const updated = { ...existing, ...data };
  
    await db.query(`
      UPDATE staff SET name = $1, last_name = $2, age = $3, date_joined = $4, role = $5
      WHERE id = $6`,
      [
        updated.name,
        updated.lastName,
        updated.age,
        updated.dateJoined,
        updated.role,
        id,
      ]
    );
  
    return this.getStaffById(id);
  }
  
  async deleteStaff(id: string): Promise<boolean> {
    const existing = await this.getStaffById(id);
    if (!existing) return false;
    await db.query('DELETE FROM staff WHERE id = $1', [id]);
    return true;
  }
}
