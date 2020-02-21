"use strict";

const BaseController = require("./Base");

class ArticleController extends BaseController {
  async addArticle(ctx) {
    const {
      title,
      author,
      keyword,
      content,
      desc,
      img_url,
      tags,
      category,
      state,
      type,
      origin
    } = ctx.request.body;

    try {
      const article = await ctx.model.Article.create({
        title,
        author,
        keyword,
        content,
        desc,
        img_url,
        tags,
        category,
        state,
        type,

        origin
      });
      this.responseClient(200, 0, "保存成功", article);
    } catch (error) {
      console.log(error);
      this.responseClient(error);
    }
  }

  async delArticle() {
    const { id } = this.ctx.request.body;
    if (!id) {
      this.responseClient(200, 1, "文章不存在 ！");
      return;
    }
    try {
      await this.ctx.model.Article.findByIdAndDelete(id);
      this.responseClient(200, 0, "删除成功!");
    } catch (error) {
      this.responseClient(200, 1, "文章不存在", error);
    }
  }
  // 后台文章列表
  async getArticleListAdmin() {
    const keyword = this.ctx.query.keyword || null;
    let state = this.ctx.query.state || "";
    const likes = this.ctx.query.likes || "";
    const pageNum = parseInt(this.ctx.query.pageNum) || 1;
    const pageSize = parseInt(this.ctx.query.pageSize) || 10;
    const reg = new RegExp(keyword, "i"); // 不区分大小写
    let conditions = {};
    if (!state) {
      if (keyword) {
        conditions = {
          $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }]
        };
      }
    } else if (state) {
      state = parseInt(state);
      if (keyword) {
        conditions = {
          $and: [
            { $or: [{ state }] },
            {
              $or: [
                { title: { $regex: reg } },
                { desc: { $regex: reg } },
                { keyword: { $regex: reg } }
              ]
            }
          ]
        };
      } else {
        conditions = { state };
      }
    }
    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    const responseData = { count: 0, list: [] };
    // 待返回的字段
    const fields = {
      title: 1,
      author: 1,
      keyword: 1,
      // content: 1,
      desc: 1,
      img_url: 1,
      tags: 1,
      category: 1,
      state: 1,
      type: 1,
      origin: 1,
      comments: 1,
      like_User_id: 1,
      meta: 1,
      create_time: 1
      // update_time: 1,
    };
    const options = {
      skip,
      limit: pageSize,
      sort: { create_time: -1 }
    };

    try {
      const count = await this.ctx.model.Article.countDocuments({});
      const articles = await this.ctx.model.Article.find(
        conditions,
        fields,
        options
      ).populate([
        { path: "tags" },
        { path: "comments" },
        { path: "category" }
      ]);
      if (likes) {
        articles.sort((a, b) => {
          return b.meta.likes - a.meta.likes;
        });
      }
      responseData.count = count;
      responseData.list = articles;

      this.responseClient(200, 0, "操作成功！", responseData);
    } catch (error) {
      console.error("find Error:" + error);
      throw error;
    }
  }

  async updateArticle() {
    // if (!req.session.userInfo) {
    // 	responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
    // 	return;
    // }
    const {
      title,
      author,
      keyword,
      content,
      desc,
      img_url,
      tags,
      category,
      state,
      type,
      origin,
      id
    } = this.ctx.request.body;
    //  this.responseClient( 200, 0, "操作成功", {
    //   title,
    //   author,
    //   keyword,
    //   content,
    //   desc,
    //   img_url,
    //   tags,
    //   category,
    //   state,
    //   type,
    //   origin,
    //   id
    // });
    try {
      const acticle = await this.ctx.model.Article.findByIdAndUpdate(id, {
        title,
        author,
        keyword: keyword ? keyword : [],
        content,
        desc,
        img_url,
        tags,
        category,
        state,
        type,
        origin
      });

      this.responseClient(200, 0, "操作成功", acticle);
    } catch (error) {
      console.log(err);
      this.responseClient(err);
    }
  }

  // 文章详情
  async getArticleDetailByType() {
    const { type } = this.ctx.request.body;
    if (!type) {
      this.responseClient(res, 200, 1, "文章不存在 ！");
      return;
    }
    Article.findOne({ type }, (Error, data) => {
      if (Error) {
        console.error("Error:" + Error);
        // throw error;
      } else {
        data.meta.views = data.meta.views + 1;
        Article.updateOne({ type }, { meta: data.meta })
          .then(result => {
            this.responseClientresponseClient(200, 0, "操作成功 ！", data);
          })
          .catch(err => {
            console.error("err :", err);
            throw err;
          });
      }
    })
      .populate([
        { path: "tags", select: "-_id" },
        { path: "category", select: "-_id" },
        { path: "comments", select: "-_id" }
      ])
      .exec((err, doc) => {
        // console.log("doc:");          // aikin
        // console.log("doc.tags:",doc.tags);          // aikin
        // console.log("doc.category:",doc.category);           // undefined
      });
  }

  // 文章详情
  async getArticleDetail() {
    const { id } = this.ctx.request.body;
    console.log(id);

    const type = Number(this.ctx.request.body.type) || 1; // 文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
    const filter = Number(this.ctx.request.body.filter) || 1; // 文章的评论过滤 => 1: 过滤，2: 不过滤

    // 普通文章
    if (type === 1) {
      if (!id) {
        this.responseClient(200, 1, "文章不存在 ！");
        return;
      }

      const article = await this.ctx.model.Article.findByIdAndUpdate(
        id,
        { $inc: { "meta.views": 1 } }
        // { new: true }
      ).populate([
        { path: "tags" },
        { path: "category" },
        { path: "comments" }
      ]);

      if (filter === 1) {
        const arr = article.comments;
        for (let i = arr.length - 1; i >= 0; i--) {
          const e = arr[i];
          // 草稿状态  未发布
          if (e.state !== 1) {
            arr.splice(i, 1);
          }
          const newArr = e.other_comments;
          const length = newArr.length;
          if (length) {
            for (let j = length - 1; j >= 0; j--) {
              const item = newArr[j];
              if (item.state !== 1) {
                newArr.splice(j, 1);
              }
            }
          }
        }
      }

      this.responseClient(200, 0, "操作成功 ！", article);

      // 2: 简历，3: 管理员介绍
    } else {
      console.log(type === 3, " // 2: 简历，3: 管理员介绍");

      const article = await this.ctx.model.Article.findOneAndUpdate(
        { type },
        { $inc: { "meta.views": 1 } }
        // { new: true }
      ).populate([
        { path: "tags" },
        { path: "category" },
        { path: "comments" }
      ]);

      if (!article) {
        this.responseClient(200, 1, "文章不存在 ！");
        return;
      }

      if (filter === 1) {
        const arr = article.comments;
        for (let i = arr.length - 1; i >= 0; i--) {
          const e = arr[i];
          if (e.state !== 1) {
            arr.splice(i, 1);
          }
          const newArr = e.other_comments;
          const length = newArr.length;
          if (length) {
            for (let j = length - 1; j >= 0; j--) {
              const item = newArr[j];
              if (item.state !== 1) {
                newArr.splice(j, 1);
              }
            }
          }
        }
      }
      this.responseClient(200, 0, "操作成功 ！", article);
    }
  }
  // 文章详情
  async getArticleComment() {
    const { id } = this.ctx.request.body;
    console.log(id);

    const type = Number(this.ctx.request.body.type) || 1; // 文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
    const filter = Number(this.ctx.request.body.filter) || 1; // 文章的评论过滤 => 1: 过滤，2: 不过滤

    // 普通文章
    if (type === 1) {
      if (!id) {
        this.responseClient(200, 1, "文章不存在 ！");
        return;
      }

      const article = await this.ctx.model.Article.findById(id, {}).populate([
        { path: "comments" }
      ]);

      if (filter === 1) {
        const arr = article.comments;
        for (let i = arr.length - 1; i >= 0; i--) {
          const e = arr[i];
          // 草稿状态  未发布
          if (e.state !== 1) {
            arr.splice(i, 1);
          }
          const newArr = e.other_comments;
          const length = newArr.length;
          if (length) {
            for (let j = length - 1; j >= 0; j--) {
              const item = newArr[j];
              if (item.state !== 1) {
                newArr.splice(j, 1);
              }
            }
          }
        }
      }

      this.responseClient(200, 0, "操作成功 ！", article);

      // 2: 简历，3: 管理员介绍
    } else {
      console.log(type === 3, " // 2: 简历，3: 管理员介绍");

      const article = await this.ctx.model.Article.findOneAndUpdate(
        { type },
        { $inc: { "meta.views": 1 } }
        // { new: true }
      ).populate([
        { path: "tags" },
        { path: "category" },
        { path: "comments" }
      ]);

      if (!article) {
        this.responseClient(200, 1, "文章不存在 ！");
        return;
      }

      if (filter === 1) {
        const arr = article.comments;
        for (let i = arr.length - 1; i >= 0; i--) {
          const e = arr[i];
          if (e.state !== 1) {
            arr.splice(i, 1);
          }
          const newArr = e.other_comments;
          const length = newArr.length;
          if (length) {
            for (let j = length - 1; j >= 0; j--) {
              const item = newArr[j];
              if (item.state !== 1) {
                newArr.splice(j, 1);
              }
            }
          }
        }
      }
      this.responseClient(200, 0, "操作成功 ！", article);
    }
  }
  // 前台文章列表
  async getArticleList() {
    const query = this.ctx.request.query;
    const keyword = query.keyword || null;
    let state = query.state || "";
    const likes = query.likes || "";
    const tag_id = query.tag_id || "";
    const category_id = query.category_id || "";
    const article = query.article || "";
    const pageNum = parseInt(query.pageNum) || 1;
    let pageSize = parseInt(query.pageSize) || 10;
    // 如果是文章归档 返回全部文章
    const responseData = { count: 0, list: [] };
    if (article) {
      pageSize = 1000;
    }
    const reg = new RegExp(keyword, "i"); // 不区分大小写
    let conditions = {};
    if (!state) {
      if (keyword) {
        conditions = {
          $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }]
        };
      }
    } else if (state) {
      state = parseInt(state);
      if (keyword) {
        const reg = new RegExp(keyword, "i");
        conditions = {
          $and: [
            { $or: [{ state }] },
            {
              $or: [
                { title: { $regex: reg } },
                { desc: { $regex: reg } },
                { keyword: { $regex: reg } }
              ]
            }
          ]
        };
      } else {
        conditions = { state };
      }
    }

    let fields = {
      title: 1,
      desc: 1,
      img_url: 1,
      tags: 1,
      category: 1,
      meta: 1,
      create_time: 1
    };
    if (article) {
      fields = {
        title: 1,
        create_time: 1
      };
    }
    const options = {
      skip,
      limit: pageSize,
      sort: { create_time: -1 }
    };
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;

    try {
      const count = await this.ctx.model.Articlec.countDocuments({});
      responseData.count = count;
      const result = await this.ctx.model.Articlec.find(
        conditions,
        fields,
        options
      );

      const newList = [];
      if (likes) {
        // 根据热度 likes 返回数据
        result.sort((a, b) => {
          return b.meta.likes - a.meta.likes;
        });
        responseData.list = result;
      } else if (category_id) {
        // console.log('category_id :', category_id);
        // 根据 分类 id 返回数据
        result.forEach(item => {
          if (item.category.indexOf(category_id) > -1) {
            newList.push(item);
          }
        });
        const len = newList.length;
        responseData.count = len;
        responseData.list = newList;
      } else if (tag_id) {
        // console.log('tag_id :', tag_id);
        // 根据标签 id 返回数据
        result.forEach(item => {
          if (item.tags.indexOf(tag_id) > -1) {
            newList.push(item);
          }
        });
        const len = newList.length;
        responseData.count = len;
        responseData.list = newList;
      } else if (article) {
        const archiveList = [];
        const obj = {};

        // 按年份归档 文章数组
        result.forEach(e => {
          const year = e.create_time.getFullYear();
          // let month = e.create_time.getMonth()
          if (!obj[year]) {
            obj[year] = [];
            obj[year].push(e);
          } else {
            obj[year].push(e);
          }
        });
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            const item = {};
            item.year = key;
            item.list = element;
            archiveList.push(item);
          }
        }
        archiveList.sort((a, b) => {
          return b.year - a.year;
        });
        responseData.list = archiveList;
      } else {
        responseData.list = result;
      }
      responseClient(res, 200, 0, "操作成功！", responseData);
    } catch (error) {}
    console.log("Error:" + error);
  }
}

module.exports = ArticleController;
