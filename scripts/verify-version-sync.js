const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const packageVersion = packageJson.version;

console.log(`Verifying all versions match ${packageVersion}...`);

let errors = [];

// Check src/version.ts
try {
  const versionFile = fs.readFileSync(
    path.join(__dirname, '../src/version.ts'),
    'utf-8'
  );
  if (!versionFile.includes(`export const VERSION = '${packageVersion}'`)) {
    errors.push('src/version.ts does not match package.json version');
  }
} catch (e) {
  errors.push('src/version.ts does not exist. Run npm run version:sync');
}

// Check documentation (if exists)
try {
  const docsIndex = fs.readFileSync(
    path.join(__dirname, '../docs/index.md'),
    'utf-8'
  );
  if (!docsIndex.includes(`Version: ${packageVersion}`)) {
    errors.push('docs/index.md does not match package.json version');
  }
} catch (e) {
  // Docs might not exist yet, skipping
}

if (errors.length > 0) {
  console.error('❌ Version sync errors found:');
  errors.forEach(err => console.error(`  - ${err}`));
  console.error('\nRun "npm run version:sync" to fix.');
  process.exit(1);
}

console.log('✅ All versions are in sync!');
