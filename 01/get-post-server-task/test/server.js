process.env.NODE_ENV = 'test';

const server = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const fs = require('fs-extra');
const path = require('path');
const rp = require('request-promise');

const should = chai.should();
const host = `http://127.0.0.1:${config.get('serverPort')}`;

chai.use(chaiHttp);

describe('File server suite', () => {
  const testFileName = 'testuploadfile.txt';
  const testFileFail = 'testuploadfail.txt';

  before((done) => {
    server.listen(config.get('serverPort'), '127.0.0.1', done);
  });

  after((done) => {
    server.close(done);
    fs.emptyDirSync(config.get('filesRoot'));
  });

  beforeEach(() => {
    fs.emptyDirSync(config.get('filesRoot'));
  });

  describe(`GET /${testFileName}`, () => {
    context("When exists", () => {
      beforeEach(() => {
        fs.copySync(
          `${config.get('fixturesRoot')}/${testFileName}`,
          `${config.get('filesRoot')}/${testFileName}`
          );
      });

      it('returns 200 ok and file', async () => {
        const fixtureContent = fs.readFileSync(`${config.get('filesRoot')}/${testFileName}`);

        const body = await rp.get(`${host}/${testFileName}`);
        body.should.be.equals(fixtureContent.toString());
      });
    });

    context("When not found", () => {
      it("returns 404", async () => {
        try {
          await rp.get(`${host}/${testFileName}`);
        } catch (e) {
          e.statusCode.should.be.equal(404);
        }
      });
    });
  });

  describe('GET folder path /somefile', () => {
    it('returns 400', async () => {
      try {
        await rp.get(`${host}/somefile`);
      } catch (e) {
        e.statusCode.should.be.equal(400);
      }
    });
  });

  describe('POST /file.ext', () => {
    context('When exists and valid size', () => {
      beforeEach(() => {
        fs.copySync(
          `${config.get('fixturesRoot')}/${testFileName}`,
          `${config.get('filesRoot')}/${testFileName}`
          );
      });

      it('returns 409 and file not modified', async () => {
        const { mtime } = fs.statSync(`${config.get('filesRoot')}/${testFileName}`);

        try {
          await rp.post(`${host}/${testFileName}`);
        } catch (e) {
          const { mtime: newMtime } = fs.statSync(`${config.get('filesRoot')}/${testFileName}`);

          mtime.should.eql(newMtime);
          e.statusCode.should.be.equal(409);
        }
      });
    });

    context('When file is too big', () => {
      it('returns 413 and no file appears', async () => {
        try {
          await rp.post(`${host}/${testFileFail}`, {
            body: fs.readFileSync(`${config.get('fixturesRoot')}/${testFileFail}`)
          });
        } catch (e) {
          e.statusCode.should.be.equal(413);
          fs.existsSync(`${config.get('filesRoot')}/${testFileFail}`).should.equals(false);
        }
      });
    });

    context('otherwise', () => {
      it('returns 200 and file appears', async () => {
        await rp.post(`${host}/${testFileName}`, {
          body: fs.readFileSync(`${config.get('fixturesRoot')}/${testFileName}`)
        });

        fs.readFileSync(`${config.get('filesRoot')}/${testFileName}`).toString()
          .should.equals(fs.readFileSync(`${config.get('fixturesRoot')}/${testFileName}`).toString());
      });
    });
  });
});
