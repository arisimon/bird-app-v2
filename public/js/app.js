'use strict';

let OBSERVATION_URL = 'observations';
let SPECIES_URL = 'species';
let user = localStorage.getItem('currentUser');

function handleEventHandlers() {
    handleLoginForm();
    handleRegForm();
    handleLogout();
}



//handle Login form
function handleLoginForm() {
    $("#login-modal-form").submit(function(event) {
        event.preventDefault();
        let username = $("#username").val();
        let password = $("#password").val();
        let userInfo = { username, password };
        let settings = {
            url: "/api/auth/login",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userInfo),
            success: function(data) {
                console.log('successfully logged in');
                localStorage.setItem("authToken", data.authToken);
                localStorage.setItem("currentUser", username);
                user = username;
                $('.login-section').hide();
                location.replace('observations.html')
                console.log(data);
                // getGarden(data);
                // getJournal(data);
            },
            error: function(err) {
                console.log(err);
            }
        };
        $.ajax(settings);
    })
}


//handle registration form
function handleRegForm() {
    $("#register-modal-form").submit(function(event) {
        event.preventDefault();
        let username = $('#username-rg').val();
        let password = $('#password-rg').val();
        let firstName = $('#firstName').val();
        let lastName = $('#lastName').val();
        let user = { username, password, firstName, lastName };
        let settings = {
            url: "/api/users/",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(user),
            success: function(data) {
                console.log('successfully registered');
                // $("##register-modal-form input[type='text']").val('');
                // $("#register-page").hide();
                // $(".login-section").hide();
                // $(".detail-section").hide();
                // $("#login-page").show();
            },
            error: function(err) {
                console.log(err);
                if (password.length < 8) {
                    $("#errorNotLong").html(`<p>Password must be at least 8 characters</p>`)
                }
            }
        };
        $.ajax(settings);
        console.log(settings);
    })
}

function getObservations() {
    let authToken = localStorage.getItem('authToken');
    $.ajax({
        method: 'GET',
        url: `${OBSERVATION_URL}/user/${user}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        contentType: 'application/json',
        success: function(userData) {
            console.log(userData);
            displayObservations(userData);
        }
        error: function(err) {
            console.log(err.message);
        }
    });
}

function displayObservations(observation) {
    $.each(data, function(index, value) {
        $('.observations-container').append(`		
        	<div class="row">
			<div class="three columns">
				<p>${data[index].scientific_name}</p>
				<img src="//unsplash.it/600/300" class="u-img-responsive">
			</div>`)
    });
}

function handleLogout() {
    $('.logout').click(function() {
        console.log('User has been logged out');
        localStorage.clear();
        user = null;
        window.location.reload(true);
    });
}

$(handleEventHandlers);