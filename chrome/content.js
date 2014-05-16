/*
 * A content script: http://developer.chrome.com/extensions/content_scripts
 * match: ['http://docs.oracle.com/*', 'https://docs.oracle.com/*']
 */

'use strict';

var
  template = window.template,
  server = window.server,
  $ = window.jQuery,
  methods = {}; //lookup methods by signature

function sendMessage(type) {
  chrome.runtime.sendMessage({type: type}, function(response) {
    console.log('got response: ' + response);
  });
}

function copy_method ($dest) {
  return function (index) {
    console.log('copy method: ', this);
    var $m = $(methods[this]).clone();
    $m.removeClass('altColor rowColor');
    $m.addClass(index % 2 ===  0 ? 'altColor' : 'rowColor');
    $dest.append($m);
  };
}

/*
 * find all methods in DOM and make them accessible by their signature.
 * TODO: find methods up the inheritance tree
 */
function populate_methods () {

  $('.overviewSummary[summary^="Method"] tr')
    .each(function () {
      var
        href = $(this).find('.colLast a').attr('href'),
        sig = '';

      if (href && href.indexOf('#') >= 0) {
        sig = href.replace(/.*#/g, '');

        console.log('signature (original): ', sig);

        //HACK 1: transform method signature so that the arguments are not fully qualified class names
        //HACK 2: remove space after comma
        //ex: startsWith(java.lang.String, int) -> startsWith(String,int)
        sig = sig.replace(/[\w.]*\./g, '');
        sig = sig.replace(/, /g,',');

        console.log('signature (transformed): ', sig);

        //lookup by signature
        methods[sig] = this;
      }
    }
  );

}

function render () {
  var
    name = $('.inheritance > li:last').html(), //ex. java.lang.String
    $tpl = $(template);

  //visual something
  sendMessage('showPageAction');
  $tpl.find('.title').prepend($('<img>').attr('src', chrome.extension.getURL('icon48.png')));
  $tpl.find('.info').html('Loading...');
  $tpl.find('.btn-more').click(function (e) {
    e.preventDefault();
    $tpl.find('.popular-height').css('height', 'auto');
    $(this).hide();
  });

  //insert in existing dom
  $('.description').before($tpl);

  populate_methods();

  if (!name) {
    console.log('oops. class name not found');
    return $tpl.find('.info').html('Nothing found ;-(');
  }

  //get methods
  server.methods(name, function (methods) {

    if (!methods.length) {
      //do nothing
      return $tpl.find('.info').html('Nothing found ;-(');
    }

    $tpl.find('.info').empty();

    //top 5
    //methods = methods.slice(0,5);

    //fill template with popular methods
    $.each(methods, copy_method($tpl.find('#popular-methods')));

  });


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
