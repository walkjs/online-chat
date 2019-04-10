<template>
  <div class="login">
    <div class="login-bar">
      <input type="text" ref="login" placeholder="请输入用户名" v-model="name">
      <button class="btn" @click="login">登录</button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      name: ''
    }
  },
  mounted () {
    this.$refs.login.focus()
  },
  methods: {
    login () {
      if (!this.name) {
        alert('请输入用户名')
        return
      }
      this.$http.post('/xapi/login', {
        name: this.name
      }).then(res => {
        if (res.data.success) {
          let para = {
            uid: res.data.data.uid,
            name: res.data.data.name
          }
          sessionStorage.setItem('user', JSON.stringify(para))
          this.$router.push('/main')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .login{
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(#8C76C8, #769EC8, #76C0C8);
  }
  .login-bar{
    width: 500px;
    height: 500px;
    background: white;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    input{
      width: 60%;
      padding: 20px;
      margin: 70px auto 0 auto;
      box-shadow: 0 5px 5px #ccc;
      border: 2px solid #ccc;
      border-radius: 5px;
      outline: none;
      font-size: 25px;
      font-weight: bold;
      text-align: center;
      color: #8C76C8;
      transition: border 0.2s linear;
      &:hover,&:focus{
        transition: border 0.2s linear;
        border: 2px solid #769EC8;
      }
    }
    .btn{
      outline: none;
      border: none;
      width: 80px;
      height: 80px;
      box-shadow: 0 5px 5px #ccc;
      border-radius: 50%;
      text-align: center;
      line-height: 50px;
      margin-top: 20px;
      font-size: 18px;
      background: #769EC8;
      transition: background 0.2s linear;
      color: white;
      cursor: pointer;
      &:hover{
        background: #8C76C8;
        transition: background 0.2s linear;
      }
    }
  }
</style>
