const fs = require('fs');
const csv = require('csv-parser');
const mdbclient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const config = require('./config');

const chunk = 100;
const limit = 10000000;
let curr = 0;
let results = [];
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
      col.createIndex({ Title: 1, Creator: 1, Publisher: 1 })
      let stream = fs.createReadStream('./checkouts-by-title.csv')
        .pipe(csv())
        .on('data', (data) => {
          if (curr >= limit) {
            console.log('end');
            stream.end();
            return
          }
          results.push(data)
          curr++;
          if (curr % chunk === 0) {
            if (results)
              col.insertMany([...results], (err, res) => {
                if (err) {
                  console.error(err);
                }
              });
            results = [];
          }

        })
        .on('end', () => {
          if (results)
            col.insertMany(results, (err, res) => {
              if (err) {
                console.error(err);
              }
            });
        });
    });
});