'use strict';

const BaseController = require('./Base');

class TimelineController extends BaseController {
  async addTimeline() {
    const {
      title,
      state,
      content,
      start_time,
      end_time,
    } = this.ctx.request.body;

    try {
      const isExist = await this.ctx.model.Timeline.findOne({ title });

      if (isExist) {
        this.responseClient(200, 1, '该时间线内容已存在');
        return;
      }

      const timeline = await this.ctx.model.Timeline.create({
        title,
        state,
        content,
        start_time,
        end_time,
      });

      this.responseClient(200, 0, '操作成功！', timeline);
    } catch (error) {
      console.log(error, 'error');
      this.responseClient(error);
    }
  }

  async delTimeline() {
    const { id } = this.ctx.request.body;

    try {
      const timeline = await this.ctx.model.Timeline.findByIdAndDelete(id);

      if (timeline) {
        this.responseClient(200, 0, '删除成功!', timeline);
      } else {
        this.responseClient(200, 0, '标签不存在!');
      }
    } catch (error) {
      this.responseClient(error);
    }
  }

  async getTimelineList() {
    const keyword = this.ctx.request.query.keyword || null;
    let state = this.ctx.request.query.state || '';
    const pageNum = parseInt(this.ctx.request.query.pageNum) || 1;
    const pageSize = parseInt(this.ctx.request.query.pageSize) || 10;
    let conditions = {};
    const responseData = { count: 0, list: [] };
    console.log(keyword, state, pageNum, pageSize);
    const reg = new RegExp(keyword, 'i'); // 不区分大小写
    state = parseInt(state);
    if (!state) {
      if (keyword) {
        conditions = {
          $or: [{ title: { $regex: reg } }, { content: { $regex: reg } }],
        };
      }
    } else if (state) {
      if (keyword) {
        conditions = {
          $and: [
            { $or: [{ state }] },
            { $or: [{ title: { $regex: reg } }, { content: { $regex: reg } }] },
          ],
        };
      } else {
        conditions = { state };
      }
    }

    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    const fields = {
      title: 1,
      content: 1,
      state: 1,
      start_time: 1,
      end_time: 1,
      // update_time: 1,
    }; // 待返回的字段
    const options = {
      skip,
      limit: pageSize,
      sort: { end_time: -1 },
    };

    try {
      const timelineCount = await this.ctx.model.Timeline.countDocuments({});
      const timeline = await this.ctx.model.Timeline.find(
        conditions,
        fields,
        options
      );

      responseData.count = timelineCount;
      responseData.list = timeline;

      this.responseClient(200, 0, '操作成功！', responseData);
    } catch (error) {
      console.error('Error:' + err);
    }
  }

  async getTimelineDetail() {
    const { id } = this.ctx.request.body;
    try {
      const timeline = await this.ctx.model.Timeline.findById(id);
      this.responseClient(200, 0, '操作成功', timeline);
    } catch (error) {
      this.responseClient(error);
    }
  }

  async updateTimeline() {
    const {
      id,
      title,
      state,
      content,
      start_time,
      end_time,
    } = this.ctx.request.body;

    try {
      const timeline = await this.ctx.model.Timeline.findByIdAndUpdate(id, {
        title,
        state,
        content,
        start_time,
        end_time,
        update_time: Date.now(),
      });

      this.responseClient(200, 0, '操作成功', timeline);
    } catch (error) {
      this.responseClient(error);
    }
  }
}

module.exports = TimelineController;
