const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const { Observations } = require('../observations/models');
const { Species } = require('../species/models');
const { app, runServer, closeServer } = require('../server');
const {JWT_EXPIRY, JWT_SECRET, TEST_DATABASE_URL} = require('../config');

const should = chai.should();

chai.use(chaiHttp);




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

// function makeUser(username, password) {
//     let newUser = new User ({
//         username: username,
//         password: password
//     });
//     newUser.save((err)=>{
//         if(err) {
//             throw err;
//         }
//     });
// }

function seedData() {
    const seedData = [];
    for (let i = 0; i < 10; i++) {
        seedData.push(generateObservation());
    }
    Observations.insertMany(seedData);
    // User.(makeUser("Bob", "password1234"));
    // makeUser("Bob", "$2a$10$BBLqhvvabdL2Bff.h9U2KelBD9gqPcWMQOYOWscPjvA4brB1/5a3C");
}

function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn("Deleting test database");
        mongoose.connection
            .dropDatabase()
            .then(result => resolve(result))
            .catch(err => reject(err));
    });
}


describe('Testing the observation API', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function() {
        return seedData();
    });
    afterEach(function() {
        return tearDownDb();
    });
    after(function() {
        return closeServer();
    });

    // describe('/POST Register', function() {
    // 	it('should Register, and check token', function(done) {
    // 		chai.request(app)
    // 			.post('/users/')
    // 			.send(loginDetails)
    // 			.then(function(err, res) {
    // 				res.should.have.status(201);
    // 				chai.request(app)
    // 			})
    // 		done();
    // 	})
    // })

    // describe('/POST Login', function() {
    // 	it('should Login, and check token', function(done) {
    // 		chai.request(app)
    // 			.post('/auth/login')
    // 			.send(loginDetails)
    // 			.then(function(err, res) {
    // 				res.should.have.status(200);
    // 				authToken = res.body.authToken;
    // 				console.log("authToken at login =" + authToken);
    // 				// login
    // 				chai.request(app)
    // 			})
    // 		done();
    // 	})
    // })

    describe('Test all endpoints', function() {
        beforeEach(function() {
            return generateObservation();
        });
        afterEach(function() {
            return tearDownDb();
        });

        it('GET should return all observations', function(done) {
            let res;
            // console.log("authToken=" + authToken);
            chai.request(app)
                .get('/observations')
                // .set('Authorization', `Bearer ${authToken}`)
                .then(function(_res) {
                    res = _res;
                    res.should.have.status(200);
                    res.body.should.have.length.of.at.least(1);
                    return Observations.count();
                })
                .then(function(count) {
                    res.body.should.have.length.of(count);
                });
            done();
        });
    })
})