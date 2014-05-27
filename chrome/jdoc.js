
!function (global) {
  'use strict';

  var $ = global.jQuery;

  function Jdoc (html) {
    this.html = html;
    this.parents = [];
  }

  Jdoc.prototype = {

    //to be implemented by children
    type: function () { throw new Error('not implemented');},
    version: function () { throw new Error('not implemented');},
    methodDescription: function (sig) { throw new Error('not implemented ' + sig);},
    inheritanceTree: function () { throw new Error('not implemented');},

    template: function () {
      throw new Error('not implemented');
    },
    $$: function (selector) {
      return $(this.html).find(selector);
    },
    parentNames: function () {
      return this.inheritanceTree().slice(0,-1);
    },
    parents: function () {
      return this.parents;
    },
    valid: function () {
      return this.type() === 'Class';
    },
    name: function () {
      return this.inheritanceTree().pop();
    },

    //private
    _fetchParents: function (cb) {

      var self = this;

      self.parents = [];

      var parentNames = this.parentNames();
      var countdown = parentNames.length;
      var baseUrl = location.href.replace(/api.*/, 'api/');

      function callback(data) {
        countdown--;
        self.parents.push(Jdoc._instance(data));
        if (countdown <= 0) {
          //we are done
          return cb(null, self);
        }
      }

      //no parents
      if(countdown <= 0) {
        return cb(null, self);
      }

      $.each(parentNames, function (idx, el) {
        var url = baseUrl + el.replace(/\./g,'/') + '.html';
        $.get(url, callback);
      });
    
    }

  };

  //private
  Jdoc._instance = function (html) {
    //pick the right version
    var version = /javase\/(\d)\//.exec(location.pathname)[1];
    var constructor = 'Jdoc' + version;
    if (!global[constructor]) {
      throw new Error('invalid version ' + version);
    }
    return new global[constructor](html);
  };

  Jdoc.init = function (html, done) {

    var jdoc = Jdoc._instance(html);
    if (!jdoc.valid()) {
      return done(new Error('invalid javadoc'));
    }
    jdoc._fetchParents(done);

  };

  //expose constructor for children
  global.Jdoc = Jdoc;

}(window);
