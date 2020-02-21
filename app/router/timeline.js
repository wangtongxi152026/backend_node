'use strict';

/**
 * @param {Egg.Application} app - egg application
 */

module.exports = ({ router, controller }) => {

  router.post('/addTimeAxis', controller.timeline.addTimeline);
  router.post('/updateTimeAxis', controller.timeline.updateTimeline);
  router.post('/delTimeAxis', controller.timeline.delTimeline);
  router.get('/getTimeAxisList', controller.timeline.getTimelineList);
  router.post('/getTimeAxisDetail', controller.timeline.getTimelineDetail);

};
