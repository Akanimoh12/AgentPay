import { Hono } from "hono";
import { z } from "zod";
import { agentService } from "../services/AgentService.js";

const RegisterSchema = z.object({
	agentId: z.string().min(1),
	name: z.string().min(1),
	services: z.array(z.string()),
});

const UpdateServicesSchema = z.object({
	services: z.array(z.string()),
});

export const agentsRoutes = new Hono();

agentsRoutes.post("/", async (c) => {
	const body = await c.req.json();
	const parsed = RegisterSchema.parse(body);
	const result = await agentService.register(parsed);
	return c.json(result, 201);
});

agentsRoutes.get("/", async (c) => {
	const active = c.req.query("active");
	const service = c.req.query("service");
	const result = await agentService.getAll({
		active: active !== undefined ? active === "true" : undefined,
		service: service || undefined,
	});
	return c.json(result);
});

agentsRoutes.get("/:agentId", async (c) => {
	const agentId = c.req.param("agentId");
	const result = await agentService.getById(agentId);
	if (!result) return c.json({ error: { code: 404, message: "Agent not found" } }, 404);
	return c.json(result);
});

agentsRoutes.patch("/:agentId/services", async (c) => {
	const agentId = c.req.param("agentId");
	const body = await c.req.json();
	const parsed = UpdateServicesSchema.parse(body);
	const result = await agentService.updateServices(agentId, parsed.services);
	return c.json(result);
});
