/*
 * A content script: http://developer.chrome.com/extensions/content_scripts
 * match: ['http://docs.oracle.com/*', 'https://docs.oracle.com/*']
 */

'use strict';

var
  template = window.template,
  server = window.server,
  $ = window.jQuery,
  Jdoc = window.Jdoc,
  // ML: All messages in one place.
  messages = {
    'no_info': 'No sufficient stats for this class.'
  };

function sendMessage(type) {
  chrome.runtime.sendMessage({type: type}, function(response) {
    console.log('got response: ' + response);
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

function enhance(jdoc) {

  var $tpl = $(template);

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


  if (!jdoc.name()) {
    console.log('oops. class name not found');
    return $tpl.find('.info').html(messages.no_info);
  }

  server.members(jdoc.name(), function (members) {
    if (!members.length) {
      //do nothing
      return $tpl.find('.info').html(messages.no_info);
    }

    $tpl.find('.info').empty();
    $tpl.find('.popular-height').show();
    $tpl.find('.btn-more').css('display', 'block');

    var count = 0;
    $.each(members, function (idx, sig) {

      var md = jdoc.methodDescription(sig, count);

      if (!md) {
        console.log('warn: no method description for ' + sig + ' found');
        return;
      }
      count++;

      $tpl.find('#popular-methods').append(md);
    });

  });

}

Jdoc.init(document.documentElement.outerHTML, function (err, jdoc) {
  if (err) {
    return console.warn('could not init jdoc: ' + err);
  }

  enhance(jdoc);

});
