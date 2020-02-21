/* eslint valid-jsdoc: 'off' */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1580982631997_7259';

  // config.middleware = ['jsonError', 'authToken'];
  config.middleware = [ 'jsonError' ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  config.jsonError = {
    // postFormat: (e, { stack, ...rest }) => {
    //   console.log(e);
    //   process.env.NODE_ENV === 'production' ? rest : { stack, ...rest };
    // }
  };

  config.jwtSecret = 'www.wangtongxi.cn';


  config.mongoose = {
    client: {
      url: 'mongodb://localhost:27017/Blog123',
      options: {
        useUnifiedTopology: true,
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        // user: 'xxxx', // 数据库用户名
        // pass: 'xxxx',     // 数据库密码
        // dbName: 'PieCake'    // 数据库名
      },
    },
  };

  config.security = {
    csrf: false,
  };

  return {
    ...config,
    ...userConfig,
  };
};
