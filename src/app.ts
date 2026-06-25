import express from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./auth/routes/auth.routes";
import projectRoutes from "./projects/routes/project.routes";
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
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);

app.use("/projects", projectRoutes);

if (process.env.SWAGGER_ENABLED !== "false") {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        docExpansion: "list",
        defaultModelsExpandDepth: -1,
        persistAuthorization: true,
      },
    }),
  );
}

app.use(errorFilter);
