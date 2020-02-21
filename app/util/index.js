
const crypto = require('crypto');
module.exports = {
  MD5_SUFFIX: 'www.wangtongxi.cn',
  md5(pwd) {
    const md5 = crypto.createHash('md5');
    return md5.update(pwd).digest('hex');
  },


  // 时间 格式化成 2018-12-12 12:12:00
  timestampToTime(timestamp) {
    const date = new Date(timestamp);
    const Y = date.getFullYear() + '-';
    const M =
      (date.getMonth() + 1 < 10
        ? '0' + (date.getMonth() + 1)
        : date.getMonth() + 1) + '-';
    const D =
      date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
    const h =
      date.getHours() < 10
        ? '0' + date.getHours() + ':'
        : date.getHours() + ':';
    const m =
      date.getMinutes() < 10
        ? '0' + date.getMinutes() + ':'
        : date.getMinutes() + ':';
    const s =
      date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
  },
};
