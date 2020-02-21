/**
 * TimeAxis model module.
 * @file 时间轴模型
 * @module model/timeAxis
 * @author wangtongxi <https://github.com/wangtongxi>
 */

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // 时间轴模型
  const timelineSchema = new Schema({
    // 标题
    title: { type: String, required: true },

    // 时间轴内容
    content: { type: String, required: true },

    // 状态 1 是已经完成 ，2 是正在进行，3 是没完成
    state: { type: Number, default: 1 },

    // 开始日期
    start_time: { type: Date, default: Date.now },

    // 结束日期
    end_time: { type: Date, default: Date.now },

    // 最后修改日期
    update_time: { type: Date, default: Date.now },
  });

  return mongoose.model('Timeline', timelineSchema);
};
