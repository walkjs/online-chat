const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
// 添加中间件，express的post能获取数据
const bodyParser = require('body-parser');
const util = require('./util')
app.use(bodyParser.json());
let userList = []
// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html')
// })

// 用户登录
app.post('/xapi/login', function (req, res) {
  let user = {
    uid: new Buffer(req.body.name).toString('base64'),
    name: req.body.name,
  }
  if (!req.body.name) {
    res.json(util.returnFail('用户名不为空'))
    return
  }
  try{
    userList.forEach(val => {
      if(val.name === req.body.name){
        throw '该用户名已存在'
      }
    })
  }catch(e){
    res.json(util.returnFail(e))
    return
  }
  userList.push(user)

  let para = {
    data: {
      uid: user.uid,
      name: user.name,
    },
    success: true,
    msg: '登录成功'
  }
  res.json(para)
})

io.on('connection', function (socket) {
  // 向所有用户广播
  io.sockets.emit('user-list', userList)

  // 单人聊天通道
  socket.on('chat-single', function (val) {
    for (let i = 0; i < userList.length; i++) {
      if (val.send_uid === userList[i].uid) {
        io.sockets.emit(val.send_uid, {
          msg: val.msg,
          send_uid: val.send_uid,
          now_uid: val.now_uid
        })
        break
      }
    }

  })

  // 群聊通道
  socket.on('chat-group', function (val) {
    socket.broadcast.emit(val.send_uid, {
      msg: val.msg,
      send_uid: val.send_uid,
      now_uid: val.now_uid
    })
  })
})

const port = 3000
http.listen(port, function () {
  console.log(`listening on *:${port}`)
})
