const http = require('http')
const express = require('./express')
const server = http.createServer(express) 
const { Pool } = require('mongoose');
const router = express.Router();

const pool = new Pool({
  DATABASE_URL: 'mongodb+srv://loft-systems:10LoftSchool@cluster0.fji0e.mongodb.net/loft-systems?retryWrites=true&w=majority',
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

router.get('/database', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM test_table');
    const results = { 'results': (result) ? result.rows : null};
    res.render('pages/database', results );
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})

require('./socket/socket')(server) 
require('./database/connect');

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});