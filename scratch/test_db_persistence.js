const http = require('http');

http.get('http://localhost:5000/api/health/db-test', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
  });
}).on('error', (err) => {
  console.error('HTTP Error:', err.message);
});
