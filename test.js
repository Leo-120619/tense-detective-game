const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
console.log(content.indexOf('logo-quiz-stage'));
