
!function (global) {
  'use strict';
  //things a version must define
  var attributes = ['id', 'type', 'methods'];
  var versions = {};

  /*
   * versions register them self here
   */

  function register(version) {
    var valid = attributes.every(function (attr) {
      return typeof version[attr] === 'string';
    });

    if (!valid) {
      throw new Error('invalid version!');
    }
    //register
    versions[version.id] = version;

  }

  function current() {

    //get current version based on url
    var id = /javase\/(\d)\//.exec(location.pathname)[1];

    if (!versions[id]) {
      throw new Error('invalid version id ' + id);
    }

    console.log('using java version ' + id);

    return versions[id];
  }


  //api
  global.versions = {
    register: register,
    current: current
  };


}(window);
