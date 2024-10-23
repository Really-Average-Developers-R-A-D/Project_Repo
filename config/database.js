const { Pool } = require('pg');

const pool = new Pool({
  user: 'ENTER-USER',
  host: 'localhost',
  database: 'ENTER-DATABASE',
  password: 'ENTER-PASSWORD',
  port: 5432,
});

module.exports = pool;