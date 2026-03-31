import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import "dotenv/config";
import { agentsRoutes } from "./routes/agents.js";
import { paymentsRoutes } from "./routes/payments.js";
import { invoicesRoutes } from "./routes/invoices.js";
import { splitsRoutes } from "./routes/splits.js";
import { oracleRoutes } from "./routes/oracle.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimit } from "./middleware/rateLimit.js";

const app = new Hono();

app.use(
	"*",
	cors({
		origin: [
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			process.env.FRONTEND_URL || "",
		].filter(Boolean),
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);
app.use("*", rateLimit);
app.onError(errorHandler);

app.get("/api/health", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/api/agents", agentsRoutes);
app.route("/api/payments", paymentsRoutes);
app.route("/api/invoices", invoicesRoutes);
app.route("/api/splits", splitsRoutes);
app.route("/api/oracle", oracleRoutes);

const port = parseInt(process.env.API_PORT || "3001");

serve({ fetch: app.fetch, port }, () => {
	console.log(`AgentPay API running on http://localhost:${port}`);
});
