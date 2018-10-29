const express      = require('express');
const services     = require('./connection');

let app = express();
let user=[],connection=[];

let server = require('http').createServer(app);
const io  = require('socket.io').listen(server);

let PORT = process.env.PORT || 3000

server.listen(PORT,function(){
    console.log(`the server is listining.... ${PORT}`);
    services.start_con();    
});
app.use(express.static(__dirname));

io.sockets.on('connection',function(sockets){
    connection.push(sockets);
    console.log(`connected: ${connection.length} are connected`);

    //disconnect
    sockets.on('disconnect', function(){
        user.splice(user.indexOf(sockets.username),1);  
        updateUsername();      
        connection.splice(connection.indexOf(sockets),1);
        console.log(`disconnected: ${connection.length} socketss connected`);
    });
    sockets.on('check',(data)=>{
        console.log('inside login',data)
      db.collection('tb_users').find(data).toArray((err,result)=>{
          if(err){
             console.log("the mongo erorr",err)
          }           
          if(result.length){              
                  sockets.username= data.username;                  
                  user.push(sockets.username);
                  updateUsername(); 
                                 
            }else{
              sockets.emit('failed',data);
            }
      })
    })  

    sockets.on('send message',function(data){        
        io.sockets.emit('new messsage',{msg:data,username:sockets.username});
        //io.sockets.emit('new message',{msg:data})
    })
    function updateUsername(){
        console.log("the users is...",user);
        io.sockets.emit('get users',user);
        sockets.emit('successfull',user);
    }
    sockets.on('signup',(data)=>{
        db.collection('tb_users').insert(data,function(err,result){
            if(err){
                console.log(err);
            }
            sockets.emit('signed',result);
        })
    })

})

