'use strict';

const BaseController = require('./Base');

// 获取全部标签
class TagController extends BaseController {
  async getTagList() {
    const keyword = this.ctx.request.query.keyword || null;
    const pageNum = parseInt(this.ctx.request.query.pageNum) || 1;
    const pageSize = parseInt(this.ctx.request.query.pageSize) || 10;

    let conditions = {};

    const reg = new RegExp(keyword, 'i');

    if (keyword) {
      conditions = {
        $or: [{ name: { $regex: reg } }, { desc: { $regex: reg } }],
      };
    }
    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    const responseData = {
      count: 0,
      list: [],
    };
    const fields = {
      _id: 1,
      name: 1,
      desc: 1,
      // icon: 1,
      // create_time: 1,
      // update_time: 1,
    }; // 待返回的字段
    const options = {
      skip,
      limit: pageSize,
      sort: { create_time: -1 },
    };

    try {
      const tagsCount = await this.ctx.model.Tag.countDocuments(conditions);
      responseData.count = tagsCount;

      const tags = await this.ctx.model.Tag.find(conditions, fields, options);
      responseData.list = tags;

      this.responseClient(200, 0, 'success', responseData);
    } catch (error) {
      this.responseClient(error);
    }
  }

  async delTag() {
    const { id } = this.ctx.request.body;

    try {
      const tag = await this.ctx.model.Tag.findByIdAndDelete(id);

      if (tag) {
        this.responseClient(200, 0, '删除成功!', tag);
      } else {
        this.responseClient(200, 0, '标签不存在!');
      }
    } catch (error) {
      this.responseClient(error);
    }
  }

  async addTag() {
    const { name, desc } = this.ctx.request.body;

    const istag = await this.ctx.model.Tag.findOne({ name });

    if (istag) {
      this.responseClient(200, 1, '该标签已存在');
      return;
    }

    try {
      const tag = await this.ctx.model.Tag.create({ name, desc });

      this.responseClient(200, 0, '添加成功', tag);
    } catch (error) {
      this.responseClient({ error });
    }
  }
}

module.exports = TagController;
