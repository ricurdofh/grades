'use strict';

angular.module('coursekeyApp')

.factory('AttendanceFunctions', function ($modal) {
    return {
  
      openAttendanceFilterModal : function(scope){
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
          templateUrl: 'attendanceFilterModal',
          controller: 'attendanceFilterModal',
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
  
      openAttendanceModali : function(scope, section, attendance){
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
          templateUrl: 'attendanceModali',
          controller: 'attendanceModali',
          backdrop: 'static',
          resolve: {
            config: function () {
              return configObj;
            },
            data: function () {
              return scope;
            },
            attendance: function () {
              return attendance;
            },
            section: function () {
              return section;
            }
          }
        });
      }
    };
  });