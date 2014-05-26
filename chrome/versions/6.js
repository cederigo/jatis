
!function (global) {
  'use strict';

  if (!(global.versions)) {
    throw new Error ('missing dependency!');
  }

  var version = {
    id: '6',
    type: '.NavBarFont1Rev:first',
    methods: '.overviewSummary[summary^="Method"] tr'
  };


  //expose ourself
  global.versions.register(version);

}(window);
