import { Router } from 'express';
import { CatController } from '../controllers/catController.ts';

const router = Router();
const catController = new CatController();

/**
 * @openapi
 * /api/cats:
 *   get:
 *     tags:
 *       - Cats
 *     summary: Get all cats
 *     description: Retrieve a list of all cats in the café
 *     parameters:
 *       - in: query
 *         name: temperaments
 *         schema:
 *           type: string
 *         required: false
 *         description: Include the temperaments that the cat you are looking for must have, separeted by '|'
 *       - in: query
 *         name: isAdopted
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Set to `true` to include the list of cats that were adopted
 *     responses:
 *       200:
 *         description: A list of cats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cat'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags:
 *       - Cats
 *     summary: Add a new cat
 *     description: Add a new cat to the café
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CatWithoutID'
 *     responses:
 *       201:
 *         description: Cat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cat'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Staff or Adopter not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/cats/{id}:
 *   get:
 *     tags:
 *       - Cats
 *     summary: Get a cat by ID
 *     description: Retrieve a single cat by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The cat ID
 *     responses:
 *       200:
 *         description: Cat found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cat'
 *       404:
 *         description: Cat not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags:
 *       - Cats
 *     summary: Update a cat
 *     description: Update a cat's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The cat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CatWithoutID'
 *     responses:
 *       200:
 *         description: Cat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cat'
 *       404:
 *         description: Cat, Staff or Adopter not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     tags:
 *       - Cats
 *     summary: Update a cat's staff in charge or Adopt the cat
 *     description: Update the `staffInCharge` attribute of a cat or provide an `adopterId` in case of adoption
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the cat whose staff in charge is being updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffInCharge:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the new staff member responsible for the cat.
 *               adopterId:
 *                 type: integer
 *                 description: The ID of the adopter of the cat.
 *                 example: 11111111
 *     responses:
 *       200:
 *         description: Staff in charge updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cat'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cat, Staff or Adopter not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags:
 *       - Cats
 *     summary: Delete a cat
 *     description: Remove a cat from the café
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The cat ID
 *     responses:
 *       204:
 *         description: Cat deleted successfully
 *       404:
 *         description: Cat not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/cats/:id', (req, res) => catController.getCat(req, res));
router.get('/cats', (req, res) => catController.getCats(req, res));
router.post('/cats', (req, res) => catController.addCat(req, res));
router.put('/cats/:id', (req, res) => catController.updateCat(req, res));
router.patch('/cats/:id', (req, res) => catController.patchCat(req, res));
router.delete('/cats/:id', (req, res) => catController.removeCat(req, res));

export default router;