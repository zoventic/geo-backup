const fs = require('fs');
const content = fs.readFileSync('index.tailwind-perfect.backup.html', 'utf8');

console.log('Total characters:', content.length);
console.log('Has tailwind:', content.includes('cdn.tailwindcss.com'));
console.log('Has Lucide:', content.includes('lucide'));
console.log('Has Chart.js:', content.includes('chart.js'));

// Check title
const titleMatch = content.match(/<title>([^<]+)<\/title>/);
console.log('Title:', titleMatch ? titleMatch[1] : 'none');
