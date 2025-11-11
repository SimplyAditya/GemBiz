
const http = require('http');

const ports = [4000, 4001, 4002, 4003, 4004];

const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/graphql',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 400) { // GraphQL might return 400 for GET requests without a query
        console.log(`Port ${port} is open`);
        resolve(true);
      } else {
        console.log(`Port ${port} returned status: ${res.statusCode}`);
        reject(false);
      }
    });

    req.on('error', (e) => {
      console.error(`Port ${port} is not responding: ${e.message}`);
      reject(false);
    });

    req.end();
  });
};

const checkAllPorts = async () => {
    console.log('Checking server status...');
    try {
      await Promise.all(ports.map(checkPort));
      console.log('All servers are running correctly.');
      // Exit with success code
    } catch (error) {
      console.error('Some servers are not running correctly.');
       // Exit with failure code
    }
  };
  
  checkAllPorts();
  
