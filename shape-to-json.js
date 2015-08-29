#!/usr/bin/env node

var optimist = require('optimist');
var shp2json = require('shp2json');
var request = require('request');
var fs = require('fs');
var argv;
var readStream;

argv = optimist
  .usage('Provide a file to convert.')
  .alias('f', 'file')
  .alias('u', 'url')
  .describe('f', 'Load a file')
  .describe('u', 'Load a url')
  .argv;

if (!argv.f && !argv.u) {
  readStream = process.stdin;
} else {
  readStream = argv.f ? fs.createReadStream(argv.f) : request.get(argv.u);
}

shp2json(readStream)
  .pipe(process.stdout);
