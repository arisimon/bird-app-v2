const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const { Observations } = require('../observations/models');
const { Species } = require('../species/models');
const { app, runServer, closeServer } = require('../server');
const { JWT_EXPIRY, JWT_SECRET, TEST_DATABASE_URL, PORT } = require('../config');

const expect = chai.expect();

chai.use(chaiHttp);


let loginDetails = {
    'username': 'test',
    'password': 'password'
}

let testUsername = 'test';

let testPassword = 'password'

let authToken;


//Seed database
function generateObservation() {
    return {
        scientificName: faker.name,
        commonName: faker.name,
        familyName: faker.name,
        location: faker.address.streetAddress,
        notes: faker.lorem.paragraph(),
        photos: faker.image.imageUrl
    };
}


function seedData() {
    const seedData = [];
    for(let i = 0; i < 10; i++) {
        seedData.push(generateObservation());
    }
    Observations.insertMany(seedData);
}

// function tearDownDb() {
//     return new Promise((resolve, reject) => {
//         console.warn("Deleting test database");
//         mongoose.connection
//             .dropDatabase()
//             .then(result => resolve(result))
//             .catch(err => reject(err));
//     });
// }


describe('Testing the observation API', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
        console.log(TEST_DATABASE_URL);
    });
    beforeEach(function() {
        return seedData();
    });
    // afterEach(function() {
    //     return tearDownDb();
    // });
    after(function() {
        return closeServer();
    });

    describe('/POST Register', function() {
        it('should Register, and check token', function(done) {
            chai.request(app)
                .post('/users/')
                .send(loginDetails)
                .then(function(err, res) {
                    res.should.have.status(201);
                    chai.request(app)
                })
            done();
        })
    })

    describe('/POST Login', function() {
        it('should Login, and check token', function(done) {
            chai.request(app)
                .post('/auth/login')
                .send(loginDetails)
                .then(function(err, res) {
                    res.should.have.status(200);
                    authToken = res.body.authToken;
                    chai.request(app)
                })
            done();
        })
    })

})