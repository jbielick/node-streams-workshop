#!/usr/bin/env node

var args = process.argv.slice(2);
var inputFile = args[1];
var inputStream = inputFile ? fs.createReadStream(inputFile) : process.stdin;
var table = args[0];
var fs = require('fs');
var r = require('rethinkdb');
var es = require('event-stream');
var JSONStream = require('JSONStream');
var dbConfig = {db: 'geo', host: 'localhost'};
var i = 0;
var results = {
  inserted: 0,
  replaced: 0,
  updated: 0
};

console.log(process.memoryUsage())

r.connect(dbConfig)
  .then(function(conn) {
    this.conn = conn;
    return new Promise(function(resolve, reject) {
      var queries = [];
      inputStream
        .pipe(JSONStream.parse('*'))
        .pipe(es.mapSync(function(item) {
          i++;
          queries.push(importFeature(conn, item));
          return item;
        }))
        .on('end', function() {
          resolve(queries);
          console.log(process.memoryUsage())
          console.log(i)
        });
    })
  })
  .then(function(queries) {
    return Promise.settle(queries);
  })
  .then(function(results) {
    if (results && results.length) {
      results.forEach(count);
    }
  })
  .catch(function(err) { console.error(err); })
  .finally(function(results) { if (this.conn) this.conn.close(); });

function importFeature(conn, data) {
  return r
    .table(table)
    .insert(prepareData(data), {conflict: 'update'})
    .run(conn)
    .catch(function(err) {console.error(err.message.split('\n')[0])});
}

function count(queryResult) {
  Object.keys(results).forEach(function(prop) {
    results[prop] += queryResult[prop] || 0;
  });
}

function prepareData(data) {
  data.id = data.properties.GEOID10 || data.properties.GEOID;
  if (data.geometry.type == 'MultiPolygon') {
    data.geometry = data.geometry.coordinates.map(function(coords) {
      return r.geojson({
        type: 'Polygon',
        coordinates: coords
      })
    });
  } else {
    data.geometry = r.geojson(data.geometry);
  }
  return data;
}