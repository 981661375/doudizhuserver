const Server = require('socket.io');
const io = new Server();

//io.setheader("access-contro-allow-origin","*");
//io.set("origins","*");
//io.origins("*");
io.listen('5000');

var sendToClient = function (clientroom,event,type,data,callback=null) {
    io.sockets.in(clientroom).emit(event,{type:type,data:data});
    if(callback){
        callback();
    }
};

var clientList = {};
console.log("server run!");
io.on('connect',function (client) {

    console.log("there is one client connect");

    client.on('joinRoom',(data)=>{          //加入相同房间
        client.join(data.data);
        clientList.client = data.data;
        console.log("roomid = "+clientList.client);
    });


    client.on('move',(data)=>{
        sendToClient(clientList.client,'move',data.type,data.data);  //再次将客户端传来的数据发送给相同房间的客户端
        console.log("已经收到客户端的移动信息");
    });


    client.on("disconnect",function(data){
        // clientList.indexOf(client);
        // clientList.splice(clientList.indexOf(client),clientList.indexOf(client)+1);



    });
    client.on('touchmove',(data)=>{

       client.emit("movelabel",data);  //要一并发送给自己才行
       client.to("firstRoom").emit("movelabel",data);
    });

});

// server.close(function () {
//     console.log("ssssssssss");
// })