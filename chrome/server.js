'use strict';

//cache lives as long as the tab is open
var cache = {};

/*
 * return formatted data from resp
 * @api private
 */
function parse(respText) {

  var
    data = JSON.parse(respText),
    members = [];

  if (!data.length) {
    //no good
    return {methods: [], constructors: []};
  }

  data = data[0];

  //we want sorted arrays
  //data.selectors is a hashmap 'selector' -> invocation count
  members = Object.keys(data.selectors).map(function (item) {
    //HACK: remove question marks
    //ex: printStackTrace(???) -> printStackTrace()
    return item.replace(/\?/g, '');
  });

  //order by invocation count
  function compare(a, b) {
    return data.selectors[b] - data.selectors[a];
  }

  members.sort(compare);

  return members;
}

function fetch(className, cb) {

  //go and get it
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://scg.unibe.ch/mongorest/query?dbname=classesAndMethods&colname=javaPangeaTakeTwo', true, 'reader', 'w4nn4Re4dD4t4');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        return cb(null, xhr.responseText);
      } else {
        return cb(new Error('class ' + className + ' not fount or some error occured'));
      }
    }
  };

  //fire request, proprietary package seperator
  xhr.send(JSON.stringify({className: className.replace(/\./g,'::')}));
}

/*
 * get top members from `className`
 *
 * @param cb - callback to be executed
 *
 */

function members(className, cb) {

  if (cache[className]) {
    console.log('hit cache for class ' + className);
    return cb(cache[className]);
  }

  fetch(className, function (err, resp) {
    if (err) {
      //return empty result
      return cb([]);
    }
    var data = parse(resp);
    //put in cache
    cache[className] = data;
    return cb(data);

  });

}

//public api
window.server = {
  members: members
};
