const fs = require('fs');
const mdbclient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const config = require('./config');
const { exec } = require('child_process');

// connect to the server
mdbclient.connect(url, {
  useNewUrlParser: true
}, (err, conn) => {

  //create databse
  var db = conn.db(config.db);

  // create collection
  db.createCollection(
    config.collection,
    (err, col) => {
      if (err) {
        conn.close();
        return console.error(err);
      }
      col.createIndex({ Title: "text" });
      col.createIndex({ Creator: 1 });
      col.createIndex({ Publisher: 1 });
      exec(`mongoimport --db ${config.db} --collection ${config.collection} --parseGrace skipRow --file import.csv --headerline`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log("finished!");
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
    });
});