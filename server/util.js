const util = {
  returnFail: (msg, data)=> {
    return {
      data: data || '',
      msg: msg,
      success: false
    }
  }
}
module.exports = util

