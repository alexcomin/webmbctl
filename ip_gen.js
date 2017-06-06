const http = require('http');
const fs = require('fs');
let usersip = require('./ip');

http.get('http://listban.office.domain.ru/log.bigBro', (res) => {
  let body = ''
  res.on('data', (d) => {
    body += d;
  });

  res.on('end', () => {
    let me = '10.42.71.27'
    let users = {}
    let parse = body.split('\n').slice(0, -1);
    
    parse.forEach((item) => {
      let obj = JSON.parse(item);       
      if (obj['USER'] == '') {
        if (obj['IP'] in usersip) {
          usersip[obj['IP']] = obj['HOSTNAME'];
          users[obj['IP']] = obj['HOSTNAME'];
        } else {
          usersip[obj['IP']] = obj['HOSTNAME'];
          users[obj['IP']] = obj['HOSTNAME'];
        }
      } else {
        if (obj['IP'] in usersip) {
          usersip[obj['IP']] = obj['USER'];
          users[obj['IP']] = obj['USER'];
        } else {
          usersip[obj['IP']] = obj['USER'];
          users[obj['IP']] = obj['USER'];
        }
      }
    });

    let list = JSON.stringify(usersip, null, '\t');
    let userpr = {};

    for (item in usersip) {
      userpr[usersip[item]] = { name : "", permissions : "regular" };
    }

    let userResult = JSON.stringify(userpr, null, '\t');

    console.log(list);

    fs.writeFileSync('user.json', userResult);
    fs.writeFileSync('ip.json', list);
  });
});
 
