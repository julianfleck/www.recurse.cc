// Central configuration for available models
// Parsing models can be extended here. Values should be unique identifiers.
export const PARSING_MODELS = [
	{ value: "gpt-4o-mini", label: "GPT-4o Mini" },
	{ value: "gpt-4o", label: "GPT-4o" },
	{ value: "claude-3.7-sonnet", label: "Claude 3.7 Sonnet" },
	{ value: "mistral-large", label: "Mistral Large" },
	{ value: "mixtral-8x7b-instruct", label: "Mixtral 8x7B Instruct" },
];

// Currently supported embedding model (display-only for now)
export const EMBEDDING_MODEL = {
	value: "e5-mistral-7b-instruct",
	label: "E5-mistral-7b-instruct",
};

export type ModelOption = (typeof PARSING_MODELS)[number];
