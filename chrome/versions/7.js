
!function (global) {
  'use strict';

  if (!(global.versions)) {
    throw new Error ('missing dependency!');
  }

  var version = {
    id: '7',
    type: '.navBarCell1Rev:first',
    methods: '.overviewSummary[summary^="Method"] tr'
  };


  //expose ourself
  global.versions.register(version);

}(window);
