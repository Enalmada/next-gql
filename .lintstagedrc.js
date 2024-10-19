import path from "node:path";

const tsc = () => "bun --bun tsc --noEmit";

const buildLintCommand = (filenames) => "biome check --fix --unsafe";

export default {
	"**/*.{ts,tsx,mjs,cjs}": [buildLintCommand],
	"**/*.{ts,tsx}": [tsc],
	// './package.json': ['npm pkg fix', 'fixpack'],
};
