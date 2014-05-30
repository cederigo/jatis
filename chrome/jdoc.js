
!function (global) {
  'use strict';

  var $ = global.jQuery;

  function Jdoc (html) {
    this.$html = $(html);
    this.parent = null;
    this.flagged = {};
  }

  Jdoc.prototype = {

    //to be implemented by children
    _type: function () { throw new Error('not implemented');},
    _version: function () { throw new Error('not implemented');},
    _methodDescription: function (sig) { throw new Error('not implemented ' + sig);},
    _inheritanceTree: function () { throw new Error('not implemented');},

    //public
    methodDescription: function (sig, idx) {
      var m = this._methodDescription(sig, idx);
      if (m && !this.flagged[sig]) {
        //mark as used
        this.flagged[sig] = true;
        return m;
      }
      if (this.parent) {
        return this.parent.methodDescription(sig, idx);
      }

      return null;

    },
    $$: function (selector) {
      return this.$html.find(selector);
    },
    parentNames: function () {
      return this._inheritanceTree().slice(0,-1);
    },
    parentName: function () {
      return this.parentNames().pop();
    },
    parent: function () {
      return this.parent;
    },
    valid: function () {
      return this._type() === 'Class';
    },
    name: function () {
      return this._inheritanceTree().pop();
    },

    _fetchParent: function (cb, leaf) {
      var self = this;
      var baseUrl = location.href.replace(/api.*/, 'api/');
      var parentName = self.parentName();
      var url;

      if (!parentName) {
        return cb(null, leaf || self);
      }

      url = baseUrl + parentName.replace(/\./g,'/') + '.html';

      $.get(url, function (data){
        var parent = Jdoc._instance(data);
        self.parent = parent;
        //recursion
        parent._fetchParent(cb, leaf ? leaf : self);
      });

    }


  };

  //private
  Jdoc._instance = function (html) {
    //pick the right version
    var version = /javase\/(\d)\//.exec(location.pathname)[1];
    var constructor = 'Jdoc' + version;
    if (!global[constructor]) {
      throw new Error('version ' + version + ' not implemented');
    }
    return new global[constructor](html);
  };

  Jdoc.init = function (html, done) {

    var jdoc = Jdoc._instance(html);
    if (!jdoc.valid()) {
      return done(new Error('invalid javadoc'));
    }
    jdoc._fetchParent(done);

  };

  //expose constructor for children
  global.Jdoc = Jdoc;

}(window);
