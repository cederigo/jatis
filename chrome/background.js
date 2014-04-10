/*
 * A background page: http://developer.chrome.com/extensions/background_pages
 * 'It exists for the lifetime of your extension, and only one instance of it at a time is active'
 */

'use strict';


/*
 * Message
 *
 * show pageAction icon on active tab
 */
function showPageAction(cb) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.pageAction.show(tabs[0].id);
    cb();
  });
}

/*
 * Helpers
 */

function hidePageAction() {
  chrome.pageAction.hide();
}

/*
 * Message loop
 * http://developer.chrome.com/extensions/messaging
 */

var msgs = {
  'showPageAction': showPageAction //cant be done in the context of a content script

};

function handle(msg, sender, sendResponse) {

  if(!msgs[msg.type]) {
    return sendResponse({success: false, error: 'unknown message type ' + msg.type});
  }

  //handle message
  msgs[msg.type](function (err, data) {
    if (err) {
      return sendResponse({success: false, error: err.message});
    }

    //success
    sendResponse({success: true, data: data});

  });

}


//register listeners

chrome.runtime.onMessage.addListener(handle);
chrome.tabs.onSelectionChanged.addListener(hidePageAction);

