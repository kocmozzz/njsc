process.env.NODE_ENV = 'test';

const server = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require('config');
const fs = require('fs');
const path = require('path');

const should = chai.should();

chai.use(chaiHttp);

describe('File server suite', () => {
  let app;
  const testFileName = 'testuploadfile.txt';
  const testFileFail = 'testuploadfail.txt';

  before((done) => {
    app = chai.request(server);
    done();
  });

  after((done) => {
    fs.unlinkSync(path.join(config.get('filesRoot'), testFileName));
    done();
  });


  it('GET /index.html should return index.html', (done) => {
    app
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.html;
        done();
      });
  });

  it('GET /file2.json should return file2.json', (done) => {
    app
      .get('/file2.json')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  });

  it('GET /file1.txt should return file1.txt', (done) => {
    app
      .get('/file1.txt')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.text;
        done();
      });
  });

  it('GET /file2.txt should return 404', (done) => {
    app
      .get('/file2.txt')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('GET /filedir should return 400', (done) => {
    app
      .get('/filedir')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it(`POST /${testFileName} should upload file to public/files folder with name ${testFileName}`, (done) => {
    app
      .post(`/${testFileName}`)
      .attach('file', fs.readFileSync(path.join(config.get('publicRoot'), testFileName)), testFileName)
      .end((err) => {
        const result = fs.existsSync(path.join(config.get('filesRoot'), testFileName));
        result.should.equal(true);
        done();
      });
  });

  it(`POST /${testFileFail} should fail upload file with name ${testFileFail} with status code 413`, (done) => {
    app
      .post(`/${testFileFail}`)
      .attach('file', fs.readFileSync(path.join(config.get('publicRoot'), testFileFail)), testFileFail)
      .end((err, res) => {
        res.should.have.status(413);
        done();
      });
  });

  // как отпраивть файл без заголовка "Content type"?
  it(`POST /${testFileFail} should fail upload file with name ${testFileFail} without "Content-type" header with status code 413`, (done) => {
    app
      .post(`/${testFileFail}`)
      .send(fs.readFileSync(path.join(config.get('publicRoot'), testFileFail)))
      .end((err, res) => {
        res.should.have.status(413);
        done();
      });
  });

  it(`POST /${testFileName} should fail to upload file to public/files folder with name ${testFileName} with status code 409`, (done) => {
    app
      .post(`/${testFileName}`)
      .attach('file', fs.readFileSync(path.join(config.get('publicRoot'), testFileName)), testFileName)
      .end((err, res) => {
        res.should.have.status(409);
        done();
      });
  });

  // как тестировать закрытие соединения?
});
