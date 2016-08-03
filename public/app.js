/*global angular io*/

angular.module('chatApp', [])
  .run(['socket', function(socket){
    let username = null;
    while (!username) {
      let input = prompt("What's your username?");
      if (input && input.length > 1) username = input;
    }
    socket.emit('user-join', username);
  }])

  .controller('ChatController', ['$timeout', 'socket', 'api', function($timeout, socket, api){
    $timeout(() => {
      api.getUsers().then(response => {
        this.users = response.data;
      });
    }, 250);

    socket.on('user-join', (username) => {
      console.log('User joined:', username);

      api.getUsers().then(response => {
        this.users.splice(0, this.users.length + 1);
        this.users.push(...response.data);
      });
    });

    socket.on('user-leave', (username) => {
      console.log('User left:', username);

      api.getUsers().then(response => {
        this.users.splice(0, this.users.length + 1);
        this.users.push(...response.data);
      });
    });

  }])

  .controller('ChatMessages', [function ChatMessagesController() {

  }])

  .factory('api', ['$http', function apiFactory($http){
    return {
      getUsers() {
        return $http.get('http://localhost:3000/api/users');
      },

      getMessages() {
        return $http.get('http://localhost:3000/api/messages');
      }
    };
  }])

  .factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  }]);