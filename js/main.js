document.forms.publish.onsubmit = function() {
  var arrayForm = ['one', 'two', 'three', 'four', 'five'];
  arrayForm.forEach(function(element) {
    document.getElementById(element).style.display = 'none';
  });
  document.getElementById('wrong').style.display = 'none';
  var option = this.action.value;
  console.log(option);
  document.getElementById(option).style.display = 'block';
  if (option) nextStage(option);
  return false;
};

var keys = {
  '-c' : '-c',
  '-d' : '-d',
  '-s' : '--set-accountstatus',
  '-add' : '--add-target',
  '-del' : '--del-target'
}

function nextStage(option) {
  document.forms[option].onsubmit = function () {
    if (option == 'one' || option == 'two') {
      var mailbox = this.mailbox.value;
      var mailother = [];
      mailother.push(this.mailboxto.value);
      if (this.mail && this.mail.length >= 2) {
        for (i = 0; i < this.mail.length; i++) {
          mailother.push(this.mail[i].value);
        };
      } else if (this.mail) {
        mailother.push(this.mail.value);
      }
      console.log(mailbox, mailother);
      var key = (option == 'one' ? keys['-add'] : keys['-del'])
      openModal('domain='+ mailbox +'&key='+ key +'&mail=' + mailother.join(' '), option)
      return false;
    }
    if (option == 'three' || option == 'four') { 
      var mailbox = this.name.value;
      var password = option == 'three' ? this.password.value : '123456';
      console.log(mailbox, password)
      var key = (option == 'three' ? keys['-c'] : keys['-d']);
      openModal('domain='+ mailbox + '&key='+ key + '&pass=' + password, option)
      return false;
    }
    var domain = this.name.value;
    var status = this.throughput.value;
    openModal('domain='+ domain +'&key='+ keys['-s'] +'&stat=' + status, option);
    console.log(domain, status);
    //data(option)
    return false;
} 
  function data(option) {
    var form = document.forms[option]
    var elem1 = form.elements['first-one']
    var mess = elem1.value
    document.getElementById(option).style.display = 'none';
    console.log(mess)
  }
}

function addElements() {
  var elem = document.getElementById('items');
  var button = document.getElementById('add');
  var label = document.createElement('label');
  var div = document.createElement('div');
  div.className = 'next';

  var input = document.createElement('input');
  input.type = 'text'; input.name, input.id = 'mail';
  input.placeholder = 'Укажите почтовый ящик'; input.size = '45';
  
  var inputDel = document.createElement('input');
  inputDel.type = 'button'; inputDel.value = 'X';
  inputDel.className = 'del';
  inputDel.addEventListener('click', function () {
    this.parentNode.remove();
  });
  
  div.appendChild(label); div.appendChild(input); div.appendChild(inputDel)
  elem.insertBefore(div, button);
}

function getResponse(query, option) {
  console.log(query)
  var xhr = new XMLHttpRequest();
  
  xhr.open('GET', 'http://192.168.1.9:3003/?' + query, true);
  xhr.send();
  document.getElementById(option).style.display = 'none';
  document.getElementById('anime').style.display = 'block';
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    
    if (xhr.status != 200) {
      document.getElementById('anime').style.display = 'none';
      console.log(xhr.status + ' ' + xhr.statusText);
    } else {
      document.getElementById('anime').style.display = 'none';
      document.getElementById('wrong').style.display = 'block'
      console.log(xhr.responseText);
      showMessage(xhr.responseText);
    }
  }
}

function openModal(query, option) {
  $('.small.modal').modal({
    onApprove: function () {
      getResponse(query, option);
    }
  }).modal('show');
};

function showMessage(obj) {
  var serverResponse = JSON.parse(obj);
  var elem = document.getElementById('wrong');
  
  var out = {
    'Mailbox created' : 'Ящик Создан',
    'Maiboxes deleted' : 'Ящик удален',
    'targets changed' : 'Операция с переадресацией выполнена успешно',
    'status changed' : 'Статус домена изменён'
  };
  
  function choiceStyle(value, color) {
    elem.innerText = value;
    elem.style.backgroundColor = color;
    elem.style.color = 'white';
  }
  
  serverResponse.stdout in out ? choiceStyle(out[serverResponse.stdout], 'rgba(100, 249, 8, 0.38)') : 
  choiceStyle(serverResponse.stdout, 'rgba(255, 71, 0, 0.63)');
}