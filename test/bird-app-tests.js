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
    const firstName = '';
    const lastName = '';

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
                    console.log('res.body.data[0] is: ', res.body.data[0]);
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                });
        });

        it('Should return a valid auth token', function() {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username, password })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const payload = jwt.verify(token, JWT_SECRET, {
                        algorithm: ['HS256']
                    });
                    expect(payload.user).to.deep.equal({
                        username,
                        firstName,
                        lastName
                    });
                });
        });

        it('Should reject requests with incorrect usernames', function() {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username: 'wrongUsername', password })
                .then(() =>
                    expect.fail(null, null, 'Request should not succeed')
                )
                .catch(err => {
                    if(err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });

        it('Should reject requests with incorrect passwords', function() {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username, password: 'wrongPassword' })
                .then(() =>
                    expect.fail(null, null, 'Request should not succeed')
                )
                .catch(err => {
                    if(err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
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

        it('should return all observations', function() {
            let res;
            return chai.request(app)
                .get('/observations')
                .set('authorization', `Bearer ${token}`)
                .then(function(_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.data).to.have.length.of.at.least(1);
                    return Observation.count();
                })
                .then(function(count) {
                    expect(res.body.data).to.have.lengthOf(count);
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
            let newObservation = createObservation();
            return chai.request(app)
                .post('/observations')
                .set('authorization', `Bearer ${token}`)
                .send(newObservation)
                .then(function(res) {

                    expect(res).to.have.status(201);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys(
                        'commonName', 'location', 'notes');
                    expect(res.body.commonName).to.equal(newObservation.commonName);
                    expect(res.body.location).to.equal(newObservation.location);
                    expect(res.body.notes).to.equal(newObservation.notes);
                    expect(res.body.id).to.not.be.null;

                    return Observation.findById(res.body.id);
                })
                .then(function(observation) {
                    expect(res.body.commonName).to.equal(newObservation.commonName);
                    expect(res.body.location).to.equal(newObservation.location);
                    expect(res.body.notes).to.equal(newObservation.notes);
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

        it('should update a Observation', function() {
            const updateObservation = {
                scientificName: "Updated scientificName",
                commonName: "Updated commonName",
                family: "Updated family",
                location: "Updated location",
                notes: "Updated notes",
                photos: "updated photos"
            };

            return Observation
                .findOne()
                .then(function(observation) {
                    updateObservation.id = post.id;

                    return chai.request(app)
                        .put(`/observations/${post.id}`)
                        .set('authorization', `Bearer ${token}`)
                        .send(updateObservation);
                })
                .then(function(res) {
                    console.log('res is', res);
                    console.log('res.body is', res.body);
                    expect(res).to.have.status(200);
                    return Observation.findById(updateObservation.id);
                })
                .then(function(observation) {
                    expect(observation.scientificName).to.equal(updateObservation.scientificName);
                    expect(observation.commonName).to.equal(updateObservation.commonName);
                    expect(observation.family).to.equal(updateObservation.family);
                    expect(observation.location).to.equal(updateObservation.location);
                    expect(observation.notes).to.equal(updateObservation.notes);
                    expect(observation.photos).to.equal(updateObservation.photos);
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

            return Observation
                .findOne()
                .then(function(_observation) {
                    observation = _observation;
                    return chai.request(app)
                        .delete(`/observations/${post.id}`)
                        .set('authorization', `Bearer ${token}`);
                })
                .then(function(res) {
                    console.log(`res is: `, res)
                    expect(res).to.have.status(200);
                    return Observation.findById(observation.id);
                })
                .then(function(_observation) {
                    expect(_observation).to.be.null;
                });

        });

    });


});