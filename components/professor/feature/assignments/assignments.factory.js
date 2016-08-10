'use strict';

angular.module('coursekeyApp')

.factory('AssignmentsFunctions', function ($modal) {
    return {

      openAssignmentsFilterModal : function(scope){
        var configObj = {
          title: 'hello',
          body: 'world',
          buttons: [
            {
              name: 'ok',
              class: ['successBtn'],
              callback : function(){
                alert('Hello World');
              }
            },
            {
              name: 'Info',
              class: ['btn-info'],
              return : {}
            },
            {
              name: 'cancel',
              class: ['cancelBtn'],
              return : {}
            }
          ]
        };

        $modal.open({
          templateUrl: 'assignmentsFilterModal',
          controller: 'assignmentsFilterModal',
          backdrop: 'static',
          resolve: {
            config: function () {
              return configObj;
            },
            data: function () {
              return scope;
            }
          }
        });
      },

      openAssignmentsImageA : function(scope){
        var configObj = {
          title: 'hello',
          body: 'world',
          buttons: [
            {
              name: 'ok',
              class: ['successBtn'],
              callback : function(){
                alert('Hello World');
              }
            },
            {
              name: 'Info',
              class: ['btn-info'],
              return : {}
            },
            {
              name: 'cancel',
              class: ['cancelBtn'],
              return : {}
            }
          ]
        };

        $modal.open({
          templateUrl: 'assignmentsImageA',
          controller: 'assignmentsImageA',
          backdrop: 'static',
          resolve: {
            config: function () {
              return configObj;
            },
            data: function () {
              return scope;
            }
          }
        });
      },

      openModalNotifications : function(title, msg, not, url, data){
        var configObj = {
          title: 'hello',
          body: 'world',
          buttons: [
            {
              name: 'ok',
              class: ['successBtn'],
              callback : function(){
                alert('Hello World');
              }
            },
            {
              name: 'Info',
              class: ['btn-info'],
              return : {}
            },
            {
              name: 'cancel',
              class: ['cancelBtn'],
              return : {}
            }
          ]
        };

        $modal.open({
          templateUrl: 'modalNotifications',
          controller: 'modalNotifications',
          backdrop: 'static',
          resolve: {
            config: function () {
              return configObj;
            },
            title: function () {
              return title;
            },
            msg: function () {
              return msg;
            },
            not: function () {
              return not;
            },
            url: function () {
              return url;
            },
            data: function () {
              return data;
            }
          }
        });
      }
    };
  });