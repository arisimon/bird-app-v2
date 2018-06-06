'use strict';

let OBSERVATION_URL = 'observations';
let SPECIES_URL = '/api/species';
let user = localStorage.getItem('currentUser');

function handleEventHandlers() {
    handleLoginForm();
    handleRegForm();
    handleLogout();
    handleAddObservation();
    handleDeleteButton();
    handleUpdateButton();
    handleModalUpdateButton();
    handleSpeciesSearchButton();
    showToTop();

    if(location.href.split('/').pop() === 'observations.html' && !$('.observations-items').text().length) {
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
                alert(err);
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
                    $('#register-modal').hide()
                    location.reload();
                }, 1000)

            },
            error: function(err) {
                if(password.length < 8) {
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
        },
        error: function(err) {
            console.log(err);
        }
    });
}


//function to render observations to page
function displayObservations(observations) {
    $.each(observations, function(index, value) {
        $('.observation-items').append(` 
                <li class="six columns observation-li" data-id= "${value._id}">
                    <img class='u-img-responsive' src="${observations[index].photos}" alt='${observations[index].commonName}.jpg'>
            <div class="observation-detail">
                <div class="vertical-centered">
                    <p class="separator orange common-name-text">${observations[index].commonName}</p>
                   <p><strong>Scientific Name:</strong> ${observations[index].scientificName}</p>
                   <p><strong>Family:</strong> ${observations[index].familyName}</p>
                   <p><strong>Observation Location:</strong> ${observations[index].location}</p>
                   <p class='notesText'><strong>Notes:</strong><br> ${observations[index].notes}</p>
                   <div class='button-container'>
                    <a class='updateBtn button button-primary' rel="modal:open" href='#updateModal' type='submit' role='button'>Update</a>
                    <button class='deleteBtn button button-primary' role='button'>Delete</button>
                    </div>
                        </div>
                    </div>
                </li>
            `)
    });
}

//handle observation button event
function handleAddObservation() {
    $('#newObservation').on('submit', function(event) {
        event.preventDefault();
        addObservation({
            user: user,
            name: name,
            scientificName: $(this).find('#scientificNameModal').val(),
            commonName: $(this).find('#commonNameModal').val(),
            familyName: $(this).find('#familyNameModal').val(),
            location: $(this).find('.locationModal').val(),
            notes: $(this).find('#notesModal').val(),
            photos: $(this).find('#imageModal').val(),
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

//handle delete button event
function handleDeleteButton() {
    $('.observations-gallery').on('click', '.deleteBtn', function(event) {
        console.log('Delete button clicked');
        deleteObservation(
            $(this).closest('li').attr('data-id')
        );
    })
}

//delete observation
function deleteObservation(id) {
    console.log(`Deleting observation ${id}`)
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

function populateUpdateForm(id, element) {
    let authToken = localStorage.getItem('authToken');
    console.log(id);
    $.ajax({
        method: 'GET',
        url: `${OBSERVATION_URL}/${id}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        contentType: 'application/json',
        success: function(observation) {
            console.log(observation);

            let updateModalForm = `
                <form id='updateModalForm' data-id='${observation._id}' role='form'>
            <div class='row'>
                <div class='six columns'>
                    <h2>Bird</h2>
                    <label for='updateScientificName'>Scientific Name</label>
                    <input class='u-full-width' type='text' name='scientificName' value='${observation.scientificName}' id='updateScientificName'></input>
                    <label for='updateCommonName' >Common Name</label>
                    <input class='u-full-width' type='text' name='commonName' value='${observation.commonName}' id='updateCommonName'></input>
                    <label for='updateFamilyName'>Family Name</label>
                    <input class='u-full-width' type='text' name='familyName' value='${observation.familyName}' id='updateFamilyName'></input>
                </div>
                <div class='six columns'>
                    <h2>Location</h2>
                    <label for='updateLocation'>Address</label>
                    <input class='u-full-width autocomplete updateLocation' id="ac2" name='address' value='${observation.location}' type="text"></input>
                    <h2>Photos</h2>
                    <label for='updateImage'></label>
                    <input type="text" name="photos" placeholder="Image URL" id="updateImage" class='u-img-responsive' value='${observation.photos}'></input>
                </div>
            </div>
            <label for="updateNotes">Observation Notes</label>
            <textarea class="u-full-width" name='notes' id='updateNotes'>${observation.notes}</textarea>
            <button id='updateSubmitModal' class='button-primary' type="submit">Update</button>
        </form>`
            $("#renderModal").html(updateModalForm);
        },
        error: function(err) {
            console.log(err);
        }

    });
}

//handle update button
function handleUpdateButton() {
    $('.observations-gallery').on('click', '.updateBtn', function(event) {
        console.log('Update button clicked');
        populateUpdateForm(
            $(this).closest('li').attr('data-id')
        );
    })
}
//handle modal update button
function handleModalUpdateButton() {
    $('#updateModal').on('submit', '#updateModalForm', function(event) {
        event.preventDefault();
        console.log('Update button clicked');
        let id = $(this).closest('form').attr('data-id');

        updateObservation(id, {
            user: user,
            name: name,
            scientificName: $(this).find('#updateScientificName').val(),
            commonName: $(this).find('#updateCommonName').val(),
            familyName: $(this).find('#updateFamilyName').val(),
            location: $(this).find('.updateLocation').val(),
            notes: $(this).find('#updateNotes').val(),
            photos: $(this).find('#updateImage').val(),
        });
    });
}


//update observation
function updateObservation(id, observation) {
    console.log(`Updating observation ${id}`);
    let authToken = localStorage.getItem('authToken');
    $.ajax({
        url: `${OBSERVATION_URL}/${id}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(observation),
        success: function(data) {
            console.log(data);
            getObservations(data);
            location.reload();
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function handleSpeciesSearchButton() {
    $('#species-search-form').on('submit', function(event) {
        event.preventDefault();
        let input = $('#species-search').val();
        speciesSearch(input);
    })
}

function speciesSearch(input) {
    let authToken = localStorage.getItem('authToken');
    console.log(input);
    console.log('Searching for bird information');
    $.ajax({
        method: 'GET',
        url: `${SPECIES_URL}`,
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        contentType: 'application/json',
        data: input,
        success: function(data) {
            console.log('species search request successful');
            displaySpecies(data);

        },
        error: function(err) {
            console.log(err);
        }
    })
}

function displaySpecies(species) {
    console.log(species);
    $('.search-container').empty();
    if(species.length === 0) {
        alert('No results found. Try another search!');
        $('#species-search').val('');
    }

    $.each(species, function(index, value) {
        $('.search-container').append(` 
            <div class='row style-results'>
                <div class='ul-full-width species-div'>
                    <span><h4><strong>Common Name:</strong></h4><h5> <em>${species[index].scientific_name}</em></h5></span>
                    <h4><strong>Scientific Name:</strong></h4><h5> <em>${species[index].common_name}</em></h5>
                    <h4><strong>Family:</strong></h4><h5> <em>${species[index].family}</em></h5>
                </div>
            </div>
            `)
        backToTop();
    });
}

//control back to top button
function showToTop() {
    $(window).scroll(function() {
        if($(this).scrollTop() > 100) {
            $('#toTop').fadeIn();
        } else {
            $('#toTop').fadeOut();
        }
    });
}

//handle click event on to top button
function backToTop() {
    $('#toTop').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 800);
        $('#species-search').val('');
        return false;
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