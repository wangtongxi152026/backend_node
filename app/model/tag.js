/**
 * Tag model module
 * @file 标签数据模型
 * @module model/tag
 * @author wangtongxi <https://github.com/wangtongxi>
 */

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  // 标签模型
  const tagSchema = new Schema({
    // 标签名称
    name: { type: String, required: true, validate: /\S+/ },

    // 标签描述
    desc: String,

    // 图标
    icon: String,

    // 发布日期
    create_time: { type: Date, default: Date.now },

    // 最后修改日期
    update_time: { type: Date, default: Date.now },
  });
  // 标签模型
  return mongoose.model('Tag', tagSchema);
};
