const Server = require('socket.io');
const io = new Server();

io.listen('5050');
var clientList = [];
console.log("server run!");
io.on('connect',function (client) {
    client.join('firstRoom');
    clientList.push(client);
    console.log("there is one client connect"+clientList.length);

   var result= client.emit("welcome","you have connect server");

    client.on("wxmessage",function(data){

      console.log("name = "+data.name);
      console.log("age = "+data.age);
      console.log("describe = "+data['describe']);
      //client.to("firstRoom").emit("wxmessageBack","返回一个信息");
        //io.sockets.emit("wxmessageBack","返回一个信息");
        io.sockets.in('firstRoom').emit("wxmessageBack","返回一个信息");

   });
    client.on("disconnect",function(data){
        clientList.indexOf(client);
        clientList.splice(clientList.indexOf(client),clientList.indexOf(client)+1);



    });
    client.on('touchmove',(data)=>{

       client.emit("movelabel",data);  //要一并发送给自己才行
       client.to("firstRoom").emit("movelabel",data);
    });

});

// server.close(function () {
//     console.log("ssssssssss");
// })