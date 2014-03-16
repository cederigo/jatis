/*
 * A content script: http://developer.chrome.com/extensions/content_scripts
 * match: ['http://docs.oracle.com/*', 'https://docs.oracle.com/*']
 */

'use strict';

var
  wrapper = '<div class="popular"><ul class="blockList"><li class="blockList"><ul class="blockList"><li id="popular" class="blockList"></li></ul></li></ul></div>',
  $ = window.jQuery;

/*
 * we are triggered on all frames, so first check that we are on interesting one
 * based on highlighted top navigation element ;-)
 */
var type = $('.navBarCell1Rev').html(); // [package,Class]

//type class includes Interfaces
if (type !== 'Class') {
  //do nothing
  return true;
}

//our wrapper
$('.summary').before($(wrapper));

$('#popular').html('<h3>Popular</h3>');

//we can communicate with our background script ;-)
//http://developer.chrome.com/extensions/messaging
