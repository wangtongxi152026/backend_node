'use strict';

/**
 * @param {Egg.Application} app - egg application
 */

module.exports = ({ router, controller }) => {

  router.post('/addCategory', controller.category.addCategory);
  router.post('/delCategory', controller.category.delCategory);
  router.get('/getCategoryList', controller.category.getCategoryList);

};
