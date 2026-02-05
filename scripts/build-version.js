const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const versionFile = `
/** 
 * SDK Version - Auto-generated, do not edit manually
 * Generated from package.json during build
 */
export const VERSION = '${packageJson.version}';
export const API_VERSION = 'v1.3';
export const USER_AGENT = \`twelvelabs-js-sdk/\${VERSION}\`;
`.trim();

fs.writeFileSync(
  path.join(__dirname, '../src/version.ts'),
  versionFile
);

console.log(`Generated src/version.ts with version ${packageJson.version}`);
