const room = require('../models/room');
const postit = require('../models/postit');
const blockedUser = require('../models/blockedUser');
const fs = require('fs');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Connected', socket.id);

        socket.on('checkPublic:creator', async (check) => {
            if (await checkCreatorInRoom(check)) {
                socket.emit('checkPublic:true',check);
            }
            else {
                socket.emit('creatorFalse:message');
            }
        })

        socket.on('checkPrivate:creator', async (check) => {
            if (await checkCreatorInRoom(check)) {
                socket.emit('checkPrivate:true',check);
            }
            else {
                socket.emit('creatorFalse:message');
            }
        })

        socket.on('joinRoom:private', async (socketInfo) => {
            if (await checkRoom(socketInfo)) {
                if (socketInfo[3] == socketInfo[4]) updateCreatorInRoom(socketInfo, true);

                if (await checkBlockedUsers(socketInfo)) {
                    socket.join(socketInfo[1]);
                    socket.emit('show:chat',await checkMessages(socketInfo));
                    socket.emit('video:room',await checkRoomVideo(socketInfo[1]));
                    io.sockets.in(socketInfo[1]).emit('room:message', socketInfo);
                }
                else socket.emit('blocked:message');
                

                socket.on('postit:message', async (data) => {
                    if (await checkBlockedUsers(socketInfo)) {
                        addMessage(data,socketInfo);
                        io.sockets.to(socketInfo[1]).emit('postit:message', data);
                    }
                    else socket.emit('blocked:message');

                })
                socket.on('postit:save', async (data) => {
                    if (await checkBlockedUsers(socketInfo)){
                        addMessage(data,socketInfo);
                        addPostit(data);
                        io.sockets.to(socketInfo[1]).emit('postit:message', data);
                    }
                    else socket.emit('blocked:message');
                });
                socket.on('video:play', async () => {
                    if (await checkBlockedUsers(socketInfo)) io.to(socketInfo[1]).emit('video:playAll');
                    else socket.emit('blocked:message');
                })
                socket.on('video:pause', async () => {
                    if (await checkBlockedUsers(socketInfo)) io.to(socketInfo[1]).emit('video:pauseAll');
                    else socket.emit('blocked:message');
                })

                socket.on('video:moveBar', async (data) => {
                    if (await checkBlockedUsers(socketInfo)) {
                        io.to(socketInfo[1]).emit('video:moveBarAll',data);
                    }
                    else socket.emit('blocked:message');
                })

                socket.on('video:source', async (data) => {
                    if (await checkBlockedUsers(socketInfo)) {
                        await updateVideo(socketInfo[1],data);
                        io.to(socketInfo[1]).emit('video:changeSource', data);
                    }
                    else socket.emit('blocked:message');
                })

                socket.on('check:postits', async () => {
                    socket.emit('show:postit',await checkPostits(socketInfo[3]));
                })

                socket.on('user:block', async (data) => {
                    socketInfo[6] = data;
                    await addBlockedUser(socketInfo);
                    io.to(socketInfo[1]).emit('user:disabled', socketInfo);
                })

                socket.on('socketRoom:unsubscribe', () => {
                    if (socketInfo[3] == socketInfo[4]) updateCreatorInRoom(socketInfo, false);
                    io.to(socketInfo[1]).emit('user:leave', socketInfo);
                    socket.leave(socketInfo[1]);
                })
            }
        })
        socket.on('joinRoom:public', async (socketRoom) => {
            if (socketRoom[3] == socketRoom[4]) updateCreatorInRoom(socketRoom, true);
            
            if (await checkBlockedUsers(socketRoom)) {
                socket.join(socketRoom[1]);
                socket.emit('video:room',await checkRoomVideo(socketRoom[1]));
                socket.emit('show:chat',await checkMessages(socketRoom));
                io.to(socketRoom[1]).emit('room:message', socketRoom);
            }
            else socket.emit('blocked:message');
            
            socket.on('postit:message', async (data) => {
                if (await checkBlockedUsers(socketRoom)) {
                    addMessage(data,socketRoom);
                    io.to(socketRoom[1]).emit('postit:message', data);
                }
                else socket.emit('blocked:message');
            });
            socket.on('postit:save', async (data) => {
                if (await checkBlockedUsers(socketRoom)) {
                    addMessage(data,socketRoom);
                    addPostit(data);
                    io.to(socketRoom[1]).emit('postit:message', data);
                }
                else socket.emit('blocked:message');
            });
            socket.on('video:play', async () => {
                if (await checkBlockedUsers(socketRoom)) io.to(socketRoom[1]).emit('video:playAll', socketRoom[1]);
                else socket.emit('blocked:message');
            })
            socket.on('video:pause', async () => {
                if (await checkBlockedUsers(socketRoom)) io.to(socketRoom[1]).emit('video:pauseAll', socketRoom[1]);
                else socket.emit('blocked:message');
            })

            socket.on('video:moveBar', async (data) => {
                if (await checkBlockedUsers(socketRoom)) {
                    io.to(socketRoom[1]).emit('video:moveBarAll',data);
                }
                else socket.emit('blocked:message');
            })

            socket.on('video:source', async (data) => {
                if (await checkBlockedUsers(socketRoom)) {
                    await updateVideo(socketRoom[1],data);
                    io.to(socketRoom[1]).emit('video:changeSource', data);
                }
                else socket.emit('blocked:message');
            })

            socket.on('check:postits', async () => {
                socket.emit('show:postit',await checkPostits(socketRoom[3]));
            })

            socket.on('user:block', async (data) => {
                socketRoom[6] = data;
                await addBlockedUser(socketRoom);
                io.to(socketRoom[1]).emit('user:disabled', socketRoom);
            })
            socket.on('socketRoom:unsubscribe', () => {
                if (socketRoom[3] == socketRoom[4]) updateCreatorInRoom(socketRoom, false);
                io.to(socketRoom[1]).emit('user:leave', socketRoom);
                socket.leave(socketRoom[1]);

            })
        });
    });

    async function checkPostits(data){
        const myPostits = await postit.find({ user: data});
        return myPostits;
    }

    async function checkMessages(data){
        const roomChat = await room.find({ name: data[1]});
        return roomChat;
    }

    async function checkRoomVideo(data){
        const roomVideo = await room.find({ name: data});
        return roomVideo[0].video;
    }

    async function checkRoom(data) {
        const roomOne = await room.findById({ _id: data[0] });
        return (roomOne.password == data[5]) ? true : false;
    }

    async function checkBlockedUsers(data) {
        const noBlockedUsers = await blockedUser.countDocuments({ user: data[3], room: data[1] });
        return (noBlockedUsers == 0) ? true : false;
    }

    async function checkCreatorInRoom(data) {
        const creatorInRoom = await room.countDocuments({ name: data[1], createdBy: data[4], stateCreator: true });
        return (creatorInRoom == 1) ? true : false;
    }

    async function addBlockedUser(data) {
        const newBlockedUser = new blockedUser({
            user: data[6],
            room: data[1]
        });
        await newBlockedUser.save((err) => {
            if (err) {
                console.log('Error al guardar el usuario bloqueado en la BD. ' + err);
            } else {
                console.log('Exito al guardar ' + data[6] + ' bloqueado en la BD');
            }
        });
    }

    async function addMessage(data,info){
        await room.updateOne({name: info[1]},{$push:{messages: `<Strong>${data.username}</Strong> : ${data.message}`}});
    }

    async function updateCreatorInRoom(data, state) {
        const updateState = await room.updateOne({ createdBy: data[3], name: data[1] }, { stateCreator: state });
    }

    async function updateVideo(roomName,YTid){
        const updateVideo = await room.updateOne({name: roomName}, { video: YTid});
    }

    async function addPostit(data) {
        const newPostit = new postit({
            user: data.username,
            text: data.message,
            nameVideo: data.nameVideo,
            currentTime: data.currentTime
        });
        await newPostit.save((err) => {
            if (err) {
                console.log('Error al guardar el postit en la BD. ' + err);
            } else {
                console.log('Exito al guardar el postit en la BD');
            }
        });
    }

}