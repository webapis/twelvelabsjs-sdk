const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

console.log(`Syncing all versions to ${packageJson.version}...`);

// 1. Update src/version.ts
require('./build-version');

// 2. Update documentation
require('./inject-version-to-docs');

// 3. Update CodeSandbox examples
require('./update-codesandbox-versions');

// 4. Update CHANGELOG.md header
try {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  if (fs.existsSync(changelogPath)) {
    let changelog = fs.readFileSync(changelogPath, 'utf-8');
    const today = new Date().toISOString().split('T')[0];

    if (!changelog.includes(`## [${packageJson.version}]`)) {
      const newEntry = `## [${packageJson.version}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n`;
      changelog = changelog.replace('# Changelog\n\n', `# Changelog\n\n${newEntry}`);
      fs.writeFileSync(changelogPath, changelog);
    }
  }
} catch (e) {
  console.warn('Could not update CHANGELOG.md');
}

// 5. Update test metadata
try {
  const testMetadataPath = path.join(__dirname, '../tests/metadata.json');
  const testMetadata = {
    version: packageJson.version,
    lastUpdated: new Date().toISOString(),
    apiVersion: 'v1.3'
  };
  // Ensure directory exists
  const testsDir = path.dirname(testMetadataPath);
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }
  fs.writeFileSync(testMetadataPath, JSON.stringify(testMetadata, null, 2));
} catch (e) {
  console.warn('Could not update tests/metadata.json');
}

console.log('✅ All versions synchronized!');
console.log(`   Code version: ${packageJson.version}`);
console.log(`   API version: v1.3`);
