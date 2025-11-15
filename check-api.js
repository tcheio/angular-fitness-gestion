const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`API is reachable. Status code: ${res.statusCode}`);
  if (res.statusCode >= 200 && res.statusCode < 400) {
    process.exit(0);
  } else {
    console.error('API returned an error status code.');
    process.exit(1);
  }
});

req.on('error', error => {
  console.error('Error reaching the API:');
  console.error(error.message);
  console.error('Please make sure the API server is running on http://localhost:3001');
  console.error('You can start it by running "npm run serve:api"');
  process.exit(1);
});

req.end();
