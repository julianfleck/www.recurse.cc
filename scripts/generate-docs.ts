import { generateFiles } from "fumadocs-openapi";

void generateFiles({
	// Importing '@/lib/openapi' pulls in 'fumadocs-openapi/server',
	// which can fail under tsx. Use the URL directly for generation.
	input: ["http://localhost:8000/openapi.json"],
	output: "./content/docs/api",
	includeDescription: true,
});
