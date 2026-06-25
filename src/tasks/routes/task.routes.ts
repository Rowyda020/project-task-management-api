import { Router } from "express";
import { asyncHandler } from "../../common/middleware/async-handler";
import { validate, validateParams, validateQuery } from "../../common/middleware/validate";
import { taskController } from "../controllers/task.controller";
import { createTaskSchema } from "../dtos/create-task.dto";
import {
  listTasksQuerySchema,
  taskParamsSchema,
  taskProjectParamsSchema,
} from "../dtos/task-params.dto";
import { updateTaskSchema } from "../dtos/update-task.dto";

const taskRoutes = Router({ mergeParams: true });

/**
 * @openapi
 * /projects/{projectId}/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task under a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 */
taskRoutes.post(
  "/",
  validateParams(taskProjectParamsSchema),
  validate(createTaskSchema),
  asyncHandler((req, res) => taskController.create(req, res)),
);

/**
 * @openapi
 * /projects/{projectId}/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks for a project
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in progress, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
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
 *           enum: [title, status, priority, dueDate]
 *           default: dueDate
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
 *               $ref: '#/components/schemas/PaginatedTasksResponse'
 */
taskRoutes.get(
  "/",
  validateParams(taskProjectParamsSchema),
  validateQuery(listTasksQuerySchema),
  asyncHandler((req, res) => taskController.findAll(req, res)),
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 */
taskRoutes.get(
  "/:taskId",
  validateParams(taskParamsSchema),
  asyncHandler((req, res) => taskController.findOne(req, res)),
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 */
taskRoutes.patch(
  "/:taskId",
  validateParams(taskParamsSchema),
  validate(updateTaskSchema),
  asyncHandler((req, res) => taskController.update(req, res)),
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted
 */
taskRoutes.delete(
  "/:taskId",
  validateParams(taskParamsSchema),
  asyncHandler((req, res) => taskController.delete(req, res)),
);

export default taskRoutes;
