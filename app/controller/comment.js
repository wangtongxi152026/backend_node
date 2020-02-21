"use strict";

const BaseController = require("./Base");

class CommentController extends BaseController {
  async addComment() {
    const { article_id, user_id, content } = this.ctx.request.body;

    const isUser = await this.ctx.model.User.findById(user_id);

    if (!isUser) {
      this.responseClient(200, 1, "用户不存在");
      return;
    }

    const userInfo = {
      user_id: isUser._id,
      name: isUser.name,
      type: isUser.type,
      avatar: isUser.avatar
    };

    const comment = await this.ctx.model.Comment.create({
      article_id,
      content,
      user_id,
      user: userInfo
    });

    try {
      const commentResult = await this.ctx.model.Article.findByIdAndUpdate(
        article_id,
        {
          $push: { comments: comment._id },
          $inc: { "meta.comments": 1 },
          is_handle: 0
        }
      );

      this.responseClient(200, 0, "操作成功 ！");
      return
    } catch (error) {
      this.responseClient(error);
    }
  }
  async addThirdComment() {
    // if (!req.session.userInfo) {
    //   responseClient(
    //     res,
    //     200,
    //     1,
    //     "您还没登录,或者登录信息已过期，请重新登录！"
    //   )
    //   return;
    // }

    const {
      article_id,
      comment_id,
      user_id,
      content,
      to_user
    } = this.ctx.request.body;

    // const comment = await this.ctx.model.Comment.findById(comment_id);
    const isUser = await this.ctx.model.User.findById(user_id);

    if (!isUser) {
      this.responseClient(200, 1, "用户不存在");
    }

    const userInfo = {
      user_id: isUser._id,
      name: isUser.name,
      type: isUser.type,
      avatar: isUser.avatar
    };

    const item = {
      user: userInfo,
      content,
      to_user: JSON.parse(to_user)
    };

    try {
      this.ctx.model.Comment.findByIdAndUpdate(comment_id, {
        is_handle: 2,
        $push: { other_comments: item }
      });

      const acticle = await this.ctx.model.Article.findByIdAndUpdate(
        article_id,
        {
          $inc: { "meta.comments": 1 }
        }
      );

      this.responseClient(200, 0, "操作成功 ！", acticle);
    } catch (error) {
      this.responseClient(error);
    }
  }
  async changeComment() {
    // if (!this.ctx.request.session.userInfo) {
    // 	responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
    // 	return;
    // }
    const { id, state } = this.ctx.request.body;

    try {
      const comment = await this.ctx.model.Comment.findByIdAndUpdate(id, {
        state: Number(state),
        is_handle: 1
      });
      this.responseClient(res, 200, 0, "操作成功", comment);
    } catch (error) {
      this.responseClient(error);
    }
  }
  async changeThirdComment() {
    const { id, state, index } = this.ctx.request.body;
    const i = index ? Number(index) : 0;
    const comment = await this.ctx.model.Comment.findById(id);
    if (comment.other_comments.length > 0) {
      comment.other_comments[i].state = Number(state);
      try {
        const updataComment = await this.ctx.modelComment.findByIdAndUpdate(
          id,
          {
            other_comments: comment.other_comments,
            is_handle: 1
          }
        );

        this.responseClient(200, 0, "操作成功", updataComment);
      } catch (error) {
        this.responseClient(error);
      }
    } else {
      this.responseClient(200, 1, "第三方评论不存在！", comment);
    }
  }
  async getCommentList() {
    const keyword = this.ctx.request.query.keyword || null;
    const is_handle = parseInt(this.ctx.request.query.is_handle) || 0;
    // console.log('is_handle ', is_handle);
    const pageNum = parseInt(this.ctx.request.query.pageNum) || 1;
    const pageSize = parseInt(this.ctx.request.query.pageSize) || 10;
    let conditions = {};

    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    const responseData = {
      count: 0,
      list: []
    };

    const reg = new RegExp(keyword, "i"); // 不区分大小写
    if (keyword) {
      if (is_handle) {
        conditions = {
          content: { $regex: reg },
          is_handle
        };
      } else {
        conditions = {
          content: { $regex: reg }
        };
      }
    }
    if (is_handle) {
      conditions = {
        is_handle
      };
      console.log("conditions", conditions);
    }
    // 待返回的字段
    const fields = {
      article_id: 1,
      content: 1,
      is_top: 1,
      likes: 1,
      user_id: 1,
      user: 1,
      other_comments: 1,
      state: 1,
      is_handle: 1,
      create_time: 1
      // update_time: 1,
    };
    const options = {
      skip,
      limit: pageSize,
      sort: { create_time: -1 }
    };

    try {
      const commentCount = await this.ctx.model.Comment.countDocuments({});
      const comment = await this.ctx.model.Comment.find(
        conditions,
        fields,
        options
      );

      responseData.count = commentCount;

      responseData.list = comment;

      this.responseClient(200, 0, "操作成功！", responseData);
    } catch (error) {
      this.responseClient(error);
    }
  }
}

module.exports = CommentController;
