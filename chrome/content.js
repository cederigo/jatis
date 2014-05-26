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
    if (countdown <= 0) {
      //we are done
      return cb(result);
    }
  }

  //empty tree
  if(countdown <= 0) {
    return cb(result);
  }

  $.each(tree, function (idx, el) {
    var url = baseUrl + el.replace(/\./g,'/') + '.html';
    $.get(url, callback);
  });

}

function fill ($container, methods, templates, parentTemplates) {

  var $dest = $container.find('#popular-methods');

  //walk up the inheritance tree
  function find (sig) {

    var tpl;
    [templates, parentTemplates].every(function (lookup) {
      tpl = lookup[sig];
      if (tpl) {
        //found, make sure we dont find it again
        lookup[sig] = false;
        //break
        return false;
      }
      return true;
    });

    return tpl;

  }

  var count = 0;

  $.each(methods, function (idx, sig) {

    var tpl = find(sig);

    if (!tpl) {
      console.log('warn: no template for method ' + sig + ' found');
      return;
    }

    var $tpl = $(tpl);
    $tpl.removeClass('altColor rowColor');
    $tpl.addClass(count++ % 2 ===  0 ? 'altColor' : 'rowColor');
    $dest.append($tpl);
  });


}

function moreLess($container) {

  var origHeight = $container.height();
  var offsetTop = $container.scrollTop();

  return function (e) {
    var $this = $(this);
    var less = $this.data('less') || false;

    e.preventDefault();
    $container.css('height', less ? origHeight + 'px' : 'auto');
    $this.data('less', !less);
    $this.html(less ? 'More' : 'Less');
    if (less) {
      $('body,html').scrollTop(offsetTop);
    }
  };

}

function render () {
  var
    tree = inheritance(),
    $tpl = $(template),
    us = tree.pop(); //our name ex: java.lang.String

  //visual something
  sendMessage('showPageAction');
  //insert in existing dom
  $('.description').before($tpl);
  $tpl.find('.title')
      .prepend(
          $('<img>')
            .attr('src', chrome.extension.getURL('icon48.png'))
            .css('max-height', '20px')
      );
  $tpl.find('.info').html('Loading...');
  //more less
  $tpl.find('.btn-more').click(moreLess($tpl.find('.popular-height')));


  if (!us) {
    console.log('oops. class name not found');
    return $tpl.find('.info').html('Nothing found ;-(');
  }

  download(tree, function (pages){
    //add ourself

    var parentTemplates = extract_methods(pages);
    var templates = extract_methods([document.documentElement.outerHTML]);


    //get methods
    server.methods(us, function (methods) {

      if (!methods.length) {
        //do nothing
        return $tpl.find('.info').html('Nothing found ;-(');
      }

      $tpl.find('.info').empty();
      $tpl.find('.popular-height').show();
      $tpl.find('.btn-more').css('display', 'block');

      fill($tpl, methods, templates, parentTemplates);

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
