import { Router } from "express";
import { rolesGuard } from "../../common/guards/roles.guard";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate, validateParams, validateQuery } from "../../common/middleware/validate";
import { UserRole } from "../enums/user-role.enum";
import { usersController } from "../controllers/users.controller";
import { listUsersQuerySchema } from "../dtos/list-users-query.dto";
import { updateUserRoleSchema, userParamsSchema } from "../dtos/user-admin.dto";

const adminRoutes = Router();

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, role, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *       403:
 *         description: Forbidden
 */
adminRoutes.get(
  "/users",
  rolesGuard(UserRole.ADMIN),
  validateQuery(listUsersQuerySchema),
  asyncHandler((req, res) => usersController.findAll(req, res)),
);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a user's role (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       403:
 *         description: Forbidden
 */
adminRoutes.patch(
  "/users/:id/role",
  rolesGuard(UserRole.ADMIN),
  validateParams(userParamsSchema),
  validate(updateUserRoleSchema),
  asyncHandler((req, res) => usersController.updateRole(req, res)),
);

export default adminRoutes;
