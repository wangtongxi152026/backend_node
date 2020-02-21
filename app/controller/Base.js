'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
  // 响应客户端
  responseClient(httpCode = 500, code = 3, message = '服务端异常', data = {}) {

    this.ctx.body = { code, message, data };
    this.ctx.status = httpCode;
  }

  createToken(data) {
    return this.ctx.app.jwt.sign(data, this.ctx.app.config.jwtSecret, {
      expiresIn: '7d',
    });
  }
}

module.exports = BaseController;
