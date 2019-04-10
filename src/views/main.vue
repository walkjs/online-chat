<template>
  <div class="main">
    <div class="msg">
      <div class="left-msg-bar">
        <div>当前用户：{{user.name}}</div>
        <div>在线人数：{{userList.length + 1}}</div>
        <div v-for="(item, index) in userList"
             :key="index"
             v-if="item.uid !== user.uid"
             :style="{
               background: item.click ? '#76C0C8' : '',
               color: item.click ? '#fff' : '#606266'
             }"
             class="user-list"
             @click="changeChat(item)"
        >
          <span class="iconfont iconyonghu" style="font-size: 25px;margin-right: 10px"></span>
          <span class="msg-left">
            <span style="font-size: 13px">{{item.name}}</span>
            <span style="font-size: 16px">{{item.msg.length > 0 ? item.msg[item.msg.length - 1].msg : ''}}</span>
          </span>
        </div>
      </div>
      <div class="right-msg-bar">
        <div class="response-msg" ref="response-msg">
          <div v-for="(item, index) in msgList" :key="index">
            <span style="display: flex">
              <span class="iconfont iconyonghu res-icon" v-if="item.type === 'send'"></span>
              <span v-if="item.type === 'send'" class="res-send">
                <span style="font-size: 13px">{{item.name + ' ' + item.createTime}}</span>
                <span>{{item.msg}}</span>
              </span>
            </span>
            <span style="display: flex">
              <span v-if="item.type === 'now'" class="res-now">
                <span style="font-size: 13px">{{item.createTime}}</span>
                <span>{{item.msg}}</span>
              </span>
              <span class="iconfont iconyonghu res-icon" v-if="item.type === 'now'"></span>
            </span>
          </div>
        </div>
        <div class="send-msg">
          <div style="height: 60%;padding: 10px">
            <textarea ref="textArea" v-model="msg" placeholder="请输入聊天内容"></textarea>
          </div>
          <div class="send-btn">
            <span></span>
            <button class="button" @click="sendMsg">发送（enter）</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import io from 'socket.io-client'
