const http = require('http');
const url = require('url');
const child_process = require('child_process');
const config = require('./setting');

const users = require('./ip');
const permissions = require('./user');

let server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') return;

  let key = url.parse(req.url, true).query.key;
  let domain = url.parse(req.url, true).query.domain;
  let pass = url.parse(req.url, true).query.pass;
  let stat = url.parse(req.url, true).query.stat;
  let mail = url.parse(req.url, true).query.mail;

  let ip = req.connection.remoteAddress.split(":").slice(-1)[0];
  
  console.log(ip in users ? (permissions[users[ip]].name +" "+ req.url) : (ip +" "+req.url));

  if (domain) {
    if (!(ip in users)) {
      let stdout_not_regular = {
        user: 'Неопределеный пользователь',
        permissions: 'no permissions',
        domain: domain,
        stdout: 'У Вас нет никаких прав. Обратитесь к разработчику.'
      }
      res.writeHead(200, config.head);
      res.end(JSON.stringify(stdout_not_regular, null, '\t'))
      return
    } 
    if (permissions[users[ip]]['permissions'] === 'regular') {
      let stdout_regular = {
        user: permissions[users[ip]]['name'],
        permissions: permissions[users[ip]]['permissions'],
        domain: domain,
        stdout: 'Недостаточно прав на выполнение операции'
      };
      res.writeHead(200, config.head);
      res.end(JSON.stringify(stdout_regular, null, '\t'));
      return
    };

    let cmd;

    if (stat) {
      cmd = child_process.spawnSync('ssh', [config.setting.remoteHost, 'sudo', 'mbctl', key, stat, domain], {
        input: pass,
        encoding: 'utf8'
      });
    } else if (mail) {
      cmd = child_process.spawnSync('ssh', [config.setting.remoteHost, 'sudo', 'mbctl', key, domain, mail], {
        input: pass,
        encoding: 'utf8'
      });
    } else {
      cmd = child_process.spawnSync('ssh', [config.setting.remoteHost, 'sudo', 'mbctl', key, domain], {
        input: pass,
        encoding: 'utf8'
      });
    }

    let array = cmd.stdout.split('\n');
    let newArray = array.filter(function(value) {
      return value;
    });

    let result = newArray.slice(-1)[0];
    let stdout = { 
      user: permissions[users[ip]]['name'], 
      permissions: permissions[users[ip]]['permissions'],
      domain: domain,
      stdout: result.split(' ').slice(-2).join(' '),
      text: cmd.stdout
    };

    res.writeHead(200, config.head);
    res.end(JSON.stringify(stdout, null, '\t'));
    return
  }
  
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.write('Server Error 500');
  res.end();

});

server.listen(config.setting.port)
console.log('Server listen', config.setting.port);
