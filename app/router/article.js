"use strict";

/**
 * @param {Egg.Application} app - egg application
 */

module.exports = ({ router, controller,middleware }) => {
  // api 接口
  const auth = middleware.authToken();
  router.post("/addArticle", controller.article.addArticle);

  router.post("/updateArticle", controller.article.updateArticle);
  router.post("/delArticle", controller.article.delArticle);
  router.get("/getArticleList", controller.article.getArticleList);
  router.get("/getArticleListAdmin", controller.article.getArticleListAdmin);
  router.post("/getArticleDetail", controller.article.getArticleDetail);
  // router.post('/likeArticle', controller.article.likeArticle)
};
