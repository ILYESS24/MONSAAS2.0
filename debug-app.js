const http = require('http');

console.log('🔍 Testing application on localhost:5173...');

const req = http.get('http://localhost:5173', (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Response length: ${data.length} characters`);
    console.log('First 500 characters:');
    console.log(data.substring(0, 500));
    console.log('\n=== END DEBUG ===');
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.setTimeout(5000, () => {
  console.error('Timeout after 5 seconds');
  req.destroy();
});
