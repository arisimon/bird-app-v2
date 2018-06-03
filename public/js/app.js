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
    // handleUpdateButton();

    if (location.href.split('/').pop() === 'observations.html' && !$('.observations-items').text().length) {
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
            console.log('success');
        }
    });
}


//function to render observations to page
function displayObservations(observations) {
    $.each(observations, function(index, value) {
        $('.observation-items').append(` 
                <li class="four columns" data-id= "${value._id}">
                    <img src="${observations[index].photos}">
            <div class="observation-detail">
                <div class="vertical-centered">
                    <p class="separator orange">${observations[index].commonName}</p>
                   <p><strong>Scientific Name:</strong> ${observations[index].scientificName}</p>
                   <p><strong>Family:</strong> ${observations[index].familyName}</p>
                   <p><strong>Observation Location:</strong> <br> ${observations[index].location}</p>
                   <p class='notesText'><strong>Notes:</strong><br> ${observations[index].notes}</p>
                    <a class='updateBtn button button-primary' rel="modal:open" href='#updateModal' type='submit'>Update</a>
                    <button class='deleteBtn button button-primary'>Delete</button>
                        </div>
                    </div>
                </li>
            `)
    });
}

//handle observation button event
function handleAddObservation() {
    $('#newObservation').on('submit', event => {
        event.preventDefault();
        addObservation({
            user: user,
            name: name,
            scientificName: $(event.currentTarget).find('scientificNameModal').val(),
            commonName: $(event.currentTarget).find('#commonNameModal').val(),
            familyName: $(event.currentTarget).find('#familyNameModal').val(),
            location: $(event.currentTarget).find('#locationModal').val(),
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
        url: `${OBSERVATION_URL}`,
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
        url: `${OBSERVATION_URL}/${id}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        method: 'DELETE',
        success: function(data) {
            getObservations(data);
            location.reload();
        },
        error: function(err) {
            console.log(err);
        }
    });
}

// //handle update button
// function handleUpdateButton() {
//     $('.observations-gallery').on('click', '.updateBtn', function(event) {
//         console.log('Update button clicked');
//         // let scientificName = $(event.currentTarget).find('scientificNameModal').val();
//         // let commonName = $(event.currentTarget).find('#commonNameModal').val();
//         // let familyName = $(event.currentTarget).find('#familyNameModal').val();
//         // let location = $(event.currentTarget).find('#locationModal').val();
//         // let notes = $(event.currentTarget).find('#notesModal').val();
//         // let photos = $(event.currentTarget).find('#imageModal').val();
//         // $('#updateScientificName').val(scientificName);
//         // $('#updateCommonName').val(commonName);
//         // $('#updateFamily').val(familyName);
//         // $('#updateLocation').val(location);
//         // $('#updateNotes').val(notes);
//         // $('#updateImage').val(photos);

//         // updateObservation({
//         //     scientificName: scientificName,
//         //     commonName: commonName,
//         //     familyName: familyName,
//         //     location: location,
//         //     notes: notes,
//         //     photos: photos,
//         // });
//     });
// }

//handle delete button event
function handleDeleteButton() {
    $('.observations-gallery').on('click', '.deleteBtn', function(event) {
        console.log('Delete button clicked');
        let data = $(this).closest('li').attr('data-id');
        console.log(data);
        deleteObservation(
            $(this).closest('li').attr('data-id')
        );
    })
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