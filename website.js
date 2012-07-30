
var fs= require('fs')
var jade = require('jade')
var package = require('./package')
var hl = require('./docs/highlight')
var linktype = require('./docs/linktype')

// add custom jade filters
require('./docs/filters')(jade);

var filemap = require('./docs/source');
var files = Object.keys(filemap);

files.forEach(function (file) {
  var filename = __dirname + '/' + file;
  jadeify(filename, filemap[file]);

  if ('--watch' == process.argv[2]) {
    fs.watchFile(filename, { interval: 1000 }, function (cur, prev) {
      if (cur.mtime > prev.mtime) {
        jadeify(filename, filemap[file]);
      }
    });
  }
});

function jadeify (filename, options) {
  options || (options = {});
  options.package = package;
  options.hl = hl;
  options.linktype = linktype;
  jade.renderFile(filename, options, function (err, str) {
    if (err) return console.error(err.stack);

    var newfile = filename.replace('.jade', '.html')
    fs.writeFile(newfile, str, function (err) {
      if (err) return console.error('could not write', err.stack);
      console.log('%s : rendered ', new Date, newfile);
    });
  });
}
