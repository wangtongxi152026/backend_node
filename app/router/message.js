'use strict';

/**
 * @param {Egg.Application} app - egg application
 */

module.exports = ({ router, controller,middleware }) => {
  router.post('/addMessage', controller.message.addMessage);
  router.post('/addReplyMessage', controller.message.addReplyMessage);
  router.post('/delMessage', controller.message.delMessage);
  router.post('/getMessageDetail', controller.message.getMessageDetail);
  router.get('/getMessageList', controller.message.getMessageList);
};
