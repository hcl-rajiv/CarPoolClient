﻿
var app = angular.module('myApp', []);



app.controller('userCtrl', function ($scope, $http, $window) {
    $scope.authenticated = true;
    $scope.login = function () {
       var email = $scope.txtEmail;
       var pass = $scope.txtPassword;       
       document.getElementById("Loading").style.display = "block";
        if (email != "" && pass != "" && email != undefined && pass != undefined) {
            $http.get("http://wiprocarpool.azurewebsites.net/authenticate/" + email + "/" + pass)
            .success(function (response) {
                var data = JSON.stringify(response);
                var result = JSON.parse(data);
                if (result.length > 0) {
                    var userid = result[0].id;
                    var isowner = result[0].isowner;
                    //var username = result[0].userName;
                    window.localStorage.setItem("userid", userid);
                    window.localStorage.setItem("isowner", isowner);
                    //window.localStorage.setItem("username", username);
                    document.location.href = 'NewDashboard.html';
                }
                else {
                    document.getElementById("Loading").style.display = "none";
                    $scope.authenticated = false;
                }
              
            })
            .error(function (data, status) {
                $scope.authenticated = false;                
                document.getElementById("Loading").style.display = "none";

            });
            
        }
        else { document.getElementById("Loading").style.display = "none"; }
    }
    $scope.edit = false;
    $scope.change = function () {

        if ($scope.isCarOwner == true)
            $scope.edit = true;
        else
            $scope.edit = false;
    }
    $scope.iserror = true;
    $scope.success = false;
    $scope.ismatch = true;
    $scope.AddUser = function () {
        var UserName = $scope.txtRegUserName;
        var Password = $scope.txtRegPwd;
        var ConfirmPwd = $scope.txtRegConfirmPwd;
        var Email = $scope.txtRegEmail;
        var Mobile = $scope.txtRegMobile;
        var Gender = $scope.inputRegGender;
        var isCarOwner = $scope.edit;
        var carNo = "";
        var seatCap = "";
        if (Password != ConfirmPwd) {
            $scope.ismatch = false;
        } else {
            $scope.ismatch = true;
        }
        if (isCarOwner) {
            carNo = $scope.carno;
            seatCap = $scope.seats;
        }
        //$window.alert(UserName + ',' + Password + ',' + Email + ',' + Mobile + ',' + Gender + ',' + isCarOwner + ',' + carNo + ',' + seatCap + ',' + spoint + ',' + epoint);
        if ($scope.ismatch && UserName != "" && Password != "" && ConfirmPwd != "" && Email != "" && Mobile != "" && Gender != ""
           && UserName != undefined && Password != undefined && ConfirmPwd != undefined && Email != undefined && Mobile != undefined && Gender != undefined) {


            var user = JSON.stringify({
                type: "user",
                userName: UserName,
                password: Password,
                email: Email,
                mobile: Mobile,
                gender: Gender,
                isowner: isCarOwner,
                carNo: carNo,
                totalseats: seatCap,
                rides: [
                ]
            });

            var res = $http.post('http://wiprocarpool.azurewebsites.net/register', user,
                      { headers: { 'Content-Type': 'application/json' } });
            res.success(function (data, status, headers, config) {
                $scope.iserror = true;
                $scope.success = true;
                $scope.txtRegUserName = '';
                $scope.txtRegPwd = '';
                $scope.txtRegConfirmPwd = '';
                $scope.txtRegEmail = '';
                $scope.txtRegMobile = '';
                $scope.carno = '';

            });
            res.error(function (data, status, headers, config) {
                $scope.iserror = false;
                $scope.success = false;
                $scope.Error = data;
                $scope.txtRegUserName = '';
                $scope.txtRegPwd = '';
                $scope.txtRegConfirmPwd = '';
                $scope.txtRegEmail = '';
                $scope.txtRegMobile = '';
                $scope.carno = '';
            });


        }
        return false;
    }

});

app.controller('searchCtrl', function ($scope, $http, $window, $rootScope) {

    var url = "http://wiprocarpool.azurewebsites.net/listsharedrides/";
    var userid = window.localStorage.getItem("userid");
    try {
        $http.get(url + "undefined/undefined/" + userid)
           .success(function (response) {
               $scope.users = response;

           })

            .error(function (data, status) {
                //alert('failed');
            });
    }
    catch (e) {
        alert(e);
    }

    //click on join link
    $scope.ActiveChange = function (user) {
        alert('Request to join the route is created succesfully ');


    }

    //search funtionality
    $scope.search = function () {
        try {
            if ($scope.txtsource != "" && $scope.txtdestination != "") {
                var source = $scope.txtsource;
                var destin = $scope.txtdestination;
                $http.get(url + source + "/" + destin + "/0")
                   .success(function (Result) {

                       $scope.users = Result;
                   })
                    .error(function (data, status) {
                        //alert('Search failed');
                    });
            }
            else { return false; }
        }
        catch (e) {
            //alert(e);
        }

    }

});



app.controller('dashboardCtrl', function ($scope, $http, $window) {   

    PushNotifications();
    navigationLinks($scope, $http, $window);
});

