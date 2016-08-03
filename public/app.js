/*global angular io*/

angular.module('chatApp', [])
  .run(['socket', '$rootScope', function(socket, $rootScope){
    let username = null;
    while (!username) {
      let input = prompt("What's your username?");
      if (input && input.length > 1) username = input;
    }

    $rootScope.username = username;
    socket.emit('user-join', username);
  }])

  .controller('ChatController', ['$timeout', 'socket', 'api', function($timeout, socket, api){
    $timeout(() => {
      api.getUsers().then(response => {
        this.users = response.data;
      });

      api.getMessages().then(response => {
        this.messages = response.data;
      });
    }, 250);

    this.postMessage = function(message) {
      socket.emit('message');
      api.postMessage(message);
      this.newMessage = null;
    };

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

    socket.on('message', () => {
      console.log('message event received from server');

      api.getMessages().then(response => {
        this.messages.splice(0, this.messages.length + 1);
        this.messages.push(...response.data);
      });
    });

  }])

  .factory('api', ['$http', '$rootScope', function apiFactory($http, $rootScope){
    return {
      getUsers() {
        return $http.get('http://localhost:3000/api/users');
      },

      getMessages() {
        return $http.get('http://localhost:3000/api/messages');
      },

      postMessage(message) {
        return $http.post('http://localhost:3000/api/messages', {username: $rootScope.username, message});
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