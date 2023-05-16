const config = require("./config");
function connection() {
  try {
    const mysql = require('mysql2');    
    const pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      //timezone: 'utc',
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0
    });
    const promisePool = pool.promise();
    return promisePool;
  } catch (error) {
    return console.log(`Could not connect - ${error}`);
  }
}

const pool = connection();

module.exports = {
  connection: async () => pool.getConnection(),
  query: async (...params) => pool.query(...params),
  execute: (...params) => pool.execute(...params)
};