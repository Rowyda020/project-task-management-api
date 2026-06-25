import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const port = process.env.PORT || "3000";

const apiPattern = (rel: string) =>
  path.join(__dirname, rel).split(path.sep).join("/");

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project & Task Management API",
      version: "1.0.0",
      description:
        "Use **Try it out** on an endpoint — the Server response section shows the actual status and body from your request.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 2, example: "Jane Doe" },
            email: { type: "string", format: "email", example: "jane@example.com" },
            password: { type: "string", minLength: 8, example: "password123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "jane@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", format: "email", example: "jane@example.com" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateProjectRequest: {
          type: "object",
          required: ["title", "description", "status"],
          properties: {
            title: { type: "string", maxLength: 255, example: "Website Redesign" },
            description: { type: "string", example: "Rebuild the company website" },
            status: {
              type: "string",
              enum: ["in progress", "completed", "cancelled"],
              example: "in progress",
            },
          },
        },
        UpdateProjectRequest: {
          type: "object",
          minProperties: 1,
          properties: {
            title: { type: "string", maxLength: 255, example: "Website Redesign v2" },
            description: { type: "string", example: "Updated project scope" },
            status: {
              type: "string",
              enum: ["in progress", "completed", "cancelled"],
              example: "completed",
            },
          },
        },
        ProjectResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "Website Redesign" },
            description: { type: "string", example: "Rebuild the company website" },
            status: {
              type: "string",
              enum: ["in progress", "completed", "cancelled"],
              example: "in progress",
            },
          },
        },
        CreateTaskRequest: {
          type: "object",
          required: ["title", "description", "status", "priority", "dueDate"],
          properties: {
            title: { type: "string", maxLength: 255, example: "Design homepage" },
            description: { type: "string", example: "Create wireframes and mockups" },
            status: {
              type: "string",
              enum: ["pending", "in progress", "done"],
              example: "pending",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              example: "high",
            },
            dueDate: { type: "string", format: "date-time", example: "2026-12-31T00:00:00.000Z" },
          },
        },
        UpdateTaskRequest: {
          type: "object",
          minProperties: 1,
          properties: {
            title: { type: "string", maxLength: 255, example: "Design homepage v2" },
            description: { type: "string", example: "Updated scope" },
            status: {
              type: "string",
              enum: ["pending", "in progress", "done"],
              example: "in progress",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              example: "medium",
            },
            dueDate: { type: "string", format: "date-time", example: "2026-12-31T00:00:00.000Z" },
          },
        },
        TaskResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "Design homepage" },
            description: { type: "string", example: "Create wireframes and mockups" },
            status: {
              type: "string",
              enum: ["pending", "in progress", "done"],
              example: "pending",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              example: "high",
            },
            dueDate: { type: "string", format: "date-time", example: "2026-12-31T00:00:00.000Z" },
          },
        },
      },
    },
  },
  apis: [apiPattern("../**/*.ts"), apiPattern("../**/*.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
