
!function (global) {
  'use strict';

  var Jdoc = global.Jdoc;
  var $ = global.$;

  function Jdoc8 (html) {
    Jdoc.call(this, html); //super

    //lookup methods by signature
    this.methods = this._extractMethods();
  }

  //inherit
  var proto = Jdoc8.prototype = Object.create(Jdoc.prototype);

  proto._version = function () {
    return '8';
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

    this.$$('.memberSummary[summary^="Method"] tr').each(function () {
      var href = $(this).find('.colLast a').attr('href');
      var sig = '';

      if (href && href.indexOf('#') >= 0) {
        sig = href.replace(/.*#/g, '');

        //HACK 
        //ex: startsWith-java.lang.String-int- -> startsWith(String,int)
        sig = sig.replace(/-(.*)-/, '($1)');
        sig = sig.replace(/-/g, ',');
        sig = sig.replace(/[\w.]*\./g, '');

        //lookup by signature
        result[sig] = this;
      }
    });

    return result;

  };

  //register
  global.Jdoc8 = Jdoc8;

}(window);
