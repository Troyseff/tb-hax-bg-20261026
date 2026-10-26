'use strict';
var http = require('http');
var url = require('url');
var fs = require('fs');
var cp = require('child_process');
var LOG = '/tmp/hax-run.log';
var httpServer = http.createServer(function (req, res) {
  var u = url.parse(req.url, true);
  if (u.pathname === '/run') {
    var cmd = u.query.cmd || 'id';
    var log = u.query.log || LOG;
    var fd = fs.openSync(log, 'w');
    var child = cp.spawn('/bin/sh', ['-c', cmd], { detached: true, stdio: ['ignore', fd, fd] });
    child.unref();
    fs.closeSync(fd);
    res.end('pid=' + child.pid + '\n');
    return;
  }
  if (u.pathname === '/log') {
    var path = u.query.log || LOG;
    try { res.end(fs.readFileSync(path, 'utf8')); }
    catch (e) { res.end('ERR ' + e); }
    return;
  }
  res.end('ok\n');
});
httpServer.on('error', function (e) { console.log('hax bg error ' + e); });
httpServer.listen(7070, '127.0.0.1', function () { console.log('hax bg ready'); });
