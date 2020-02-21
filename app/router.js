'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  //   fs.readdirSync(__dirname).forEach(file => {

  //     require(`./router/${file}`)(app);
  //   });

  require('./router/article')(app);

  require('./router/comment')(app);

  require('./router/tag')(app);

  require('./router/category')(app);

  //  require('./router/link')(app)

  require('./router/message')(app);

  //  require('./router/project')(app)

  require('./router/timeline')(app);

  require('./router/user')(app);
};
