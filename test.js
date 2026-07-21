// Minimal smoke test - just enough to give Jenkins a real "test" stage to execute.
// This intentionally has no test framework dependency, so `npm install` stays fast.

const assert = require('assert');

function testAppFileExists() {
  const fs = require('fs');
  assert.ok(fs.existsSync('./app.js'), 'app.js should exist');
  console.log('PASS: app.js exists');
}

function testPackageJsonValid() {
  const pkg = require('./package.json');
  assert.strictEqual(pkg.name, 'jenkins-argocd-app', 'package name should match');
  console.log('PASS: package.json is valid');
}

try {
  testAppFileExists();
  testPackageJsonValid();
  console.log('\nAll tests passed.');
  process.exit(0);
} catch (err) {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
}
