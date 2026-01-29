import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SRC_DIRS = ["src"]; // search scope
const EXCLUDE_DIRS = new Set([
    "node_modules",
    "dist",
    "coverage",
    ".angular",
    ".nx",
    ".git",
    ".cache",
    ".turbo",
    ".vercel",
]);

const IGNORE_COMPONENT_PATHS = [
    // /\/generated\//,
    // /\/storybook\//,
];

function isExcludedDir(dirName) {
    return EXCLUDE_DIRS.has(dirName);
}

function shouldIgnore(filePath) {
    return IGNORE_COMPONENT_PATHS.some((re) => re.test(filePath));
}

function walk(dir) {
    const out = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const e of entries) {
        if (e.isDirectory()) {
            if (isExcludedDir(e.name)) continue;
            out.push(...walk(path.join(dir, e.name)));
        } else {
            out.push(path.join(dir, e.name));
        }
    }
    return out;
}

function norm(p) {
    return p.split(path.sep).join("/");
}

function exists(p) {
    try {
        fs.accessSync(p, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function findNearestTestsDir(componentDir) {
    // search up to src/ for __tests__ folders
    let cur = componentDir;
    while (cur && norm(cur).includes("/src/")) {
        const candidate = path.join(cur, "__tests__");
        if (exists(candidate) && fs.statSync(candidate).isDirectory()) return candidate;

        const parent = path.dirname(cur);
        if (parent === cur) break;
        cur = parent;
    }
    return null;
}

function main() {
    const files = SRC_DIRS.flatMap((d) => walk(path.join(ROOT, d)));

    const componentFiles = files.filter((f) => {
        const n = norm(f);
        if (!n.endsWith(".component.ts")) return false;
        if (n.endsWith(".spec.ts")) return false;
        if (n.endsWith(".d.ts")) return false;
        if (n.includes("/__tests__/")) return false;
        if (n.includes("/node_modules/")) return false;
        if (shouldIgnore(n)) return false;
        return true;
    });

    const missing = [];

    for (const compPath of componentFiles) {
        const compDir = path.dirname(compPath);
        const base = path.basename(compPath, ".ts"); // e.g. tutorial.component
        const expectedSpecName = `${base}.spec.ts`;

        // 1) spec next to component
        const neighborSpec = path.join(compDir, expectedSpecName);
        if (exists(neighborSpec)) continue;

        // 2) spec in nearest __tests__ dir up the tree
        const testsDir = findNearestTestsDir(compDir);
        if (testsDir) {
            const testSpec = path.join(testsDir, expectedSpecName);
            if (exists(testSpec)) continue;
        }

        // 3) fallback: allow spec anywhere under same feature folder (one-level up)
        // (Helps if you put __tests__ at feature root, not necessarily nearest.)
        const featureRoot = path.dirname(compDir);
        const featureFiles = walk(featureRoot).map(norm);
        const foundSomewhere =
            featureFiles.includes(norm(path.join(featureRoot, "__tests__", expectedSpecName))) ||
            featureFiles.includes(norm(path.join(featureRoot, expectedSpecName)));

        if (foundSomewhere) continue;

        missing.push(norm(compPath));
    }

    if (missing.length) {
        console.error(`❌ Missing spec files for ${missing.length} component(s):\n`);
        for (const m of missing) console.error(`- ${m}`);
        console.error(
            `\nExpected a matching ".spec.ts" either next to the component or in a "__tests__" folder near the feature.`
        );
        process.exit(1);
    }

    console.log(`✅ All components have matching spec files (${componentFiles.length} checked).`);
}

main();