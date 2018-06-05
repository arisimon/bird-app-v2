const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { Observations } = require('../observations/models');
const { Species } = require('../species/models');
const { User } = require('../users/models');
const { app, runServer, closeServer } = require('../server');
const { JWT_EXPIRY, JWT_SECRET, TEST_DATABASE_URL, PORT } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);


//Seed database
function generateObservations() {
    return {
        user: faker.name.firstName(),
        scientificName: faker.name.firstName(),
        commonName: faker.name.lastName(),
        familyName: faker.name.firstName(),
        location: faker.address.streetAddress(),
        notes: faker.lorem.paragraph(),
        photos: faker.image.imageUrl(),
    };
}


function seedData() {
    const seedData = [];
    for(let i = 0; i < 10; i++) {
        seedData.push(generateObservations());
    }
    return Observations.insertMany(seedData);
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


describe('Observations API testing', function() {

    const username = 'user';
    const password = 'password';
    let firstName = '';
    let lastName = ''

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        seedData();
    });

    beforeEach(function() {
        return User.hashPassword(password).then(password =>
            User.create({
                username,
                password
            })
        );
    });

    afterEach(function() {
        return User.remove({});
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('Auth tests', function() {
        it('Should send protected data', function() {

            const token = jwt.sign({
                    user: {
                        username,
                    }
                },
                JWT_SECRET, {
                    algorithm: 'HS256',
                    subject: username,
                    expiresIn: '7d'
                }
            );

            return chai
                .request(app)
                .get('/observations')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                });
        });

        // it('Should return a valid auth token', function() {
        //     return chai
        //         .request(app)
        //         .post('/api/auth/login')
        //         .send({ username, password })
        //         .then(res => {
        //             expect(res).to.have.status(200);
        //             expect(res.body).to.be.an('object');
        //             const token = res.body.authToken;
        //             expect(token).to.be.a('string');
        //             const payload = jwt.verify(token, JWT_SECRET, {
        //                 algorithm: ['HS256']
        //             });
        //             expect(payload.user).to.deep.equal({
        //                 username,
        //                 firstName,
        //                 lastName,
        //                 password,
        //             });
        //         });
        // });

        // it('Should reject requests with incorrect usernames', function() {
        //     return chai
        //         .request(app)
        //         .post('/api/auth/login')
        //         .send({ username: 'wrongUsername', password })
        //         .then(() =>
        //             expect.fail(null, null, 'Request should not succeed')
        //         )
        //         .catch(err => {
        //             if(err instanceof chai.AssertionError) {
        //                 throw err;
        //             }

        //             const res = err.response;
        //             expect(res).to.have.status(401);
        //         });
        // });

        // it('Should reject requests with incorrect passwords', function() {
        //     return chai
        //         .request(app)
        //         .post('/api/auth/login')
        //         .send({ username, password: 'wrongPassword' })
        //         .then(() =>
        //             expect.fail(null, null, 'Request should not succeed')
        //         )
        //         .catch(err => {
        //             if(err instanceof chai.AssertionError) {
        //                 throw err;
        //             }

        //             const res = err.response;
        //             expect(res).to.have.status(401);
        //         });
        // });
    });

    describe('GET endpoint', function() {
        const token = jwt.sign({
                user: {
                    username,
                }
            },
            JWT_SECRET, {
                algorithm: 'HS256',
                subject: username,
                expiresIn: '7d'
            }
        );

        it('should get all observations', function() {
            let res;
            return chai.request(app)
                .get('/observations')
                .set('authorization', `Bearer ${token}`)
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    console.log(res.body, 'hello!');
                    expect(res.body).to.have.length.of.at.least(1);
                    return Observations.count();
                })
                .then(function(count) {
                    expect(res.body).to.have.lengthOf(count);
                });
        });

    });


    describe('POST endpoint', function() {

        const token = jwt.sign({
                user: {
                    username,
                }
            },
            JWT_SECRET, {
                algorithm: 'HS256',
                subject: username,
                expiresIn: '7d'
            }
        );

        it('should add new observation', function() {
            let newObservations = generateObservations();
            return chai.request(app)
                .post('/observations')
                .set('authorization', `Bearer ${token}`)
                .send(newObservations)
                .then(function(res) {

                    expect(res).to.have.status(201);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys(
                        'commonName', 'location', 'notes');
                    expect(res.body.commonName).to.equal(newObservations.commonName);
                    expect(res.body.location).to.equal(newObservations.location);
                    expect(res.body.notes).to.equal(newObservations.notes);
                    expect(res.body.id).to.not.be.null;

                    return Observations.findById(res.body.id);
                })
                .then(function(observation) {
                    expect(observation.commonName).to.equal(newObservations.commonName);
                    expect(observation.location).to.equal(newObservations.location);
                    expect(observation.notes).to.equal(newObservations.notes);
                });
        });
    });


    describe('PUT endpoint', function() {
        const token = jwt.sign({
                user: {
                    username,
                }
            },
            JWT_SECRET, {
                algorithm: 'HS256',
                subject: username,
                expiresIn: '7d'
            }
        );

        it('should update a Observations', function() {
            const updateObservations = {
                scientificName: "Updated scientificName",
                commonName: "Updated commonName",
                familyName: "Updated family",
                location: "Updated location",
                notes: "Updated notes",
                photos: "updated photos"
            };

            return Observations
                .findOne()
                .then(function(observation) {
                    updateObservations.id = observation.id;


                    return chai.request(app)
                        .put(`/observations/${observation.id}`)
                        .set('authorization', `Bearer ${token}`)
                        .send(updateObservations);
                })
                .then(function(res) {
                    console.log('res is', res);
                    console.log('res.body is', res.body);
                    expect(res).to.have.status(200);
                    return Observations.findById(updateObservations.id);
                })
                .then(function(observation) {
                    expect(observation.scientificName).to.equal(updateObservations.scientificName);
                    expect(observation.commonName).to.equal(updateObservations.commonName);
                    expect(observation.family).to.equal(updateObservations.family);
                    expect(observation.location).to.equal(updateObservations.location);
                    expect(observation.notes).to.equal(updateObservations.notes);
                    expect(observation.photos).to.equal(updateObservations.photos);
                });
        });
    });

    describe('DELETE endpoint', function() {
        const token = jwt.sign({
                user: {
                    username,
                }
            },
            JWT_SECRET, {
                algorithm: 'HS256',
                subject: username,
                expiresIn: '7d'
            }
        );

        it('should delete an observation', function() {
            let observation;

            return Observations
                .findOne()
                .then(function(_observation) {
                    observation = _observation;
                    return chai.request(app)
                        .delete(`/observations/${observation.id}`)
                        .set('authorization', `Bearer ${token}`);
                })
                .then(function(res) {
                    console.log(`res is: `, res)
                    expect(res).to.have.status(200);
                    return Observations.findById(observation.id);
                })
                .then(function(_observation) {
                    expect(_observation).to.be.null;
                });

        });

    });

});