/*
 * A content script: http://developer.chrome.com/extensions/content_scripts
 * match: ['http://docs.oracle.com/*', 'https://docs.oracle.com/*']
 */

'use strict';

var
  db = window.db,
  template = window.template,
  $ = window.jQuery;

function copy_method ($dest) {
  return function () {
    var $m = $('a[href*="' + this + '"]').closest('tr');
    $dest.append($m.clone());
  };
}

function init () {
  var
    name = $('.inheritance > li:last').html(), //ex. java.lang.String
    methods = db[name].methods;

  console.log('popular methods: ', methods);

  //wrapper
  $('.summary').before($(template));

  //copy methods over to wrapper template
  $.each(methods, copy_method($('#popular-methods')));

}

/*
 * we are triggered on all frames, so first check that we are on the right one;
 * based on highlighted top navigation element ;-)
 * note: type 'Class' is for classes & interfaces
 */
var type = $('.navBarCell1Rev').html(); // [package,Class]
if (type === 'Class') {
  init();
}

//we can communicate with our background script ;-)
//http://developer.chrome.com/extensions/messaging
