const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'stadium_saathi_complete_code.txt');

const ignoredDirs = ['node_modules', '.git', 'stitch_liquid_glass_fanconnect', 'scratch'];
const ignoredFiles = ['package-lock.json', 'dompurify.min.js', 'stadium_saathi_complete_code.txt'];
const allowedExtensions = ['.js', '.html', '.css', '.yaml', '.json', '.md'];

let outputContent = '';

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(rootDir, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoredDirs.includes(file)) {
        traverse(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (allowedExtensions.includes(ext) && !ignoredFiles.includes(file)) {
        console.log(`Processing: ${relativePath}`);
        const content = fs.readFileSync(fullPath, 'utf8');
        outputContent += `========================================================================\n`;
        outputContent += `FILE: ${relativePath}\n`;
        outputContent += `========================================================================\n\n`;
        outputContent += content;
        outputContent += `\n\n`;
      }
    }
  }
}

traverse(rootDir);
fs.writeFileSync(outputFile, outputContent, 'utf8');
console.log(`Successfully generated: ${outputFile}`);