export default {
  data () {
    return {
      msg: '',
      user: {},
      userList: [],
      socket: ''
    }
  },
  computed: {
    msgList () {
      for (let i = 0; i < this.userList.length; i++) {
        if (this.userList[i].click) {
          return this.userList[i].msg
        }
      }
      return []
    }
  },
  created () {
    this.user = JSON.parse(sessionStorage.getItem('user'))
    this.createWS()
  },
  mounted () {
    document.addEventListener('keydown', (val) => {
      if (val.keyCode === 13 && this.$route.fullPath === '/main') {
        this.sendMsg()
      }
    })
    this.$refs.textArea.focus()
  },
  methods: {
    createWS () {
      this.socket = io('http://localhost:3000')
      // 获取用户列表
      this.socket.on('user-list', (list) => {
        this.userList = []
        list.forEach((val, index) => {
          if (val.uid !== this.user.uid) {
            this.userList.push({
              ...val,
              msg: [],
              click: false,
              type: 'single'
            })
          }
        })
        this.userList.push({
          uid: 'group',
          name: '群聊',
          msg: [],
          click: false,
          type: 'group'
        })
        if (this.userList[1]) {
          this.userList[1].click = true
        }
      })

      // 收到消息
      this.socket.on(this.user.uid, (chat) => {
        for (let i = 0; i < this.userList.length; i++) {
          if (this.userList[i].uid === chat.now_uid) {
            this.userList[i].msg.push({
              createTime: new Date().toLocaleDateString().replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString().substr(2, new Date().toLocaleTimeString().length),
              name: this.userList[i].name,
              msg: chat.msg,
              type: 'send'
            })
            break
          }
        }
        this.$nextTick(() => {
          if (this.$refs['response-msg']) {
            this.$refs['response-msg'].scrollTop = this.$refs['response-msg'].scrollHeight
          }
        })
      })

      // 收到消息
      this.socket.on('group', (chat) => {
        for (let i = 0; i < this.userList.length; i++) {
          if (this.userList[i].uid === chat.now_uid) {
            this.userList[this.userList.length - 1].msg.push({
              createTime: new Date().toLocaleDateString().replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString().substr(2, new Date().toLocaleTimeString().length),
              name: this.userList[i].name,
              msg: chat.msg,
              type: 'send'
            })
            break
          }
        }
        this.$nextTick(() => {
          if (this.$refs['response-msg']) {
            this.$refs['response-msg'].scrollTop = this.$refs['response-msg'].scrollHeight
          }
        })
      })
    },
    sendMsg () {
      for (let i = 0; i < this.userList.length; i++) {
        if (this.userList[i].click) {
          if (this.userList[i].type === 'single') {
            // 向单人聊天发送要聊天人的uid
            this.socket.emit('chat-single', {
              // 要发送到哪个uid
              send_uid: this.userList[i].uid,
              // 当前uid
              now_uid: this.user.uid,
              msg: this.msg
            })
          }
          if (this.userList[i].type === 'group') {
            // 向群体聊天发送要聊天人的uid
            this.socket.emit('chat-group', {
              send_uid: 'group',
              // 当前uid
              now_uid: this.user.uid,
              msg: this.msg
            })
          }
          this.userList[i].msg.push({
            createTime: new Date().toLocaleDateString().replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString().substr(2, new Date().toLocaleTimeString().length),
            name: this.userList[i].name,
            msg: this.msg,
            type: 'now'
          })
          break
        }
        if (!this.userList[i].click && i === this.userList.length - 1) {
          // 群聊
          this.socket.emit('chat-group', this.msg)
        }
      }
      this.$nextTick(() => {
        if (this.$refs['response-msg']) {
          this.$refs['response-msg'].scrollTop = this.$refs['response-msg'].scrollHeight
        }
      })
      this.msg = ''
    },
    // 换人聊天
    changeChat (item) {
      this.userList.forEach(val => {
        val.click = false
      })
      item.click = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .main{
    width: 100%;
    height: 100vh;
    background: linear-gradient(#8C76C8, #769EC8, #76C0C8);
  }
  .msg{
    width: 920px;
    height: calc(80vh + 20px);
    position: absolute;
    left: 0;
    right: 0;
    margin: 10vh auto 0 auto;
    display: flex;
    .left-msg-bar{
      width: 270px;
      box-shadow: 0 8px 8px $color-black,0 0px 14px $color-black;
      margin-right: 20px;
      background: white;
      color: #606266;
      .user-list{
        cursor: pointer;
        transition: all linear 0.2s;
        text-align: center;
        display: flex;
        &:hover{
          transition: all linear 0.2s;
          background: #76C0C8;
          color: #fff !important;
        }
      }
      .msg-left{
        display: flex;
        flex-direction: column;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100px;
        text-align: left;
      }
      >div{
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 0;
        font-size: 18px;
      }
    }
    .right-msg-bar{
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      >div{
        width: 100%;
        overflow: auto;
        background: white;
      }
      .response-msg{
        height: 70%;
        box-shadow: 0 0 8px $color-black;
        >div{
          display: flex;
          justify-content: space-between;
          >span{
            padding: 20px;
            margin-top: 10px;
          }
        }
      }
      .send-msg{
        display: flex;
        flex-direction: column;
        height: calc(30% - 20px);
        margin-top: 20px;
        box-shadow: 0 8px 8px $color-black,0 0px 5px $color-black;
        textarea{
          outline: none;
          border: none;
          resize:none;
          width: 100%;
          height: 100%;
        }
        .send-btn{
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 40%;
          >.button{
            margin-right: 10px;
            outline: none;
            border: none;
            background: #76C0C8;
            color: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 5px 3px #ccc;
            cursor: pointer;
          }
        }
      }
    }
  }
  .res-icon{
    font-size: 25px;
    color: rgb(118, 192, 200);
  }
  .res-now,.res-send{
    display: flex;
    flex-direction: column;
    padding: 5px 10px;
    background: #fff;
    border: 1px solid #ccc;
    color: #769EC8;
    box-shadow: 0 5px 3px #ccc;
    margin: 0 10px;
  }
</style>
