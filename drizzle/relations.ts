import { relations } from "drizzle-orm/relations";
import { investors, contributionsOrWithdrawals, investments, users, accounts, sessions, twoFactorConfirmations, permissions, userInvestorLinks } from "./schema";

export const contributionsOrWithdrawalsRelations = relations(contributionsOrWithdrawals, ({one}) => ({
	investor: one(investors, {
		fields: [contributionsOrWithdrawals.investorId],
		references: [investors.id]
	}),
}));

export const investorsRelations = relations(investors, ({many}) => ({
	contributionsOrWithdrawals: many(contributionsOrWithdrawals),
	investments: many(investments),
	userInvestorLinks: many(userInvestorLinks),
}));

export const investmentsRelations = relations(investments, ({one}) => ({
	investor: one(investors, {
		fields: [investments.investorId],
		references: [investors.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	twoFactorConfirmations: many(twoFactorConfirmations),
	permissions: many(permissions),
	userInvestorLinks: many(userInvestorLinks),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const twoFactorConfirmationsRelations = relations(twoFactorConfirmations, ({one}) => ({
	user: one(users, {
		fields: [twoFactorConfirmations.userId],
		references: [users.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({one}) => ({
	user: one(users, {
		fields: [permissions.email],
		references: [users.email]
	}),
}));

export const userInvestorLinksRelations = relations(userInvestorLinks, ({one}) => ({
	user: one(users, {
		fields: [userInvestorLinks.userId],
		references: [users.id]
	}),
	investor: one(investors, {
		fields: [userInvestorLinks.investorId],
		references: [investors.id]
	}),
}));