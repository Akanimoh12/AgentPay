import {
	pgTable,
	serial,
	integer,
	text,
	boolean,
	timestamp,
	jsonb,
} from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
	id: serial("id").primaryKey(),
	agentId: text("agent_id").unique().notNull(),
	wallet: text("wallet").notNull(),
	name: text("name").notNull(),
	services: jsonb("services").$type<string[]>().default([]),
	active: boolean("active").default(true),
	registeredAt: timestamp("registered_at").defaultNow(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
	id: serial("id").primaryKey(),
	type: text("type").notNull(),
	fromAgentId: text("from_agent_id").notNull(),
	toAgentId: text("to_agent_id").notNull(),
	token: text("token").notNull(),
	amount: text("amount").notNull(),
	fee: text("fee"),
	txHash: text("tx_hash"),
	status: text("status").default("pending"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const escrows = pgTable("escrows", {
	id: serial("id").primaryKey(),
	escrowId: text("escrow_id").unique().notNull(),
	payerAgentId: text("payer_agent_id").notNull(),
	payeeAgentId: text("payee_agent_id").notNull(),
	token: text("token").notNull(),
	amount: text("amount").notNull(),
	jobId: text("job_id"),
	deadline: timestamp("deadline"),
	status: text("status").default("active"),
	txHash: text("tx_hash"),
	createdAt: timestamp("created_at").defaultNow(),
	settledAt: timestamp("settled_at"),
});

export const invoices = pgTable("invoices", {
	id: serial("id").primaryKey(),
	invoiceId: text("invoice_id").unique().notNull(),
	fromAgentId: text("from_agent_id"),
	toAgentId: text("to_agent_id"),
	amount: text("amount"),
	description: text("description"),
	storageKey: text("storage_key"),
	status: text("status").default("draft"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const oraclePrices = pgTable("oracle_prices", {
	id: serial("id").primaryKey(),
	serviceType: text("service_type").notNull(),
	floor: text("floor"),
	suggested: text("suggested"),
	ceiling: text("ceiling"),
	queriedAt: timestamp("queried_at").defaultNow(),
});

export const splits = pgTable("splits", {
	id: serial("id").primaryKey(),
	splitId: text("split_id").unique().notNull(),
	ownerAgentId: text("owner_agent_id").notNull(),
	recipients: jsonb("recipients").$type<{ wallet: string; shareBps: number }[]>().default([]),
	totalRecipients: integer("total_recipients").default(0),
	status: text("status").default("active"),
	txHash: text("tx_hash"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const distributions = pgTable("distributions", {
	id: serial("id").primaryKey(),
	splitId: text("split_id").notNull(),
	token: text("token").notNull(),
	amount: text("amount").notNull(),
	txHash: text("tx_hash"),
	createdAt: timestamp("created_at").defaultNow(),
});
