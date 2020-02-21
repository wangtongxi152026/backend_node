'use strict';

const BaseController = require('./Base');
// 获取全部分类
class CategoryController extends BaseController {
  async getCategoryList() {
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

    const fields = { name: 1, desc: 1, create_time: 1 }; // 待返回的字段
    const options = {
      skip,
      limit: pageSize,
      sort: { create_time: -1 },
    };

    try {
      const CategoryCount = await this.ctx.model.Category.countDocuments(conditions);
      responseData.count = CategoryCount;


      const Category = await this.ctx.model.Category.find(conditions, fields, options);
      responseData.list = Category;

      this.responseClient(200, 0, 'success', responseData);
    } catch (error) {
      this.responseClient(error);
    }
  }

  async delCategory() {

    const { id } = this.ctx.request.body;

    try {
      const tag = await this.ctx.model.Category.findByIdAndDelete(id);

      if (tag) {
        this.responseClient(200, 0, '删除成功!', tag);
      } else {
        this.responseClient(200, 0, '该分类不存在!');
      }
    } catch (error) {
      this.responseClient(error);
    }
  }

  async addCategory() {
    const { name, desc } = this.ctx.request.body;

    const isExist = await this.ctx.model.Category.findOne({ name });

    if (isExist) {
      this.responseClient(200, 1, '该分类已存在');
      return;
    }

    try {
      const tag = await this.ctx.model.Category.create({ name, desc });

      this.responseClient(200, 0, '添加成功', tag);
    } catch (error) {
      this.responseClient(error);
    }
  }
}

module.exports = CategoryController;
