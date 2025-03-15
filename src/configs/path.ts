import * as path from 'node:path';
import * as process from 'node:process';

const workerPath = path.join(process.cwd(), 'dist/workers');
const storagePath = path.join(process.cwd(), 'storage');
const staticPath = path.join(process.cwd(), 'storage/statics');
const assetPath = path.join(process.cwd(), 'storage/assets');

export {
	workerPath,
	storagePath,
	staticPath,
	assetPath
}