import { Hono } from "hono";
import { z } from "zod";
import { paymentService } from "../services/PaymentService.js";

const DirectPaySchema = z.object({
	fromAgentId: z.string().min(1),
	toAgentId: z.string().min(1),
	token: z.string().min(1),
	amount: z.string().min(1),
});

const CreateEscrowSchema = z.object({
	payerAgentId: z.string().min(1),
	payeeAgentId: z.string().min(1),
	token: z.string().min(1),
	amount: z.string().min(1),
	jobId: z.string().min(1),
	deadline: z.string().min(1),
});

export const paymentsRoutes = new Hono();

paymentsRoutes.post("/direct", async (c) => {
	const body = await c.req.json();
	const parsed = DirectPaySchema.parse(body);
	const result = await paymentService.payDirect(parsed);
	return c.json(result, 201);
});

paymentsRoutes.post("/escrow", async (c) => {
	const body = await c.req.json();
	const parsed = CreateEscrowSchema.parse(body);
	const result = await paymentService.createEscrow(parsed);
	return c.json(result, 201);
});

paymentsRoutes.post("/escrow/:escrowId/release", async (c) => {
	const escrowId = c.req.param("escrowId");
	const result = await paymentService.releaseEscrow(escrowId);
	return c.json(result);
});

paymentsRoutes.get("/escrow/:escrowId", async (c) => {
	const escrowId = c.req.param("escrowId");
	const result = await paymentService.getEscrow(escrowId);
	if (!result) return c.json({ error: { code: 404, message: "Escrow not found" } }, 404);
	return c.json(result);
});

paymentsRoutes.post("/escrow/:escrowId/cancel", async (c) => {
	const escrowId = c.req.param("escrowId");
	const result = await paymentService.cancelEscrow(escrowId);
	return c.json(result);
});

paymentsRoutes.get("/", async (c) => {
	const result = await paymentService.getPayments({
		agentId: c.req.query("agentId"),
		type: c.req.query("type"),
		status: c.req.query("status"),
		limit: c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined,
		offset: c.req.query("offset") ? parseInt(c.req.query("offset")!) : undefined,
	});
	return c.json(result);
});

paymentsRoutes.get("/:id", async (c) => {
	const id = parseInt(c.req.param("id"));
	if (isNaN(id)) return c.json({ error: { code: 400, message: "Invalid ID" } }, 400);
	const result = await paymentService.getById(id);
	if (!result) return c.json({ error: { code: 404, message: "Payment not found" } }, 404);
	return c.json(result);
});
