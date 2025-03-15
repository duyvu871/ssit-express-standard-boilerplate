import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
	entry: ["./src/**/*"],
	format: ["esm", "cjs"],
	clean: true, // clean the dist folder before bundling
	bundle: true, // bundle all dependencies, except "devDependencies"
	tsconfig: "./tsconfig.json",
	platform: 'node',
	watch: "./src/**/*",
	...options,
}));