import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type InviteEntry = {
	email: string;
	token: string;
	createdAt: string;
	note?: string;
};

type InviteFile = {
	invites: InviteEntry[];
};

const ROOT = process.cwd();
const INVITES_DIR = path.join(ROOT, "apps", "dashboard");
const INVITES_PATH = path.join(INVITES_DIR, "invites.json");

const ADJECTIVES = [
	"active",
	"bold",
	"brave",
	"calm",
	"clever",
	"curious",
	"eager",
	"gentle",
	"golden",
	"kind",
	"lively",
	"quiet",
	"rapid",
	"sharp",
	"silent",
	"smooth",
	"steady",
	"swift",
	"vivid",
	"warm",
];

const NOUNS = [
	"atlas",
	"bridge",
	"cluster",
	"context",
	"document",
	"graph",
	"map",
	"matrix",
	"memory",
	"network",
	"node",
	"path",
	"pattern",
	"signal",
	"story",
	"stream",
	"thread",
	"vector",
	"weave",
	"window",
];

function randomChoice<T>(values: T[]): T {
	return values[Math.floor(Math.random() * values.length)] as T;
}

function generateToken(existing: Set<string>): string {
	for (let i = 0; i < 10_000; i++) {
		const parts = [
			randomChoice(ADJECTIVES),
			randomChoice(ADJECTIVES),
			randomChoice(NOUNS),
		];
		const candidate = parts.join("-");
		if (!existing.has(candidate)) {
			return candidate;
		}
	}

	// Extremely unlikely fallback with numeric suffix
	for (let i = 0; i < 100_000; i++) {
		const parts = [
			randomChoice(ADJECTIVES),
			randomChoice(ADJECTIVES),
			randomChoice(NOUNS),
			String(Math.floor(Math.random() * 10_000)),
		];
		const candidate = parts.join("-");
		if (!existing.has(candidate)) {
			return candidate;
		}
	}

	throw new Error("Failed to generate a unique invite token");
}

async function loadInvites(): Promise<InviteFile> {
	try {
		const raw = await readFile(INVITES_PATH, "utf8");
		const parsed = JSON.parse(raw) as unknown;
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			Array.isArray((parsed as InviteFile).invites)
		) {
			return parsed as InviteFile;
		}
	} catch {
		// If the file doesn't exist or is invalid, fall through and return a fresh structure
	}

	return { invites: [] };
}

async function saveInvites(data: InviteFile) {
	await mkdir(INVITES_DIR, { recursive: true });
	await writeFile(INVITES_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function parseArgs(argv: string[]) {
	const emails: string[] = [];
	let note: string | undefined;
	let dryRun = false;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!;
		if (arg === "--note" || arg === "-n") {
			note = argv[i + 1];
			i++;
			continue;
		}
		if (arg === "--dry-run") {
			dryRun = true;
			continue;
		}
		if (arg.startsWith("-")) {
			// Unknown flag – ignore for now
			continue;
		}
		emails.push(arg);
	}

	return { emails, note, dryRun };
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function printUsage() {
	// eslint-disable-next-line no-console
	console.log(
		[
			"Usage: pnpm ts-node scripts/generate-invite-tokens.ts <email> [more-emails...] [--note \"optional note\"] [--dry-run]",
			"",
			"Examples:",
			"  pnpm ts-node scripts/generate-invite-tokens.ts alice@example.com",
			"  pnpm ts-node scripts/generate-invite-tokens.ts alice@example.com bob@example.com --note \"beta cohort\"",
			"  pnpm ts-node scripts/generate-invite-tokens.ts alice@example.com --dry-run",
		].join("\n"),
	);
}

async function main() {
	const { emails, note, dryRun } = parseArgs(process.argv.slice(2));

	if (emails.length === 0) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	const normalizedEmails = emails.map(normalizeEmail).filter(Boolean);
	const uniqueEmails = Array.from(new Set(normalizedEmails));

	if (uniqueEmails.length === 0) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	const store = await loadInvites();
	const existingTokens = new Set(store.invites.map((entry) => entry.token));
	const now = new Date().toISOString();

	const created: InviteEntry[] = [];
	const reused: InviteEntry[] = [];

	for (const email of uniqueEmails) {
		const existingForEmail = store.invites.find(
			(entry) => normalizeEmail(entry.email) === email,
		);

		if (existingForEmail) {
			reused.push(existingForEmail);
			continue;
		}

		const token = generateToken(existingTokens);
		existingTokens.add(token);

		const entry: InviteEntry = {
			email,
			token,
			createdAt: now,
			note,
		};

		store.invites.push(entry);
		created.push(entry);
	}

	if (!dryRun && created.length > 0) {
		await saveInvites(store);
	}

	// eslint-disable-next-line no-console
	console.log(`Invite storage: ${INVITES_PATH}`);

	if (created.length > 0) {
		// eslint-disable-next-line no-console
		console.log("");
		// eslint-disable-next-line no-console
		console.log(dryRun ? "Planned new invites (dry run):" : "Created new invites:");
		for (const entry of created) {
			// eslint-disable-next-line no-console
			console.log(`  ${entry.email}  ->  ${entry.token}`);
		}
	}

	if (reused.length > 0) {
		// eslint-disable-next-line no-console
		console.log("");
		// eslint-disable-next-line no-console
		console.log("Existing invites (left unchanged):");
		for (const entry of reused) {
			// eslint-disable-next-line no-console
			console.log(`  ${entry.email}  ->  ${entry.token}`);
		}
	}

	if (created.length === 0 && reused.length === 0) {
		// eslint-disable-next-line no-console
		console.log("No emails provided – nothing to do.");
	}
}

main().catch((error) => {
	// eslint-disable-next-line no-console
	console.error("Failed to generate invite tokens:", error);
	process.exitCode = 1;
});


