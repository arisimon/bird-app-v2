'use strict';

let OBSERVATION_URL = 'observations';
let SPECIES_URL = 'species';
let user = localStorage.getItem('currentUser');

function handleEventHandlers() {
    handleLoginForm();
    handleRegForm();
    handleLogout();
    handleAddObservation();
    handleDeleteButton();

    if (location.href.split('/').pop() === 'observations.html' && !$('.observations-gallery').text().length) {
        getObservations();
    }

}



//handle Login form
function handleLoginForm() {
    $("#login-modal-form").submit(function(event) {
        event.preventDefault();
        let username = $("#username").val();
        console.log(username);
        let password = $("#password").val();
        console.log(password);
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
                $('#login-modal-form').html('Success!');
                setTimeout(function(data) {
                    location.replace('observations.html');

                }, 1000)
            },
            error: function(err) {
                console.log(err);
            }
        }
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
                $('#register-modal-form').html(`You've created an account!`);
                setTimeout(function(data) {
                    $('#register-modal-form').hide()
                }, 1000)
            },
            error: function(err) {
                console.log(err);
                if (password.length < 8) {
                    $("#errorNotLong").html(`<p>Password must be at least 8 characters</p>`)
                }
            }
        };
        $.ajax(settings);
    })
}

//function to get observations
function getObservations() {
    let authToken = localStorage.getItem('authToken');
    console.log('Getting observations');
    $.ajax({
        method: 'GET',
        url: `${OBSERVATION_URL}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        contentType: 'application/json',
        success: function(data) {
            console.log(data);
            displayObservations(data);
        }
    });
}

//function to render observations to page
function displayObservations(observations) {

    $.each(observations, function(index, value) {
        $('.observations-gallery').append(`		
			<div class="three columns obs" data-id: ${value._id}>
				<p>${observations[index].scientificName}</p>
				<p>${observations[index].commonName}</p>
				<p>${observations[index].familyName}</p>
				<p>${observations[index].location}</p>
				<p>${observations[index].obsDate}</p>
				<p>${observations[index].notes}</p>
				<img src="${observations[index].photos}" class="u-img-responsive">
				<input id='updateBtn' class="button-primary" type="button" value="Update">
				<input id='deleteBtn' class="button-primary" type="button" value="Delete">
			</div>`)
    });
}


function handleAddObservation() {
    $('#newObservation').on('submit', event => {
        event.preventDefault();
        addObservation({
            user: user,
            scientificName: $(event.currentTarget).find('#scientificNameModal').val(),
            commonName: $(event.currentTarget).find('#commonNameModal').val(),
            familyName: $(event.currentTarget).find('#familyNameModal').val(),
            location: $(event.currentTarget).find('#autocomplete-address').val(),
            notes: $(event.currentTarget).find('#notesModal').val(),
            photos: $(event.currentTarget).find('#imageModal').val(),
        });
        console.log('A new observation was added!');
    })
}


//create a new observation
function addObservation(observation) {
    let authToken = localStorage.getItem('authToken');
    $.ajax({
        method: 'POST',
        url: OBSERVATION_URL,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(observation),
        success: function(data) {
            getObservations(data);
            location.reload(true);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

//delete observation
function deleteObservation(id) {
    let authToken = localStorage.getItem('authToken');
    $.ajax({
        url: OBSERVATION_URL + '/' + id,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        method: 'DELETE',
        success: function(data) {
            getObservations(data);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function handleDeleteButton() {
    $('.obs').on('click', '#deleteBtn', (event) => {
        event.preventDefault();
        deleteObservation(
            $(event.currentTarget).closest('.obs').attr('data-id'));

    });
}

function handleLogout() {
    $('.logout').click(function() {
        console.log('User has been logged out');
        localStorage.clear();
        user = null;
        window.location.replace('index.html');
    });
}

$(handleEventHandlers);