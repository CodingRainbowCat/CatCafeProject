import { Request, Response } from 'express';
import { z } from 'zod';
import { StaffService } from '../services/staffService.js';
import { CatService } from '../services/catService.js';
import { Staff } from '../types/staff.js';

const staffService = new StaffService();
const catService = new CatService();

const StaffSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().int().positive().min(18),
  dateJoined: z.string().or(z.date()).transform((val) => new Date(val)),
  role: z.string().min(1)
});

export class StaffController {
  async getStaff(req: Request, res: Response) {
    const { id } = req.params;
    const includeCats = req.query.includeCats?.toString().toLowerCase() === 'true';
    let staff: Staff | null = null;

    try {
      staff = await staffService.getStaffById(id);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      if (!includeCats){
        res.json(staff);
      }
      else {
        const cats = await catService.getCatsByStaffId(id);
        res.json({ ...staff, cats });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' + JSON.stringify(error) });
    }
  }

  async getAllStaff(_req: Request, res: Response){
    let staff: Staff[] | null = null;

    try {
      staff = await staffService.getAllStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' + JSON.stringify(error) });
    }
}

  async addStaff(req: Request, res: Response) {
    try {
      const validatedStaff = StaffSchema.parse(req.body);
      const newStaff = await staffService.createStaff(validatedStaff);
      res.status(201).json(newStaff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

    async removeStaff(req: Request, res: Response) {
      const { id } = req.params;
      
      try {
        const hasCatsInCharge = await catService.getCatsByStaffId(id);
        if (hasCatsInCharge && hasCatsInCharge.length >= 1) { return res.status(400).json({message: 'Staff can not be deleted when they are in charge of cats. Please assign the cats to a new Staff first'});}
        
        const removed = await staffService.deleteStaff(id);
        if (!removed) {
          return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(204).send();
      } catch (err) {
        res.status(500).json({ message: 'Internal server error' + JSON.stringify(err) });
      }
    }
}