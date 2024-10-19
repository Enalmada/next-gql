const tsc = () => "bun --bun tsc --noEmit";

export default {
	"**/*.{js,jsx,ts,tsx,json,yaml,yml,md,css,scss}": () =>
		"biome check --fix --unsafe",
	"**/*.{ts,tsx}": [tsc],
	// './package.json': ['npm pkg fix', 'fixpack'],
};
