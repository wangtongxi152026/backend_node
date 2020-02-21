'use strict';

const {
  user_url,

  access_token_url,
  client_id,
  client_secret,
} = require('../util/config');
const { MD5_SUFFIX, md5 } = require('../util');
const BaseController = require('./Base');

class UserController extends BaseController {
  async login() {
    const { email, password } = this.ctx.request.body;

    if (!email) {
      this.responseClient(200, 2, '用户邮箱不可为空');
      return;
    }
    if (!password) {
      this.responseClient(200, 2, '密码不可为空');
      return;
    }

    try {
      const isUser = await this.ctx.model.User.findOne({
        email,
        password: md5(password + MD5_SUFFIX),
      });
      if (!isUser) {
        this.responseClient(200, 1, '用户名或者密码错误');
        return;
      }

      const token = this.createToken({ id: isUser._id });
      this.responseClient(200, 0, '登录成功', { token });
    } catch (error) {
      this.responseClient(error);
    }
  }

  async loginAdmin() {
    const { email, password } = this.ctx.request.body;

    if (!email) {
      this.responseClient(400, 2, '用户邮箱不可为空');
      return;
    }
    if (!password) {
      this.responseClient(400, 2, '密码不可为空');
      return;
    }
    try {
      const user = await this.ctx.model.User.findOne({
        email,
        password: md5(password + MD5_SUFFIX),
      });

      if (!user) {
        this.responseClient(400, 1, '用户名或者密码错误');
        return;
      }

      if (user.type !== 0) {
        this.responseClient(400, 1, '只有管理员才能登录后台！');
        return;
      }
      const token = this.createToken({ id: user._id });
      this.responseClient(200, 0, '登录成功', { token, id: user._id });
    } catch (error) {
      this.responseClient({ error });
    }
  }
  async register() {
    const {
      name,
      password,
      phone,
      email,
      introduce,
      type,
    } = this.ctx.request.body;

    if (!email) {
      this.responseClient(400, 2, '用户邮箱不可为空');
      return;
    }
    const reg = new RegExp( // 正则表达式
      '^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$'
    );

    if (!reg.test(email)) {
      this.responseClient(400, 2, '请输入格式正确的邮箱！');
      return;
    }
    if (!name) {
      this.responseClient(400, 2, '用户名不可为空');
      return;
    }
    if (!password) {
      this.responseClient(400, 2, '密码不可为空');
      return;
    }

    // 验证用户是否已经在数据库中
    try {
      const isUser = await this.ctx.model.User.findOne({ email });
      if (isUser) {
        this.responseClient(200, 1, '用户邮箱已存在！');
        return;
      }
      const user = await this.ctx.model.User.create({
        email,
        name,
        password: md5(password + MD5_SUFFIX),
        phone,
        type,
        introduce,
      });
      this.responseClient(200, 0, '注册成功', user);
    } catch (error) {
      this.responseClient(error);
    }
  }
  async delUser() {
    const { id } = this.ctx.request.body;

    try {
      const user = await this.ctx.model.User.findByIdAndDelete(id);

      if (!user) {
        this.responseClient(200, 1, '用户不存在');
        return;
      }
      this.responseClient(200, 0, '用户删除成功!');
    } catch (error) {
      this.responseClient(error);
    }
  }

  async currentUser() {
    const user = {};
    user.avatar = 'http://p61te2jup.bkt.clouddn.com/WechatIMG8.jpeg';
    user.notifyCount = 0;
    user.address = '广东省';
    user.country = 'China';
    user.group = 'wangtongxi';
    user.title = '交互专家';
    user.signature = '海纳百川，有容乃大';
    user.tags = [];
    user.geographic = {
      province: {
        label: '广东省',
        key: '330000',
      },
      city: {
        label: '广州市',
        key: '330100',
      },
    };
    this.responseClient(200, 0, '登录', user);
  }

  async getUser() {
    const { code } = this.ctx.request.body;
    if (!code) {
      this.responseClient(400, 2, 'code 缺失');
      return;
    }

    console.log('code', code);
    const params = { client_id, client_secret, code };
    const response = await this.ctx.curl(access_token_url, {
      method: 'POST',
      dataType: 'json',
      data: params,
    });

    const access_token = response.data.access_token;

    const url = user_url + '?access_token=' + access_token;

    const githup_user = await this.ctx.curl(url, {
      method: 'GET',
      dataType: 'json',
    });

    const oAuth_user = githup_user.data;

    if (!oAuth_user.id) {
      this.responseClient(400, 1, '授权登录失败', response);
      return;
    }

    try {
      const userinfo = await this.ctx.model.User.findOne({
        github_id: oAuth_user.id,
      });
      if (userinfo) {
        const token = this.createToken({ id: userinfo._id });
        this.responseClient(200, 0, '授权登录成功', {
          token,
          id: userinfo._id,
        });
      } else {
        const user_data = {
          github_id: oAuth_user.id,
          email: oAuth_user.email,
          password: oAuth_user.login,
          type: 2,
          avatar: oAuth_user.avatar_url,
          name: oAuth_user.login,
          location: oAuth_user.location,
        };

        const user = await this.ctx.model.User.create(user_data);
        const token = this.createToken({ id: user._id });

        this.responseClient(200, 0, '授权登录成功', { token, id: user._id });
      }
    } catch (error) {
      this.responseClient(error);
    }
  }
  async getUserList() {
    const keyword = this.ctx.request.query.keyword || '';
    const pageNum = parseInt(this.ctx.request.query.pageNum) || 1;
    const pageSize = parseInt(this.ctx.request.query.pageSize) || 10;
    let conditions = {};

    const reg = new RegExp(keyword, 'i');
    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;

    const responseData = { count: 0, list: [] };

    if (keyword) {
      conditions = {
        $or: [{ name: { $regex: reg } }, { email: { $regex: reg } }],
      };
    }
    // 待返回的字段
    const fields = {
      _id: 1,
      email: 1,
      name: 1,
      avatar: 1,
      phone: 1,
      introduce: 1,
      type: 1,
      create_time: 1,
    };
    const options = {
      skip,
      limit: pageSize,
      sort: { create_time: -1 },
    };
    try {
      const userCount = await this.ctx.model.User.countDocuments({});
      const userList = await this.ctx.model.User.find(
        conditions,
        fields,
        options
      );

      responseData.count = userCount;
      responseData.list = userList;

      this.responseClient(200, 0, 'success', responseData);
    } catch (error) {
      this.responseClient(error);
    }
  }
  async getUserInfo() {
    const secret = this.ctx.app.config.jwtSecret;
    const Token = this.ctx.request.header.authorization;
    const result = await this.ctx.app.jwt.verify(Token, secret);

    try {
      const userinfo = await this.ctx.model.User.findById(result.id);

      if (userinfo) {
        this.responseClient(200, 0, '操作成功!', userinfo);
      } else {
        this.responseClient(200, 1, '用户ID不存在!');
      }
    } catch (error) {
      this.responseClient(error);
    }
  }
}

module.exports = UserController;