function navigationLinks($scope, $http, $window) {

    var isowner = window.localStorage.getItem("isowner");

    if (isowner == "true") {
        $("#carownerShow").show();
        $("#passangerShow").hide();
        $("#carownerShow2").show();
        $("#passangerShow2").hide();
    }
    else {
        $("#passangerShow").show();
        $("#carownerShow").hide();
        $("#passangerShow2").show();
        $("#carownerShow2").hide();
    }

    $scope.MyDashboard = function () {

        window.location.href = "NewDashboard.html";
    }
   
    $scope.MyNotifications = function () {

        var isowner = window.localStorage.getItem("isowner");
        var notificationurl= '';
        if (isowner == "true")
            notificationurl = "ownernotification.html";
        else
            notificationurl = "usernotification.html";

        window.location.href = notificationurl;

        
    }

    $scope.ShareRide = function () {

        window.location.href = "addmarker.html";
    }

    $scope.MyRides = function () {

        window.location.href = "myrides.html";
    }

    $scope.JoinRide = function () {

        window.location.href = "ride.html";
    }

    $scope.logOut = function () {
        window.localStorage.setItem("userid", 0);
        window.location.href = 'index.html';
    }
}

function PushNotifications()
{
    var notificationurl = "http://wiprocarpool.azurewebsites.net/";
    var isowner = window.localStorage.getItem("isowner");
    var userId = window.localStorage.getItem("userid");
    var todayDate = new Date();
    var date = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();

    var totaltimeout = 5;

    if (isowner == "true") {
        notificationurl = notificationurl + "getnotitifications/" + userId + "/" + date.toString();
        totaltimeout = 15;
    }
    else {
        notificationurl = notificationurl + "receivenotitifications/" + userId;
    }

    $("#MyNotifications").css("backgroundColor", "green");
    NotificationClientService.AutomaticNotifications(notificationurl, 2, totaltimeout, null, NoticationCallback);
}

function NoticationCallback(data)
{
    var isowner = window.localStorage.getItem("isowner");

    if (data != undefined && data != null && data.data.length > 0)
    {
        if (isowner == "true")
        {
            $("#MyNotifications").css("backgroundColor", "red");
            CancelNotification.Clear(NotificationClientService.RefreshIntervalId);
        }
        else
        {
            if (data.data[0].status == "pending") {
                $("#MyNotifications").css("backgroundColor", "yellow");
            }
            else {
                $("#MyNotifications").css("backgroundColor", "red");
                CancelNotification.Clear(NotificationClientService.RefreshIntervalId);
            }
        }
    }
}

app.controller('usernotificationCtrl', function ($scope, $http, $window) {

    document.getElementById("Loading").style.display = "block";
    navigationLinks($scope, $http, $window);
    $scope.notificationdata = "";
    var userId = window.localStorage.getItem("userid");

    //var url = "http://wiprocarpool.azurewebsites.net/receivenotitifications/53946907-3b48-6904-f599-db29de2e74e6";
    var url = "http://wiprocarpool.azurewebsites.net/receivenotitifications/" + userId;
    $http.get(url)
            .success(function (response) {

                var data = JSON.stringify(response);
                var result = JSON.parse(data);
                if (result.length > 0) {
                    $scope.notificationdata = result;
                }
                document.getElementById("Loading").style.display = "none";

            }).error(function (data, status) {
                document.getElementById("Loading").style.display = "none";
            });
   
});

app.controller('ownernotificationCtrl', function ($scope, $http, $window) {
   
    navigationLinks($scope, $http, $window);
    $scope.notificationdata = "";
    var userId = window.localStorage.getItem("userid");
    var todayDate = new Date();
    var date = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();
    //var url = "http://wiprocarpool.azurewebsites.net/getnotitifications/bae03711-08e6-7d8f-8101-457caa0368a8/2011-07-14";
    var url = "http://wiprocarpool.azurewebsites.net/getnotitifications/" + userId + "/" + date.toString();
    $http.get(url)
            .success(function (response) {
                var data = JSON.stringify(response);
                var result = JSON.parse(data);
                if (result.length > 0) {
                    $scope.notificationdata = result;
                }
                document.getElementById("Loading").style.display = "none";
               
            }).error(function (data, status) {
                // alert(data);    
                document.getElementById("Loading").style.display = "none";
            });

    $scope.updateRideNotification = function (ownerid, rideid, passengerid, bookingstatus) {
        var user = JSON.stringify({
            id: ownerid,
            rideid: rideid,
            userid: passengerid,
            status: bookingstatus
        });

        var res = $http.post('http://wiprocarpool.azurewebsites.net/rideconfirmation', user, { headers: { 'Content-Type': 'application/json' } });
        res.success(function (data, status, headers, config) {
            $scope.notificationdata = "";
            window.location.href = 'ownernotification.html';
            $scope.iserror = true;
            $scope.success = true;
        }).error(function (data, status) {
            //alert(data);
            //$scope.iserror = false;
            //$scope.success = false;
        });
    }
   
});


