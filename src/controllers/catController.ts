import { Request, Response } from 'express';
import { z } from 'zod';
import { CatService } from '../services/catService.js';
import { Temperament, TEMPERAMENTS } from '../types/cat.js';
import { StaffService } from '../services/staffService.js';
import { AdopterService } from '../services/adopterService.js';

const catService = new CatService();
const staffService = new StaffService();
const adopterService = new AdopterService();

const CatSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
  breed: z.string().min(1),
  dateJoined: z.string().or(z.date()).transform((val) => new Date(val)),
  vaccinated: z.boolean(),
  temperament: z.array(z.enum(TEMPERAMENTS)),
  staffInCharge: z.string().uuid(),
  isAdopted: z.boolean(),
  adopterId: z.number().int().positive().optional()
});

export class CatController {
  async getCat(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const cat = await catService.getCatById(parseInt(id));
      if (!cat) {
        return res.status(404).json({ message: 'Cat not found' });
      }
      res.json(cat);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error'  + JSON.stringify(err) });
    }
  }

  async getCats(_req: Request, res: Response) {
    try 
    {
      const allCats = await catService.getAllCats();

      //Block code for temperaments filter
      const rawTemperaments = _req.query.temperaments?.toString().toLowerCase();
      let filteredCats = allCats;
      if (allCats && rawTemperaments){
        const parsedTemperaments = (rawTemperaments?.split('|').map(temp => temp.charAt(0).toUpperCase() + temp.slice(1))) as Temperament[];
        filteredCats = allCats.filter(cat => parsedTemperaments.every(temp => cat.temperament.includes(temp)));
      }

      //Block code for isAdopted filter
      let isAdopted;
      if (_req.query.isAdopted?.toString().toLowerCase() === 'true'){ isAdopted = true; }
      if (_req.query.isAdopted?.toString().toLowerCase() === 'false'){ isAdopted = false; }
      if (filteredCats && isAdopted === true)
      {
        filteredCats = filteredCats.filter(cat => cat.isAdopted === true);
      }
      if (filteredCats && isAdopted === false){
        filteredCats = filteredCats.filter(cat => cat.isAdopted === false);
      }

      res.json(filteredCats);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error'  + JSON.stringify(err) });
    }
  }

  async addCat(req: Request, res: Response) {
    try {
      const validatedData = CatSchema.parse(req.body);
      const catStaff = await staffService.getStaffById(validatedData.staffInCharge);
      if (!catStaff) {
        return res.status(404).json({ message: 'Staff not found'});
      }
      if (!this.isValidTemperamentArray(req.body.temperament)) {
        return res.status(400).json({ error: 'Invalid temperament values' });
      }
      
      //Adopter logic block code
      if (validatedData.isAdopted && validatedData.adopterId !== undefined)
      {
        const catAdopter = await adopterService.getAdopterById(validatedData.adopterId);
        if (!catAdopter){
           return res.status(404).json({message: 'Adopter not found'});
        }
      }
      if (validatedData.isAdopted && validatedData.adopterId === undefined){
        return res.status(400).json({message: 'AdopterId must be specified when the cat is adopted'});
      }
      else //If the cat is not adopted, ignore the ID the user might have passed.
      {
        validatedData.adopterId = undefined;
      }

      const newCat = await catService.createCat(validatedData);
      res.status(201).json(newCat);
    } 
    catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCat(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const validatedData = CatSchema.parse(req.body);
      const catStaff = await staffService.getStaffById(validatedData.staffInCharge);
      if (!catStaff) {
        return res.status(404).json({ message: 'Staff not found'});
      }
      if (!this.isValidTemperamentArray(req.body.temperament)) {
        return res.status(400).json({ error: 'Invalid temperament values' });
      }
      
      //Adopter logic block code
      if (validatedData.isAdopted && validatedData.adopterId !== undefined)
      {
        const catAdopter = await adopterService.getAdopterById(validatedData.adopterId);
        if (!catAdopter){
           return res.status(404).json({message: 'Adopter not found'});
        }
      }
      if (validatedData.isAdopted && validatedData.adopterId === undefined){
        return res.status(400).json({message: 'AdopterId must be specified when the cat is adopted'});
      }
      else //If the cat is not adopted, ignore the ID the user might have passed.
      {
        validatedData.adopterId = undefined;
      }

      const updatedCat = await catService.updateCat(parseInt(id), validatedData);
      
      if (!updatedCat) {
        return res.status(404).json({ message: 'Cat not found' });
      }
      
      res.json(updatedCat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async patchCat(req: Request, res: Response) {
    const { id } = req.params;
    const { staffInCharge, adopterId } = req.body;
  
    const StaffSchema = z.object({
      staffInCharge: z.string().uuid().optional()
    });
    const AdopterSchema = z.object({
      adopterId: z.number().int().positive().optional()
    });
  
    try {
      //Stuff validation
      const parsedStaff = StaffSchema.parse({ staffInCharge });
      let validatedStaff = null;
      if (parsedStaff.staffInCharge) validatedStaff = await staffService.getStaffById(parsedStaff.staffInCharge);
      if (parsedStaff.staffInCharge && !validatedStaff) {
        return res.status(404).json({ message: 'Staff not found'});
      }

      //Adopter validation
      const parsedAdopter = AdopterSchema.parse({ adopterId });
      let validatedAdopter = null;
      if (parsedAdopter.adopterId) validatedAdopter = await adopterService.getAdopterById(parsedAdopter.adopterId);
      if (parsedAdopter.adopterId && !validatedAdopter){
        return res.status(404).json({ message: 'Adopter not found'});
      }

      const updatedCat = await catService.patchCat(parseInt(id), parsedStaff.staffInCharge, parsedAdopter.adopterId);
      
      if (!updatedCat) {
        return res.status(404).json({ message: 'Cat not found' });
      }
  
      res.json(updatedCat);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }  

  async removeCat(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const removed = await catService.deleteCat(parseInt(id));
      if (!removed) {
        return res.status(404).json({ message: 'Cat not found' });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' + JSON.stringify(err) });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isValidTemperamentArray(arr: any): arr is Temperament[] {
    return Array.isArray(arr) && arr.every(t => TEMPERAMENTS.includes(t));
  }
}