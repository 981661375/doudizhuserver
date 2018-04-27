const Server = require('socket.io');
const io = new Server();

//io.setheader("access-contro-allow-origin","*");
//io.set("origins","*");
//io.origins("*");
io.listen('3000');

var sendToClient = function (socket,clientroom,event,type,data,callback=null) {
    //io.sockets.in(clientroom).emit(event,{type:type,data:data});
    socket.broadcast.to(clientroom).emit(event,{type:type,data:data});
    if(callback){
        callback();
    }
};

var clientList = {};   //存储所有room值，

console.log("server run!");
io.on('connect',function (client) {


   console.log("there is one client connect");

   var timeInterval=null;

    var clientRoom=null;
    client.on('move',(data)=>{
        sendToClient(client,clientRoom,'move',data.type,data.data);

    });

    client.on('Particleactive',(data)=>{
        sendToClient(client,clientRoom,'Particleactive',data.type,data.data);

    });
    client.on('game',(data)=>{
        console.log('data.data = '+data.type);
        if(data.type==='playerinfo'){
            sendToClient(client,clientRoom,'game',data.type,data.data);
            sendToClient(client,clientRoom,'showRivalInfo','','');
        }else if(data.type==='gameover'){
            io.sockets.in(clientRoom).emit("game",{type:"gameover",data:''})
        }else if(data.type==='continuegame'){
            sendToClient(client,clientRoom,'game',data.type,data.data);
            //client.emit('showRivalInfo','');
        }
        else{
            sendToClient(client,clientRoom,'game',data.type,data.data);

        }

    });

    client.on('room',(data)=>{    //给链接的客户端分配room值  ，
        clientRoom = data.data;
        if(clientList.hasOwnProperty(clientRoom)){
            if(data.type==='joinRoom'){
                if( clientList[clientRoom]===1){
                    client.join(clientRoom);
                    clientList[clientRoom] = 2;
                    client.emit('roomJudge','intoRoom');
                    io.sockets.in(clientRoom).emit('game',{type:'allPlayerJoin',data:''});
                    timeInterval= setInterval(()=>{
                        io.sockets.in(clientRoom).emit('birdMove',{x_Percent:Math.random()*0.5,y_Percent:Math.random()*1,changeTime:(1-Math.random())*3+0.1});
                    },1000);

                }else{
                    client.emit('roomJudge','roomNotRight');
                }


            }else if(data.type==='createRoom'){
                client.emit('roomJudge','roomExist');
            }
        }else {
            if(data.type==='joinRoom'){
                client.emit('roomJudge','roomNotExist');
            }else if(data.type==='createRoom'){
                client.join(clientRoom);
                clientList[clientRoom] = 1;           //将传进来的room值作为clientlist的键
                console.log(clientList);
                client.emit('roomJudge','intoRoom');
            }
        }
    });

    client.on("fireResult",(data)=>{
        if(data.type==='catchBird'){
            sendToClient(client,clientRoom,'fireResult',data.type,data.data);
            io.sockets.in(clientRoom).emit("birdBeCatch",data.data);
        }else if(data.type==='outBound'){
            sendToClient(client,clientRoom,'fireResult',data.type,data.data);
        }
    });






    client.on("disconnect",function(data){
        // if(clientList[clientRoom]===2){
        //     clientList[clientRoom]=1
        //     sendToClient(client,clientRoom,'game','backToStartLevel','');
        // }if(clientList[clientRoom]===1){
        //     delete clientList[clientRoom];
        //     sendToClient(client,clientRoom,'game','quitgame','');
        // }
        sendToClient(client,clientRoom,'game','quitgame','');
        delete clientList[clientRoom];
        clearInterval(timeInterval);   //必须清除定时器！！！！
    });

});

// server.close(function () {
//     console.log("ssssssssss");
// })