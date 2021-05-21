const socket = io();

let btnSend = document.getElementById('sendPostit');
let btnLeave = document.getElementById('leaveRoom');
let btnPlay = document.getElementById('playVideo');
let btnPause = document.getElementById('pauseVideo');
let btnSave = document.getElementById('savePostit');
let btnShare = document.getElementById('shareVideo');
let btnBlockUser = document.getElementById('blockUser');
let btnShowPostit = document.getElementById('show');
let btnHidePostit = document.getElementById('hide');
let media = document.querySelector('iframe');

let message = document.getElementById('message');
let username = document.getElementById('username');
let output = document.getElementById('output');
let info = document.getElementById('info');
let idRoom = document.getElementById('idRoom');
let typeRoom = document.getElementById('typeRoom');

let player;

function onYouTubePlayerAPIReady() {

    player = new YT.Player('videoPlayer', {
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {

    btnPlay.addEventListener('click', () => {
        socket.emit('video:play');
    });

    btnPause.addEventListener('click', () => {
        socket.emit('video:pause');
    });

}
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

document.querySelector("body").addEventListener('click', (data) => {
    const dataInput = data.target.closest('a');

    if (dataInput !== null) {
        const sendDataInput = { ...dataInput.id.split(',') };
        if (dataInput.id == 'leaveRoom') {
            console.log('Leave Room')
            socket.emit('socketRoom:unsubscribe', sendDataInput);
        }
        else if (sendDataInput[2] == 'private') {
            if (sendDataInput[3] == sendDataInput[4]) {
                document.getElementById('blockUser').style.display = 'block';
                document.getElementById('listUsers').style.display = 'block';
                Object.assign(sendDataInput, { 5: document.getElementById(sendDataInput[0]).value });
                socket.emit('joinRoom:private', sendDataInput);
            }
            else {
                Object.assign(sendDataInput, { 5: document.getElementById(sendDataInput[0]).value });
                socket.emit('checkPrivate:creator', sendDataInput);
            }

            document.getElementById(sendDataInput[0]).value = '';
        }
        else if (sendDataInput[2] == 'public') {
            if (sendDataInput[3] == sendDataInput[4]) {
                document.getElementById('blockUser').style.display = 'block';
                document.getElementById('listUsers').style.display = 'block';
                socket.emit('joinRoom:public', sendDataInput);
            }
            else socket.emit('checkPublic:creator', sendDataInput);
        }
    }
});

btnBlockUser.addEventListener('click', () => {
    var selectedUser = document.getElementById("listUsers");
    var text = selectedUser.options[selectedUser.selectedIndex].text;
    socket.emit('user:block', text);

});

btnShowPostit.addEventListener('click', () => {
    document.getElementById('chat').style.display = 'none';
    document.getElementById('show').style.display = 'none';
    document.getElementById('hide').style.display = 'block';
    socket.emit('check:postits');
});

btnHidePostit.addEventListener('click', () => {
    document.getElementById('postitview').style.display = 'none';
    document.getElementById('chat').style.display = 'block';
    document.getElementById('show').style.display = 'block';
    document.getElementById('hide').style.display = 'none';
    document.getElementById('postitview').innerHTML = '';
});

btnShare.addEventListener('click', () => {
    var data = document.getElementById("videoID").value;
    socket.emit('video:source', data);
});

btnSave.addEventListener('click', () => {
    var array = media.src.split('?');
    socket.emit('postit:save', {
        message: message.value,
        username: username.value,
        nameVideo: array[0],
        currentTime: secondsToString(player.getCurrentTime().toFixed(0))
    });
    document.getElementById('message').value = '';
});

btnSend.addEventListener('click', () => {
    var array = media.src.split('?');
    socket.emit('postit:message', {
        message: message.value,
        username: username.value,
        nameVideo: array[0],
        currentTime: secondsToString(player.getCurrentTime().toFixed(0))
    });
    document.getElementById('message').value = '';
});

btnPlay.addEventListener('click', () => {
    socket.emit('video:play');
});
btnPause.addEventListener('click', () => {
    socket.emit('video:pause');
});

function eventBar(){
    document.getElementById('slider').value = ((player.getCurrentTime()/player.getDuration()).toFixed(2))*100;
    document.getElementById('labelBar').innerHTML = secondsToString(player.getCurrentTime().toFixed(0))+' / '+secondsToString(player.getDuration().toFixed(0));
}

function moveBar(newVal){
    setInterval(eventBar,1000);
    socket.emit('video:moveBar',(newVal*player.getDuration()/100));
}

function secondsToString(seconds) {
    var hour = Math.floor(seconds / 3600);
    hour = (hour < 10)? '0' + hour : hour;
    var minute = Math.floor((seconds / 60) % 60);
    minute = (minute < 10)? '0' + minute : minute;
    var second = seconds % 60;
    second = (second < 10)? '0' + second : second;
    return hour + ':' + minute + ':' + second;
  }

socket.on('video:playAll', () => {
    player.playVideo();
    setInterval(eventBar,1000);
})
socket.on('video:pauseAll', () => {
    player.pauseVideo();
})

socket.on('video:moveBarAll', (data) => {
    player.seekTo(data,true);
})

socket.on('video:changeSource', (data) => {
    media.src = "https://www.youtube.com/embed/" + data + "?enablejsapi=1&origin=http://localhost:3000"
    document.getElementById('nombreArchivo').innerHTML = data;
    document.getElementById("videoID").value = '';
})

socket.on('postit:message', (data) => {
    output.innerHTML += `<Strong>${data.username}</Strong> : ${data.message}<br>`
});

socket.on('room:message', (data) => {
    var listWidthRoom = document.getElementsByName('widthRoom');

    for (var i = 0; i < listWidthRoom.length; i++) listWidthRoom[i].style.width = '8rem';

    document.getElementById('centerColumn').style.display = 'block';
    document.getElementById('rightColumn').style.display = 'block';
    document.getElementById('leftColumn').className = 'card border-dark overflow-auto';
    document.getElementById('leftColumn').style.width = '130px';
    document.getElementById('leftColumn').style.backgroundColor = 'rgb(230, 198, 157)';
    document.getElementById('title').style.width = '8rem';
    document.getElementById('title').style.backgroundColor = 'rgb(224, 162, 80)';

    var listPasswords = document.getElementsByName('password');
    var listJoinButtons = document.getElementsByName('joinButton');
    var listDeleteButtons = document.getElementsByName('deleteButton');
    var listLeaveButtons = document.getElementsByName('leaveButton');

    for (var i = 0; i < listJoinButtons.length; i++) listJoinButtons[i].style.display = 'none';
    for (var i = 0; i < listDeleteButtons.length; i++) listDeleteButtons[i].style.display = 'none';
    for (var i = 0; i < listPasswords.length; i++) listPasswords[i].style.display = 'none';
    for (var i = 0; i < listLeaveButtons.length; i++) listLeaveButtons[i].style.display = 'block';

    for (var i = 0; i < listLeaveButtons.length; i++) {
        if (listLeaveButtons[i].title != data[1]) listLeaveButtons[i].style.pointerEvents = 'none';
    }

    if (data[3] != data[4]) {
        const option = document.createElement('option');
        option.text = data[3];
        document.getElementById('listUsers').add(option);
    }
    info.innerHTML += data[3] + ' joined to ' + data[1] + '<br>';
    info.style.color = "grey";
    info.style.fontStyle = "italic";
    document.getElementById('nombreSala').innerHTML = data[1];
});
socket.on('user:leave', (data) => {
    if (data[3] != data[4]) {
        var selectobject = document.getElementById("listUsers");
        for (var i = 0; i < selectobject.length; i++) {
            if (selectobject.options[i].value == data[3])
                selectobject.remove(i);
        }
    }
    console.log(data[3] + ' left ' + data[1]);
    info.innerHTML += data[3] + ' left ' + data[1] + '<br>';
    info.style.color = "grey";
    info.style.fontStyle = "italic";

});

socket.on('video:room', (data) => {
    media.src = "https://www.youtube.com/embed/" + data + "?enablejsapi=1&origin=http://localhost:3000"
});

socket.on('user:disabled', (data) => {
    info.innerHTML += data[6] + ' blocked ' + '<br>';
});

socket.on('show:postit', (data) => {
    for (var i = 0; i < data.length; i++) document.getElementById('postitview').innerHTML += '<div class="col-1"><div class=" card-deck" style="width: 21rem;margin-top: 5px;margin-right:5px;margin-left:40px;margin-bottom:5px;"><div class="card text-center"><h5 class="card-title">' + data[i].text + '</h5><ul class="list-group list-group-flush"><li class="list-group-item">' + data[i].nameVideo + '</li><li class="list-group-item">' + data[i].currentTime + '</li><div class="card-footer"><p><small class="text-muted">' + data[i].date + '</small></p></div></ul></div></div></div>';
    document.getElementById('postitview').style.display = 'block';
});

socket.on('show:chat',(data)=>{
    for (var i = 0; i < data[0].messages.length; i++) {
        output.innerHTML += data[0].messages[i]+'<br>';
    }
})

socket.on('blocked:message', () => {
    alert('You are blocked');
});
socket.on('checkPublic:true', (data) => {
    socket.emit('joinRoom:public', data);
});
socket.on('checkPrivate:true', (data) => {
    socket.emit('joinRoom:private', data);
});
socket.on('creatorFalse:message', () => {
    alert('Creator is not in the room');
});
