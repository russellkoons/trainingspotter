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
  console.info('Seeding logs to test server');
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
        unit: 'lbs',
        sets: faker.random.number(),
        reps: faker.random.number()
      },
      {
        name: faker.random.word(),
        weight: faker.random.number(),
        unit: 'kgs',
        sets: faker.random.number(),
        reps: faker.random.number()
      },
      {
        name: faker.random.word(),
        weight: faker.random.number(),
        unit: 'kgs',
        sets: faker.random.number(),
        reps: faker.random.number()
      },
      {
        name: faker.random.word(),
        weight: faker.random.number(),
        unit: 'lbs',
        sets: faker.random.number(),
        reps: faker.random.number()
      }
    ],
    notes: faker.lorem.words()
  }
}

function deleteDb() {
  console.warn('Deleting test database');
  return mongoose.connection.dropDatabase();
}

describe('Testing the server', function() {
  it('should respond', function() {
    return chai
      .request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.have.status(200);
      });
  });
})

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
            expect(log).to.include.keys(
              'id', 'routine', 'user', 'lifts', 'notes', 'date'
            );
            expect(log.lifts[0]).to.include.keys(
              'name', 'weight', 'unit', 'sets', 'reps'
            );
            expect(log.lifts[1]).to.include.keys(
              'name', 'weight', 'unit', 'sets', 'reps'
            );
            expect(log.lifts[2]).to.include.keys(
              'name', 'weight', 'unit', 'sets', 'reps'
            );
            expect(log.lifts[3]).to.include.keys(
              'name', 'weight', 'unit', 'sets', 'reps'
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
          expect(resLog.lifts[0].unit).to.equal(log.lifts[0].unit);
          expect(resLog.lifts[0].sets).to.equal(log.lifts[0].sets);
          expect(resLog.lifts[0].reps).to.equal(log.lifts[0].reps);
          expect(resLog.lifts[1].name).to.equal(log.lifts[1].name);
          expect(resLog.lifts[1].weight).to.equal(log.lifts[1].weight);
          expect(resLog.lifts[1].unit).to.equal(log.lifts[1].unit);
          expect(resLog.lifts[1].sets).to.equal(log.lifts[1].sets);
          expect(resLog.lifts[1].reps).to.equal(log.lifts[1].reps);
          expect(resLog.lifts[2].name).to.equal(log.lifts[2].name);
          expect(resLog.lifts[2].weight).to.equal(log.lifts[2].weight);
          expect(resLog.lifts[1].unit).to.equal(log.lifts[2].unit);
          expect(resLog.lifts[2].sets).to.equal(log.lifts[2].sets);
          expect(resLog.lifts[2].reps).to.equal(log.lifts[2].reps);
          expect(resLog.lifts[3].name).to.equal(log.lifts[3].name);
          expect(resLog.lifts[3].weight).to.equal(log.lifts[3].weight);
          expect(resLog.lifts[3].unit).to.equal(log.lifts[3].unit);
          expect(resLog.lifts[3].sets).to.equal(log.lifts[3].sets);
          expect(resLog.lifts[3].reps).to.equal(log.lifts[3].reps);
          expect(resLog.notes).to.equal(log.notes);
        });
    });
  });

  describe('POST endpoint', function() {
    it('should make a new log', function() {
      const newLog = generateLogs();
      return chai.request(app)
        .post('/logs')
        .send(newLog)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'routine', 'user', 'lifts', 'notes', 'date'
          );
          expect(res.body.routine).to.equal(newLog.routine);
          expect(res.body.id).to.not.be.null;
          expect(res.body.user).to.equal(newLog.user);
          expect(res.body.lifts[0].name).to.equal(newLog.lifts[0].name);
          expect(res.body.lifts[0].weight).to.equal(newLog.lifts[0].weight);
          expect(res.body.lifts[0].unit).to.equal(newLog.lifts[0].unit);
          expect(res.body.lifts[0].sets).to.equal(newLog.lifts[0].sets);
          expect(res.body.lifts[0].reps).to.equal(newLog.lifts[0].reps);
          expect(res.body.lifts[1].name).to.equal(newLog.lifts[1].name);
          expect(res.body.lifts[1].weight).to.equal(newLog.lifts[1].weight);
          expect(res.body.lifts[1].unit).to.equal(newLog.lifts[1].unit);
          expect(res.body.lifts[1].sets).to.equal(newLog.lifts[1].sets);
          expect(res.body.lifts[1].reps).to.equal(newLog.lifts[1].reps);
          expect(res.body.lifts[2].name).to.equal(newLog.lifts[2].name);
          expect(res.body.lifts[2].weight).to.equal(newLog.lifts[2].weight);
          expect(res.body.lifts[2].unit).to.equal(newLog.lifts[2].unit);
          expect(res.body.lifts[2].sets).to.equal(newLog.lifts[2].sets);
          expect(res.body.lifts[2].reps).to.equal(newLog.lifts[2].reps);
          expect(res.body.lifts[3].name).to.equal(newLog.lifts[3].name);
          expect(res.body.lifts[3].weight).to.equal(newLog.lifts[3].weight);
          expect(res.body.lifts[3].unit).to.equal(newLog.lifts[3].unit);
          expect(res.body.lifts[3].sets).to.equal(newLog.lifts[3].sets);
          expect(res.body.lifts[3].reps).to.equal(newLog.lifts[3].reps);
          expect(res.body.notes).to.equal(newLog.notes);
          expect(res.body.date).to.not.be.null;
          return Log.findById(res.body.id);
        })
        .then(function(log) {
          expect(log.routine).to.equal(newLog.routine);
          expect(log.user).to.equal(newLog.user);
          expect(log.lifts[0].name).to.equal(newLog.lifts[0].name);
          expect(log.lifts[0].weight).to.equal(newLog.lifts[0].weight);
          expect(log.lifts[0].unit).to.equal(newLog.lifts[0].unit);
          expect(log.lifts[0].sets).to.equal(newLog.lifts[0].sets);
          expect(log.lifts[0].reps).to.equal(newLog.lifts[0].reps);
          expect(log.lifts[1].name).to.equal(newLog.lifts[1].name);
          expect(log.lifts[1].weight).to.equal(newLog.lifts[1].weight);
          expect(log.lifts[1].unit).to.equal(newLog.lifts[1].unit);
          expect(log.lifts[1].sets).to.equal(newLog.lifts[1].sets);
          expect(log.lifts[1].reps).to.equal(newLog.lifts[1].reps);
          expect(log.lifts[2].name).to.equal(newLog.lifts[2].name);
          expect(log.lifts[2].weight).to.equal(newLog.lifts[2].weight);
          expect(log.lifts[2].unit).to.equal(newLog.lifts[2].unit);
          expect(log.lifts[2].sets).to.equal(newLog.lifts[2].sets);
          expect(log.lifts[2].reps).to.equal(newLog.lifts[2].reps);
          expect(log.lifts[3].name).to.equal(newLog.lifts[3].name);
          expect(log.lifts[3].weight).to.equal(newLog.lifts[3].weight);
          expect(log.lifts[3].unit).to.equal(newLog.lifts[3].unit);
          expect(log.lifts[3].sets).to.equal(newLog.lifts[3].sets);
          expect(log.lifts[3].reps).to.equal(newLog.lifts[3].reps);
          expect(log.notes).to.equal(newLog.notes);
        });
    });
  });

  describe('PUT endpoint', function() {
    it('should update fields you send', function() {
      const updateData = {
        routine: 'A',
        lifts: [{
          name: 'Squat',
          weight: 225,
          unit: 'lbs',
          sets: 5,
          reps: 5
        }],
        notes: 'New update fam'
      };
      return Log
        .findOne()
        .then(function(log) {
          updateData.id = log.id;
          return chai.request(app)
            .put(`/logs/${log.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Log.findById(updateData.id);
        })
        .then(function(log) {
          expect(log.routine).to.equal(updateData.routine);
          expect(log.lifts[0].name).to.equal(updateData.lifts[0].name);
          expect(log.lifts[0].weight).to.equal(updateData.lifts[0].weight);
          expect(log.lifts[0].unit).to.equal(updateData.lifts[0].unit);
          expect(log.lifts[0].sets).to.equal(updateData.lifts[0].sets);
          expect(log.lifts[0].reps).to.equal(updateData.lifts[0].reps);
          expect(log.notes).to.equal(updateData.notes);
        });
    });
  });

  describe('DELETE endpoint', function() {
    it('delete log by id', function() {
      let log;
      return Log
        .findOne()
        .then(function(_log) {
          log = _log;
          return chai.request(app).delete(`/logs/${log.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Log.findById(log.id);
        })
        .then(function(_log) {
          expect(_log).to.be.null;
        });
    });
  });

});