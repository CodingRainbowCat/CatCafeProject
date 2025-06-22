import { Router } from "express";
import { AdopterController } from "../controllers/adopterController.ts";

const router = Router();
const adopterController = new AdopterController();

/**
 * @openapi
 * /api/adopters/{id}:
 *   get:
 *     tags:
 *       - Adopters
 *     summary: Get an adopter by ID
 *     security: []
 *     description: Retrieve a single adopter by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The adopter ID
 *       - in: query
 *         name: includeCats
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Set to `true` to include the list of cats they have adopted.
 *     responses:
 *       200:
 *         description: Adopter found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adopter'
 *       404:
 *         description: Adopter not found
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
 *       - Adopters
 *     summary: Delete an Adopter
 *     security: []
 *     description: Remove an Adopter from the café's DB
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the Adopter to remove
 *     responses:
 *       204:
 *         description: Adopter deleted successfully
 *       400:
 *         description: The Adopter already made an adoption and their data is needed on the system
 *       404:
 *         description: Adopter not found
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
 * /api/adopters:
 *   get:
 *     tags:
 *       - Adopters
 *     summary: Get all the Adopters
 *     security: []
 *     description: Retrieve all the adopters in the café
 *     responses:
 *       200:
 *         description: List of adopters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Non Staff found
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
 *   post:
 *     tags:
 *       - Adopters
 *     summary: Add a new adopter
 *     security: []
 *     description: Add a new cat adopter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: First name.
 *               lastName:
 *                 type: string
 *                 description: Last name.
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *                 description: The date of birth of the adopter.
 *               phone:
 *                 type: string
 *                 description: Phone number.
 *               address:
 *                 type: string
 *                 description: The adopters address.
 *     responses:
 *       201:
 *         description: Adopter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adopter'
 *       400:
 *         description: Invalid input
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

router.get("/adopters/:id", (req, res) => adopterController.getAdopter(req, res));
router.get("/adopters", (req, res) => adopterController.getAdopters(req, res));
router.post("/adopters", (req, res) => adopterController.addAdopter(req, res));
router.delete("/adopters/:id", (req, res) => adopterController.removeAdopter(req, res));

export default router;
