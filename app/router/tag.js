'use strict';

/**
 * @param {Egg.Application} app - egg application
 */

module.exports = ({ router, controller }) => {
  router.post('/addTag', controller.tag.addTag);
  router.post('/delTag', controller.tag.delTag);
  router.get('/getTagList', controller.tag.getTagList);
};
