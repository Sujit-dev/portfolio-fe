const fs = require('fs');
const path = require('path');

const browserDir = path.join(__dirname, '../dist/portfolio-fe/browser');
const csrIndexPath = path.join(browserDir, 'index.csr.html');
const indexPath = path.join(browserDir, 'index.html');

// Check if index.csr.html exists
if (fs.existsSync(csrIndexPath)) {
  // Copy index.csr.html to index.html for Netlify
  fs.copyFileSync(csrIndexPath, indexPath);
  console.log('✓ Copied index.csr.html to index.html for Netlify');
} else {
  console.log('⚠ index.csr.html not found, skipping...');
}

// Ensure _redirects file exists in browser directory
const redirectsSource = path.join(__dirname, '../public/_redirects');
const redirectsDest = path.join(browserDir, '_redirects');

if (fs.existsSync(redirectsSource)) {
  fs.copyFileSync(redirectsSource, redirectsDest);
  console.log('✓ Copied _redirects file to browser directory');
} else {
  // Create _redirects if it doesn't exist
  fs.writeFileSync(redirectsDest, '/*    /index.html   200\n');
  console.log('✓ Created _redirects file in browser directory');
}

console.log('✓ Netlify build fix completed');

