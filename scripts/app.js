'use strict';

// Declare app level module which depends on views, and core components
<<<<<<< HEAD
const app = angular.module('yellowBrickCode', [
=======
angular.module('yellowBrickCode', [
>>>>>>> c7ced66... Add Angular modules
  'ngRoute',
  'yellowBrickCode.solve',
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/solve'});
<<<<<<< HEAD
}]);

app.directive('uiCodeMirror', [function() {
  function link(scope, element) {
    let editorConfig = {
      value: 'function myScript(){return 100;}\n',
      mode:  'javascript',
      lineNumbers: true,
    };
    let editor = CodeMirror(element[0], editorConfig);
  }
  return {
    link: link
  };
=======
>>>>>>> c7ced66... Add Angular modules
}]);