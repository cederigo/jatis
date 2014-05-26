
!function (global) {
  'use strict';

  if (!(global.versions)) {
    throw new Error ('missing dependency!');
  }

  var version = {
    id: '8',
    type: '.navBarCell1Rev:first',
    methods: '.memberSummary[summary^="Method"] tr'
  };

  //expose ourself
  global.versions.register(version);

}(window);
