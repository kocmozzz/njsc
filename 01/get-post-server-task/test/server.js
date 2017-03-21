process.env.NODE_ENV = 'test';

const server = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const fs = require('fs');
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

  // after((done) => {
  //   fs.unlinkSync(path.join(config.get('filesRoot'), testFileName));
  //   done();
  // });

  // добавить beforeEach с очисткой директории
  // перед тем как проверить получение файла надо его положить в папку из fixtures


  it('GET /file2.json should return file2.json', async () => {
    const fixtureContent = fs.readFileSync(path.join(config.get('filesRoot'), 'file1.txt'));

    const body = await rp.get(`${host}/file1.txt`);
    body.should.equals(fixtureContent.toString());
  });

  // it('GET /file1.txt should return file1.txt', (done) => {
  //   app
  //     .get('/file1.txt')
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.should.be.text;
  //       // проверки кода и контент тайп недостаточно, надо сверять body
  //       done();
  //     });
  // });

  // it('GET /file2.txt should return 404', (done) => {
  //   app
  //     .get('/file2.txt')
  //     .end((err, res) => {
  //       res.should.have.status(404);
  //       done();
  //     });
  // });

  // it('GET /filedir should return 400', (done) => {
  //   app
  //     .get('/filedir')
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       done();
  //     });
  // });

  // it('GET /.. should return 400', (done) => {
  //   app
  //     .get('/..')
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       done();
  //     });
  // });

  // it('GET ///file.txt should return 400', (done) => {
  //   app
  //     .get('///file.txt')
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       done();
  //     });
  // });

  // it(`POST /${testFileName} should upload file to public/files folder with name ${testFileName}`, (done) => {
  //   app
  //     .post(`/${testFileName}`)
  //     .attach('file', fs.readFileSync(path.join(config.get('fixturesRoot'), testFileName)), testFileName)
  //     .end((err) => {
  //       const result = fs.existsSync(path.join(config.get('filesRoot'), testFileName));
  //       result.should.equal(true);
  //       done();
  //     });
  // });

  // it(`POST /${testFileFail} should fail upload file with name ${testFileFail} with status code 413`, (done) => {
  //   app
  //     .post(`/${testFileFail}`)
  //     .attach('file', fs.readFileSync(path.join(config.get('fixturesRoot'), testFileFail)), testFileFail)
  //     .end((err, res) => {
  //       res.should.have.status(413);
  //       done();
  //     });
  // });

  // // как отпраивть файл без заголовка "Content-length"?
  // it(`POST /${testFileFail} should fail upload file with name ${testFileFail} without "Content-type" header with status code 413`, (done) => {
  //   app
  //     .post(`/${testFileFail}`)
  //     .send(fs.readFileSync(path.join(config.get('fixturesRoot'), testFileFail)))
  //     .end((err, res) => {
  //       res.should.have.status(413);
  //       done();
  //     });
  // });

  // it(`POST /${testFileName} should fail to upload file to public/files folder with name ${testFileName} with status code 409`, (done) => {
  //   app
  //     .post(`/${testFileName}`)
  //     .attach('file', fs.readFileSync(path.join(config.get('fixturesRoot'), testFileName)), testFileName)
  //     .end((err, res) => {
  //       res.should.have.status(409);
  //       done();
  //     });
  // });
});
