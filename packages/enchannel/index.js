// Import the operators we use
require("rxjs/add/operator/filter");
require("rxjs/add/operator/map");

const createMessage = require("@nteract/messaging").createMessage;
console.log("heres cm ", createMessage);

/**
 * Send a shutdown request message
 *
 * Can also be used to restart
 * @param  {object} channels       object containing channels
 * @param  {boolean} restart=false should the shutdown request actually restart
 *                                 the kernel
 * @return {Promise}
 */
function shutdownRequest(channels, restart) {
  const shutDownRequest = createMessage("shutdown_request");
  shutDownRequest.content = { restart: Boolean(restart) };

  const shutDownReply = channels.shell
    .childOf(shutDownRequest)
    .filter(msg => msg.header.msg_type === "shutdown_reply")
    .map(msg => msg.content);

  return new Promise(resolve => {
    shutDownReply.subscribe(content => {
      if (!restart) {
        channels.shell.complete();
        channels.iopub.complete();
        channels.stdin.complete();
        channels.control.complete();
        if (channels.heartbeat) channels.heartbeat.complete();
      }
      resolve();
    });

    channels.shell.next(shutDownRequest);
  });
}

module.exports = {
  shutdownRequest
};
