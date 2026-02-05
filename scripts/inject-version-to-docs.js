const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

// Inject version into TypeDoc config
try {
  const typedocConfigPath = path.join(__dirname, '../typedoc.json');
  if (fs.existsSync(typedocConfigPath)) {
    const typedocConfig = JSON.parse(fs.readFileSync(typedocConfigPath, 'utf-8'));
    typedocConfig.name = `Twelve Labs JavaScript SDK v${packageJson.version}`;
    fs.writeFileSync(typedocConfigPath, JSON.stringify(typedocConfig, null, 2));
  }
} catch (e) {
  console.warn('Could not update typedoc.json');
}

// Inject version into documentation header
try {
  const docsIndexPath = path.join(__dirname, '../docs/index.md');
  if (fs.existsSync(docsIndexPath)) {
    let docsContent = fs.readFileSync(docsIndexPath, 'utf-8');
    docsContent = docsContent.replace(
      /Version: .*/,
      `Version: ${packageJson.version}`
    );
    fs.writeFileSync(docsIndexPath, docsContent);
  }
} catch (e) {
  console.warn('Could not update docs/index.md');
}

// Update version badge in README
try {
  const readmePath = path.join(__dirname, '../README.md');
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    // Simple regex to update version badge if it follows a specific pattern
    // Adjust regex as needed based on actual README content
    readmeContent = readmeContent.replace(
      /version-[0-9]+\.[0-9]+\.[0-9]+-/,
      `version-${packageJson.version}-`
    );
    fs.writeFileSync(readmePath, readmeContent);
  }
} catch (e) {
  console.warn('Could not update README.md');
}
