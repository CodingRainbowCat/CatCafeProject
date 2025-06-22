import { Router } from 'express';
import { StaffController } from '../controllers/staffController.ts';

const router = Router();
const staffController = new StaffController();

/**
 * @openapi
 * /api/staff/{id}:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get a staff member by ID
 *     description: Retrieve a single staff member by their ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The staff member ID
 *       - in: query
 *         name: includeCats
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Set to `true` to include the list of cats they are in charge of.
 *     responses:
 *       200:
 *         description: Staff member found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Staff member not found
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
 *       - Staff
 *     summary: Delete a Staff member
 *     description: Remove a Staff member from the café
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           description: The UUID of the Staff member
 *     responses:
 *       204:
 *         description: Staff deleted successfully
 *       400:
 *         description: The Staff member has cats in charge and can not be removed until they have none
 *       404:
 *         description: Staff not found
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
 * /api/staff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get all the staff members
 *     description: Retrieve all the staff
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of Staff
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *       - Staff
 *     summary: Add a new staff member
 *     description: Add a new staff member to the café
 *     security:
 *       - BearerAuth: []
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
 *               age:
 *                 type: integer
 *                 description: Age in years.
 *               dateJoined:
 *                 type: string
 *                 format: date-time
 *                 description: The date the staff member joined.
 *               role:
 *                 type: string
 *                 description: The staff member role.
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

router.get('/staff/:id', (req, res) => staffController.getStaff(req, res));
router.get('/staff', (req, res) => staffController.getAllStaff(req, res));
router.post('/staff', (req, res) => staffController.addStaff(req, res));
router.delete('/staff/:id', (req, res) => staffController.removeStaff(req, res));

export default router;