/*
 * A content script: http://developer.chrome.com/extensions/content_scripts
 * match: ['http://docs.oracle.com/*', 'https://docs.oracle.com/*']
 */

'use strict';

var
  template = window.template,
  server = window.server,
  $ = window.jQuery;

function sendMessage(type) {
  chrome.runtime.sendMessage({type: type}, function(response) {
    console.log('got response: ' + response);
  });
}

/*
 * find all methods in DOM and make them accessible by their signature.
 * TODO: find methods up the inheritance tree
 */
function extract_methods (pages) {

  var methods = {};

  $.each(pages, function (idx, html) {
  
    $(html).find('.overviewSummary[summary^="Method"] tr')
      .each(function () {
        var
          href = $(this).find('.colLast a').attr('href'),
          sig = '';

        if (href && href.indexOf('#') >= 0) {
          sig = href.replace(/.*#/g, '');

          //HACK 1: transform method signature so that the arguments are not fully qualified class names
          //HACK 2: remove space after comma
          //ex: startsWith(java.lang.String, int) -> startsWith(String,int)
          sig = sig.replace(/[\w.]*\./g, '');
          sig = sig.replace(/, /g,',');

          //lookup by signature
          methods[sig] = this;
        }
      }
    );
  });

  return methods;

}

function inheritance () {

  var result = [];

  $('.inheritance').each(function () {
    result.push($(this).find('> li:first').text().trim());
  });

  return result;

}

/*
 * download content up the inheritance `tree`.
 * @param {Array} tree - class names to download
 * @param {Function} cb - callback to call when we are done
 */

function download(tree, cb) {

  var countdown = tree.length;
  var baseUrl = location.href.replace(/api.*/, 'api/');
  var result = [];

  function callback(data) {
    countdown--;
    result.push(data);
    if (countdown >= 0) {
      //we are done
      return cb(result);
    }
  }

  $.each(tree, function (idx, el) {
    var url = baseUrl + el.replace(/\./g,'/') + '.html';
    $.get(url, callback);
  });


}

function render () {
  var
    tree = inheritance(),
    $tpl = $(template),
    us = tree.pop(); //our name ex: java.lang.String

  //visual something
  sendMessage('showPageAction');
  $tpl.find('.title').prepend($('<img>').attr('src', chrome.extension.getURL('icon48.png')));
  $tpl.find('.info').html('Loading...');
  $tpl.find('.btn-more').click(function (e) {
    e.preventDefault();
    $tpl.find('.popular-height').css('height', 'auto');
    $(this).hide();
  });

  if (!us) {
    console.log('oops. class name not found');
    return $tpl.find('.info').html('Nothing found ;-(');
  }

  console.log('going for: ' + us);

  download(tree, function (pages){
    //add ourself
    pages.push(document.documentElement.outerHTML);

    var methodTemplates = extract_methods(pages);
    //insert in existing dom
    $('.description').before($tpl);

    //get methods
    server.methods(us, function (methods) {

      if (!methods.length) {
        //do nothing
        return $tpl.find('.info').html('Nothing found ;-(');
      }

      $tpl.find('.info').empty();

      //fill template with popular methods
      var $dest = $tpl.find('#popular-methods');
      $.each(methods, function (index, sig) {
        console.log('copy: ' + sig);
        var $m = $(methodTemplates[sig]).clone();
        $m.removeClass('altColor rowColor');
        $m.addClass(index % 2 ===  0 ? 'altColor' : 'rowColor');
        $dest.append($m);
      });

    });
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
