const http = require('http')
const express = require('./express')
const server = http.createServer(express) 

require('./socket/socket')(server) 
require('./database/connect');

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});