import express from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./auth/routes/auth.routes";
import { errorFilter } from "./common/filters/error.filter";
import { requireAuthUnlessPublic } from "./common/guards/auth.guard";
import { swaggerSpec } from "./config/swagger";

export const app = express();

app.use(express.json());
app.use(requireAuthUnlessPublic);

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     description: Returns the current health status of the API.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);

if (process.env.SWAGGER_ENABLED !== "false") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(errorFilter);
