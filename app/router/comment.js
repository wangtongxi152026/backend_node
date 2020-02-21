
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */

module.exports = ({ router, controller,middleware }) => {
  const auth = middleware.authToken();
  router.post('/addComment',auth, controller.comment.addComment);
  router.post('/addThirdComment', controller.comment.addThirdComment);
  router.post('/changeComment', controller.comment.changeComment);
  router.post('/changeThirdComment', controller.comment.changeThirdComment);
  router.get('/getCommentList', controller.comment.getCommentList);

};

