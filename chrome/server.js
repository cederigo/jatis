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
    methods = [],
    constructors = [];

  if (!data.length) {
    //no good
    return {methods: [], constructors: []};
  }

  data = data[0];

  //we want sorted arrays
  //data.selectors is a hashmap 'selector' -> invocation count
  methods = Object.keys(data.selectors).filter(function (item) {
    return item[0].toLowerCase() === item[0];
  });

  constructors = Object.keys(data.selectors).filter(function (item) {
    return item[0].toLowerCase() !== item[0];
  });

  //order by invocation count
  function compare(a, b) {
    return data.selectors[b] - data.selectors[a];
  }

  methods.sort(compare);
  constructors.sort(compare);

  return { methods: methods, constructors: constructors };
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
 * get top selector `type` from `className`
 *
 * @param type - `methods` or `constructors`
 * @param cb - callback to be executed
 *
 */

function selectors(className, type, cb) {

  if (cache[className]) {
    console.log('hit cache for class ' + className);
    return cb(cache[className][type]);
  }

  fetch(className, function (err, resp) {
    if (err) {
      //return empty result
      return cb([]);
    }
    var data = parse(resp);
    //put in cache
    cache[className] = data;
    return cb(data[type]);

  });

}

function methods(className, cb) {
  return selectors(className, 'methods', cb);
}

function constructors(className, cb) {
  return selectors(className, 'constructors', cb);
}

//public api
window.server = {
  methods: methods,
  constructors: constructors
};
