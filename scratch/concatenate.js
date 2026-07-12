const fs = require('fs');
const path = require('path');

const files = [
  'server/index.js',
  'server/data/faqDatabase.js',
  'server/data/stadiumData.js',
  'server/engines/alertEngine.js',
  'server/engines/crowdEngine.js',
  'server/engines/routingEngine.js',
  'server/routes/alert.js',
  'server/routes/assist.js',
  'server/routes/navigate.js',
  'server/routes/translate.js',
  'server/services/gemini.js',
  'server/utils/AppError.js',
  'server/utils/constants.js',
  'server/utils/logger.js',
  'server/utils/validators.js',
  'public/js/app.js',
  'public/js/fan.js',
  'public/js/staff.js',
  'public/js/volunteer.js',
  'public/js/init.js',
  'public/css/style.css',
  'tests/alert.test.js',
  'tests/assist.test.js',
  'tests/navigate.test.js',
  'tests/translate.test.js',
  'tests/utils.test.js',
  'Dockerfile',
  'cloudbuild.yaml',
  'package.json',
  'vercel.json'
];

const outputFile = path.join(__dirname, '..', 'stadium_saathi_complete_code.txt');

let content = '';

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    content += '='.repeat(80) + '\n';
    content += `FILE: ${file}\n`;
    content += '='.repeat(80) + '\n';
    content += fs.readFileSync(filePath, 'utf8') + '\n\n\n';
  } else {
    console.log(`Warning: File not found: ${file}`);
  }
}

fs.writeFileSync(outputFile, content, 'utf8');
console.log(`Success: Wrote complete codebase to ${outputFile}`);
