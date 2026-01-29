import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const appVersion = packageJson.version;

console.log(`🚀 Updating application version to ${appVersion}...`);

const environmentFiles = [
    '../src/environments/environment.ts',
    '../src/environments/environment.prod.ts'
];

environmentFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        const versionRegex = /version:\s*['"](.*)['"]/;

        if (versionRegex.test(content)) {
            const newContent = content.replace(versionRegex, `version: '${appVersion}'`);
            fs.writeFileSync(fullPath, newContent);
            console.log(`✅ Updated ${filePath}`);
        } else {
            console.warn(`⚠️ Could not find version key in ${filePath}`);
        }
    } else {
        console.warn(`❌ File not found: ${filePath}`);
    }
});