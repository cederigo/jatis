
!function (global) {
  'use strict';

  var Jdoc = global.Jdoc;
  var $ = global.$;

  function Jdoc7 (html) {
    Jdoc.call(this, html); //super

    //lookup methods by signature
    this.methods = this._extractMethods();
  }

  //inherit
  var proto = Jdoc7.prototype = Object.create(Jdoc.prototype);

  proto._version = function () {
    return '7';
  };

  proto._type = function () {
    return this.$$('.navBarCell1Rev:first').html();
  };

  proto._inheritanceTree = function () {
    var result = [];

    this.$$('.inheritance').each(function () {
      var name = $(this).find('> li:first').text().trim();
      //HACK
      //ex. java.lang.ArrayList<T> -> java.lang.ArrayList
      name = name.replace(/<.*>/, '');
      result.push(name);
    });

    return result;
  };

  proto._methodDescription = function (sig) {
    var md = this.methods[sig];

    if(!md) { return null; }

    var $md = $(md);
    $md.removeClass('altColor rowColor');
    $md.addClass('rowColor');
    return $md;
  };

  proto._extractMethods = function () {
    var result = {};

    this.$$('.overviewSummary[summary^="Method"] tr').each(function () {
      var href = $(this).find('.colLast a').attr('href');
      var sig = '';

      if (href && href.indexOf('#') >= 0) {
        sig = href.replace(/.*#/g, '');

        //HACK 1: transform method signature so that the arguments are not fully qualified class names
        //HACK 2: remove space after comma
        //ex: startsWith(java.lang.String, int) -> startsWith(String,int)
        sig = sig.replace(/[\w.]*\./g, '');
        sig = sig.replace(/, /g,',');

        //lookup by signature
        result[sig] = this;
      }
    });

    return result;

  };

  //register
  global.Jdoc7 = Jdoc7;

}(window);
