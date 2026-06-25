import { Router } from "express";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate, validateParams, validateQuery } from "../../common/middleware/validate";
import { projectController } from "../controllers/project.controller";
import { createProjectSchema } from "../dtos/create-project.dto";
import { listProjectsQuerySchema } from "../dtos/list-projects-query.dto";
import { projectParamsSchema } from "../dtos/project-params.dto";
import { updateProjectSchema } from "../dtos/update-project.dto";

const projectRoutes = Router();

/**
 * @openapi
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 */
projectRoutes.post(
  "/",
  validate(createProjectSchema),
  asyncHandler((req, res) => projectController.create(req, res)),
);

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: List my projects
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
 *           enum: [title, status]
 *           default: title
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
 *               $ref: '#/components/schemas/PaginatedProjectsResponse'
 */
projectRoutes.get(
  "/",
  validateQuery(listProjectsQuerySchema),
  asyncHandler((req, res) => projectController.findAll(req, res)),
);

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 */
projectRoutes.get(
  "/:id",
  validateParams(projectParamsSchema),
  asyncHandler((req, res) => projectController.findOne(req, res)),
);

/**
 * @openapi
 * /projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project
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
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 */
projectRoutes.patch(
  "/:id",
  validateParams(projectParamsSchema),
  validate(updateProjectSchema),
  asyncHandler((req, res) => projectController.update(req, res)),
);

/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted
 */
projectRoutes.delete(
  "/:id",
  validateParams(projectParamsSchema),
  asyncHandler((req, res) => projectController.delete(req, res)),
);

export default projectRoutes;
