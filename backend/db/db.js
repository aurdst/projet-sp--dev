const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// >> Démmarage de notre BDD << //
const db_name = path.join(__dirname, "../data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'apptest.db'");
});

module.exports = db;