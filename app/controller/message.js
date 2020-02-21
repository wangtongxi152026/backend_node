'use strict';

const Base = require('./Base');

class MessageController extends Base {
  async addMessage() {
    const { user_id, content, email, phone, name } = this.ctx.request.body;

    if (!user_id) {
      // 直接保存留言内容
      try {
        const message = this.ctx.model.Message.create({
          content,
          email,
          phone,
          name,
        });
        this.responseClient(200, 0, '添加成功', message);
      } catch (error) {

        this.responseClient({ error });
      }
    }

    // 如果用户已经注册的，保存用户的信息，再保存留言内容
    try {
      const user = await this.ctx.model.User.findById(user_id);
      if (user) {
        const message = await this.ctx.model.Message.create({
          user_id: user._id,
          name: name ? name : user.name,
          avatar: user.avatar,
          phone: user.phone,
          introduce: user.introduce,
          content,
          email: email ? email : user.email,
        });

        this.responseClient(200, 0, '添加成功', message);
      }
    } catch (error) {
      this.responseClient(error);
    }
  }

  async addReplyMessage() {
    // if (!req.session.userInfo) {
    //   responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
    //   return;
    // }
    const state = Number(this.ctx.request.body.state);
    const { id, content } = this.ctx.request.body;
    try {
      const message = await this.ctx.model.Message.findById(id);

      const list = message.reply_list.push({ content });

      const messageRes = await this.ctx.model.Message.findByIdAndUpdate(id, {
        state,
        reply_list: list,
      });

      // const messageRes = await this.ctx.model.Message.findByIdAndUpdate(id, {
      //   $set: { state },
      //   $push: { reply_list: content }
      // })

      this.responseClient(200, 0, '操作成功', messageRes);
    } catch (error) {
      responseClient(error);
    }
  }

  async delMessage() {
    const { id } = this.ctx.request.body;

    try {
      const message = await this.ctx.model.Message.findByIdAndDelete(id);

      if (!message) {
        this.responseClient(200, 1, '留言不存在或者已经删除！');
      }

      this.responseClient(200, 0, '删除成功!');
    } catch (error) {
      this.responseClient(error);
    }
  }

  async getMessageDetail() {
    // if (!req.session.userInfo) {
    //   responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
    //   return;
    // }
    const { id } = this.ctx.request.body;
    try {
      const message = await this.ctx.model.Message.findById(id);

      thisresponseClient(200, 0, '操作成功！', message);
    } catch (error) {
      this.responseClient(error);
    }
  }
  async getMessageList() {

    const keyword = this.ctx.request.query.keyword || null;
    let state = this.ctx.request.query.state || '';
    const pageNum = parseInt(this.ctx.request.query.pageNum) || 1;
    const pageSize = parseInt(this.ctx.request.query.pageSize) || 10;


    let conditions = {};
    let fields = {};
    let options = {};
    const responseData = { count: 0, list: [] };

    const reg = new RegExp(keyword, 'i'); // 不区分大小写

    if (state === '') {
      if (keyword) {
        conditions = { content: { $regex: reg } };
      }
    } else if (state) {
      state = parseInt(state);
      if (keyword) {
        conditions = {
          $and: [
            { $or: [{ state }] },
            { $or: [{ content: { $regex: reg } }] },
          ],
        };
      } else {
        conditions = { state };
      }
    } else {
      state = 0;
      if (keyword) {
        conditions = {
          $and: [
            { $or: [{ state }] },
            { $or: [{ content: { $regex: reg } }] },
          ],
        };
      } else {
        conditions = { state };
      }
    }

    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;

    // 待返回的字段
    fields = {
      user_id: 1,
      name: 1,
      avatar: 1,
      phone: 1,
      introduce: 1,
      content: 1,
      email: 1,
      state: 1,
      reply_list: 1,
      create_time: 1,
      // update_time: 1,
    };
    options = {
      skip,
      limit: pageSize,
      sort: { create_time: -1 },
    };

    try {
      const msgCount = await this.ctx.model.Message.countDocuments({});
      const message = await this.ctx.model.Message.find(
        conditions,
        fields,
        options
      );

      responseData.count = msgCount;
      responseData.list = message;

      this.responseClient(200, 0, 'success', responseData);
    } catch (error) {
      this.responseClient({ error });
    }
  }
}

module.exports = MessageController;
