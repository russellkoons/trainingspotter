const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Log} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedLogs() {
  console.info('seeding logs to test server');
  const seedLogs = [];
  for (let i = 0; i <= 5; i++) {
    seedLogs.push(generateLogs());
  };
  return Log.insertMany(seedLogs);
}

function generateLogs() {
  return {
    routine: faker.random.word(),
    user: faker.name.findName(),
    lifts: [
      {
        name: faker.random.word(),
        weight: faker.random.number(),
        sets: faker.random.number(),
        reps: faker.random.number()
      },
      {
        name: faker.random.word(),
        weight: faker.random.number(),
        sets: faker.random.number(),
        reps: faker.random.number()
      },
      {
        name: faker.random.word(),
        weight: faker.random.number(),
        sets: faker.random.number(),
        reps: faker.random.number()
      },
      {
        name: faker.random.word(),
        weight: faker.random.number(),
        sets: faker.random.number(),
        reps: faker.random.number()
      }
    ],
    notes: faker.lorem.words(),
    date: faker.date.recent()
  }
}

function deleteDb() {
  console.warn('Deleting test database');
  return mongoose.connection.dropDatabase();
}

describe('trainingspotter API', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedLogs();
  });

  afterEach(function() {
    return deleteDb();
  });

  after(function() {
    return closeServer();
  });

  it('should respond', function() {
    return chai
      .request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.have.status(200);
      });
  });

  describe('GET endpoint', function() {

    it('should return workout logs', function() {
      let res;
      return chai.request(app)
        .get('/logs')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return Log.count();
        })
      .then(function(count) {
        expect(res.body).to.have.length(count);
      });
    });

    it('should return logs with the right fields', function() {
      let resLog;
      return chai.request(app)
        .get('/logs')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          res.body.forEach(function(log) {
            expect(log).to.be.a('object');
            expect(log).a.include.keys(
              'id', 'routine', 'user', 'lifts', 'notes', 'date'
            );
          });
          resLog = res.body[0];
          return Log.findById(resLog.id);
        })
        .then(function(log) {
          expect(resLog.id).to.equal(log.id);
          expect(resLog.routine).to.equal(log.routine);
          expect(resLog.user).to.equal(log.user);
          expect(resLog.lifts[0].name).to.equal(log.lifts[0].name);
          expect(resLog.lifts[0].weight).to.equal(log.lifts[0].weight);
          expect(resLog.lifts[0].sets).to.equal(log.lifts[0].sets);
          expect(resLog.lifts[0].reps).to.equal(log.lifts[0].reps);
          expect(resLog.notes).to.equal(log.notes);
        });
    });
  });

});