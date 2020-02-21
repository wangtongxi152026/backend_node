// 响应客户端

module.exports = {
  responseClient(httpCode = 500, code = 3, message = '服务端异常', data = {}) {
    this.body = { code, data, message };
    this.status = httpCode;
  },
};
