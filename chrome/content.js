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
  return function (index) {
    var $m = $('a[href*="' + this + '"]').closest('tr').clone();
    $m.removeClass('altColor rowColor');
    $m.addClass(index % 2 ===  0 ? 'altColor' : 'rowColor');
    $dest.append($m);
  };
}

function render () {
  var
    name = $('.inheritance > li:last').html(), //ex. java.lang.String
    methods = db[name].methods,
    $tpl = $(template);

  //fill template with popular methods
  $.each(methods, copy_method($tpl.find('#popular-methods')));

  //insert in existing dom
  $('.description').before($tpl);

}

/*
 * we are triggered on all frames, so first check that we are on the right one;
 * based on highlighted top navigation element ;-)
 * note: type 'Class' is for classes & interfaces
 */
var type = $('.navBarCell1Rev').html(); // [package,Class]
if (type === 'Class') {
  render();
}

//we can communicate with our background script ;-)
//http://developer.chrome.com/extensions/messaging
