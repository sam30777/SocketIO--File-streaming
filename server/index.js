let path = require('path');

const indexPath = path.join(__dirname,'../public');

const express = require('express');

const http = require('http');

const socketIo = require('socket.io');


let app = new express();

let server = http.createServer(app);

let io = socketIo(server);

let fs = require('fs');

var files = {},
    struct = {
        name: null,
        type: null,
        size: 0,
        data: [],
        slice: 0,
    };

app.use(express.static(indexPath));



io.on('connection',(socket)=>{
    socket.on('uploadData', (data) => {
        console.log("data is this>>>",data)
          if (!files[data.name]) {
              files[data.name] = Object.assign({}, struct, data);
              files[data.name].data = [];
          }
      
          
          data.data = new Buffer(new Uint8Array(data.data));
         
          files[data.name].data.push(data.data);
          files[data.name].slice++;
      
          if (files[data.name].slice * 100000 >= files[data.name].size) {
              socket.emit('end upload');
          } else {
              socket.emit('getMoreData', {
                  currentSlice: files[data.name].slice
              });
          }
          if (files[data.name].slice * 100000 >= files[data.name].size) {
              var fileBuffer = Buffer.concat(files[data.name].data);
       
              fs.writeFile('./'+data.name,fileBuffer,function(err){
              socket.emit('completed')
          });
          }
      });
    
})



server.listen(3000,()=>{
    console.log("Server is runnign ar port : 3000");
})