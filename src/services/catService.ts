import { Cat, TEMPERAMENTS, Temperament } from '../types/cat.js';
import { db } from '../db/index.js';

// --- Schema creation ---
(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS cats (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      age INTEGER NOT NULL,
      breed VARCHAR(100) NOT NULL,
      date_joined TIMESTAMP NOT NULL,
      vaccinated BOOLEAN NOT NULL,
      staff_in_charge UUID REFERENCES staff(id) ON DELETE SET NULL,
      is_adopted BOOLEAN NOT NULL,
      adopter_id INTEGER REFERENCES adopters(id) ON DELETE SET NULL
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS temperaments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS cat_temperaments (
      cat_id INTEGER REFERENCES cats(id) ON DELETE CASCADE,
      temperament_id INTEGER REFERENCES temperaments(id) ON DELETE CASCADE,
      PRIMARY KEY (cat_id, temperament_id)
    );
  `);

  for (const name of TEMPERAMENTS) {
    await db.query(`INSERT INTO temperaments (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  }
})();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCat(row: any, temperaments: Temperament[]): Cat {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    breed: row.breed,
    dateJoined: row.date_joined,
    vaccinated: row.vaccinated,
    temperament: temperaments,
    staffInCharge: row.staff_in_charge,
    isAdopted: row.is_adopted,
    adopterId: row.adopter_id,
  };
}

async function getTemperamentIds(names: Temperament[]): Promise<number[]> {
  const result = await db.query(`SELECT id FROM temperaments WHERE name = ANY($1::text[])`, [names]);
  return result.rows.map(r => r.id);
}

async function getCatTemperaments(catId: number): Promise<Temperament[]> {
  const result = await db.query(`
    SELECT t.name FROM cat_temperaments ct
    JOIN temperaments t ON t.id = ct.temperament_id
    WHERE ct.cat_id = $1
  `, [catId]);
  return result.rows.map(r => r.name);
}

export class CatService {

  async getAllCats(): Promise<Cat[] | null> {
    const cats = await db.query('SELECT * FROM cats ORDER BY name');
    if (!cats.rows[0]) return null;
    return Promise.all(cats.rows.map(async cat => rowToCat(cat, await getCatTemperaments(cat.id))));
  }
  
  async getCatById(id: number): Promise<Cat | null> {
    const result = await db.query('SELECT * FROM cats WHERE id = $1', [id]);
    if (!result.rows[0]) return null;
    const temperaments = await getCatTemperaments(id);
    return rowToCat(result.rows[0], temperaments);
  }
  
  async createCat(cat: Omit<Cat, 'id'>): Promise<Cat> {
    const result = await db.query(`
      INSERT INTO cats (name, age, breed, date_joined, vaccinated, staff_in_charge, is_adopted, adopter_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [
      cat.name, cat.age, cat.breed, cat.dateJoined, cat.vaccinated,
      cat.staffInCharge || null, cat.isAdopted, cat.adopterId ?? null
    ]);
  
    const temperamentIds = await getTemperamentIds(cat.temperament);
    for (const tid of temperamentIds) {
      await db.query(`INSERT INTO cat_temperaments (cat_id, temperament_id) VALUES ($1, $2)`,
        [result.rows[0].id, tid]);
    }
  
    return rowToCat(result.rows[0], cat.temperament);
  }
  
  async updateCat(id: number, data: Partial<Omit<Cat, 'id'>>): Promise<Cat | null> {
    const existing = await this.getCatById(id);
    if (!existing) return null;
  
    const updated = { ...existing, ...data };
  
    await db.query(`
      UPDATE cats SET name=$1, age=$2, breed=$3, date_joined=$4, vaccinated=$5,
      staff_in_charge=$6, is_adopted=$7, adopter_id=$8 WHERE id=$9
    `, [
      updated.name, updated.age, updated.breed, updated.dateJoined, updated.vaccinated,
      updated.staffInCharge || null, updated.isAdopted, updated.adopterId ?? null, id
    ]);
  
    if (data.temperament) {
      await db.query('DELETE FROM cat_temperaments WHERE cat_id = $1', [id]);
      const temperamentIds = await getTemperamentIds(data.temperament);
      for (const tid of temperamentIds) {
        await db.query('INSERT INTO cat_temperaments (cat_id, temperament_id) VALUES ($1, $2)', [id, tid]);
      }
    }
  
    return this.getCatById(id);
  }
  
  async deleteCat(id: number): Promise<boolean> {
    const existing = await this.getCatById(id);
    if (!existing) return false;
    await db.query('DELETE FROM cats WHERE id = $1', [id]);
    return true;
  }

  async getCatsByStaffId(staffId: string): Promise<Cat[] | null> {
    const cats = await db.query('SELECT * FROM cats WHERE staff_in_charge = $1', [staffId]);
    if (!cats.rows[0]) return null;
    return Promise.all(cats.rows.map(async cat => rowToCat(cat, await getCatTemperaments(cat.id))));
  }
  
  async getCatsByAdopterId(adopterId: number): Promise<Cat[] | null> {
    const cats = await db.query('SELECT * FROM cats WHERE adopter_id = $1', [adopterId]);
    if (!cats.rows[0]) return null;
    return Promise.all(cats.rows.map(async cat => rowToCat(cat, await getCatTemperaments(cat.id))));
  }
  
  async patchCat(
    id: number,
    staffInCharge?: string,
    adopterId?: number
  ): Promise<Cat | null> {
    const existing = await this.getCatById(id);
    if (!existing) return null;
  
    const updatedStaff = staffInCharge ?? existing.staffInCharge;
    const updatedAdopterId = adopterId ?? existing.adopterId;
    const updatedIsAdopted = adopterId !== undefined ? true : existing.isAdopted;
  
    await db.query(`
      UPDATE cats SET staff_in_charge = $1, adopter_id = $2, is_adopted = $3
      WHERE id = $4
    `, [updatedStaff, updatedAdopterId, updatedIsAdopted, id]);
  
    return this.getCatById(id);
  }
}
