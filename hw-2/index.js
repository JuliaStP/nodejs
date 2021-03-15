const http = require('http');

const timeout = process.env.TM || 1000;
const interval = process.env.INT || 100;

http.createServer((req, res) => {
  if (req.url === '/') {
    console.log('Started Time: ' + timeout + ', Interval:' + interval);

    let timerOn = true;

    setTimeout(() => {
      timerOn = false;
    }, timeout);

    const timer = setInterval(() => {
      if (timerOn) {
        console.log(Date());
      } else {
        clearTimeout(timer);
        console.log('Finished');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>' + Date() + '</h1>');
      }
    }, interval);
  }
}).listen(5500);