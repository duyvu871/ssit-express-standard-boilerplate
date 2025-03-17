import { defineConfig, type Options } from "tsup";
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';
import glob from 'glob';

export default defineConfig((options: Options) => ({
	entry: ["./src/server.ts"],
	// entry: ["./src/**/*.{js,jsx,ts,tsx}"],
	// Mark problematic packages as external
	external: [
		'@mapbox/node-pre-gyp',
		'aws-sdk',
		'mock-aws-s3',
		'nock',
		'@jsdevtools/ono'
	],
	noExternal: [/^(?!(@mapbox\/node-pre-gyp|aws-sdk|mock-aws-s3|nock|@jsdevtools\/ono)$).*/],
	exclude: ["**/*.handlebars", "**/*.html"],
	format: ["esm", "cjs"],
	clean: true, // clean the dist folder before bundling
	// bundle: true, // bundle all dependencies, except "devDependencies"
	tsconfig: "./tsconfig.json",
	platform: 'node',
	// watch: "./src/**/*",
	...options,
	onSuccess: async () => {
		// Copy handlebars templates
		const templateFiles = glob.sync('src/views/**/*.handlebars');
		for (const file of templateFiles) {
			const destPath = file.replace('src/', 'dist/');
			await mkdir(join(process.cwd(), destPath, '..'), { recursive: true });
			await copyFile(file, destPath);
		}

		// Copy package.json to dist directory for bcrypt
		await copyFile('package.json', 'dist/package.json');
	},
}));