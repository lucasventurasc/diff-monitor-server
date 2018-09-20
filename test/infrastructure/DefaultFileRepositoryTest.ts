import "reflect-metadata"
import {expect, assert} from '../utils/chai-import'
import * as rmdir from 'rimraf';
import * as fs from 'fs';
import {DefaultFileRepository} from "../../src/infrastructure/DefaultFileRepository";

process.env.SERVER_FOLDER = __dirname + '/resources/';

describe('Given a repository', function () {

    beforeEach(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
        fs.mkdirSync(process.env.SERVER_FOLDER);
    });

    after(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
    });

    it('which manages folder, should be able to clear a then', function() {
        let path = process.env.SERVER_FOLDER + 'new/';
        fs.mkdirSync(path);

        let fileA = path + 'existent_file.txt';
        fs.writeFileSync(fileA, 'any data 1');

        let fileB = path + 'existent_file2.txt';
        fs.writeFileSync(fileB, 'any data 2');

        assert.strictEqual(fs.existsSync(fileA), true);
        assert.strictEqual(fs.existsSync(fileB), true);

        new DefaultFileRepository('new/').clear();

        assert.strictEqual(fs.existsSync(fileA), false);
        assert.strictEqual(fs.existsSync(fileB), false);
    });

    describe('which is able to read files', function() {
        it('when target file does not exists, should result an empty text', function() {
            let defaultFileRepository = new DefaultFileRepository('new/');

            return expect(defaultFileRepository.read('avengers')).to.eventually.empty;
        });

        it('when target file exists should bring their content', function() {
            let defaultFileRepository = new DefaultFileRepository('new/');

            fs.writeFileSync(process.env.SERVER_FOLDER + 'new/avengers.txt', 'a content');

            return expect(defaultFileRepository.read('avengers')).to.eventually.equal('a content')
        });

        it('should be able to list all files already saved at the moment', function() {
            let defaultFileRepository = new DefaultFileRepository('new/');

            fs.writeFileSync(process.env.SERVER_FOLDER + 'new/avengers.txt', 'a content');
            fs.writeFileSync(process.env.SERVER_FOLDER + 'new/justiceleague.txt', 'another content');
            fs.writeFileSync(process.env.SERVER_FOLDER + 'new/teentitans.txt', 'no content');

            return expect(defaultFileRepository.list())
                .to.eventually.contain('avengers.txt')
                .to.eventually.contain('justiceleague.txt')
                .to.eventually.contain('teentitans.txt');
        });

        it('should be able to list all files already saved at the moment', function() {
            /** Folder is created here*/
            let defaultFileRepository = new DefaultFileRepository('new/');

            /** Remove folder to throw an error **/
            rmdir.sync(process.env.SERVER_FOLDER);

            return expect(defaultFileRepository.list()).to.be.rejected;
        });
    });

    describe('which is able to save files', function() {

        it('when target folder does not exists then should create it', function (done) {
            let dataSaved = 'a fetched data';

            let expectedGeneratedFile = process.env.SERVER_FOLDER + 'new/avengers.txt';

            new DefaultFileRepository('new/').store('avengers', dataSaved).then((filePath) => {
                assertExpectedFileReadCorrectly(filePath, expectedGeneratedFile, dataSaved);
                done();
            });
        });

        it('when target folder already exists then should reuse it', function (done) {
            let expectedExistentFile = process.env.SERVER_FOLDER + 'new/existent_file.txt';
            fs.mkdirSync(process.env.SERVER_FOLDER + 'new/');
            fs.writeFileSync(expectedExistentFile, 'any data');

            let dataSaved = 'a fetched data';
            let expectedGeneratedFile = process.env.SERVER_FOLDER + 'new/avengers.txt';

            new DefaultFileRepository('new/').store('avengers', dataSaved).then((filePath) => {
                assertExpectedFileReadCorrectly(filePath, expectedGeneratedFile, dataSaved);
                assertExpectedFileReadCorrectly(expectedExistentFile, expectedExistentFile, 'any data');
                done();
            });
        });

        it('when target file does not exists then should create it', function (done) {
            let dataSaved = 'a fetched data';

            let expectedGeneratedFile = process.env.SERVER_FOLDER + 'new/avengers.txt';

            new DefaultFileRepository('new/').store('avengers', dataSaved).then((filePath) => {
                assertExpectedFileReadCorrectly(filePath, expectedGeneratedFile, dataSaved);
                done();
            });
        });

        it('when target file already exists then should replace it', function (done) {
            let expectedGeneratedFile = process.env.SERVER_FOLDER + 'new/avengers.txt';

            let firstDataSaved = 'a fetched data';
            fs.mkdirSync(process.env.SERVER_FOLDER + 'new/');
            fs.writeFileSync(expectedGeneratedFile, firstDataSaved);

            let secondDataSaved = 'another newer fetched data';
            new DefaultFileRepository('new/').store('avengers', secondDataSaved).then((filePath) => {
                assertExpectedFileReadCorrectly(filePath, expectedGeneratedFile, secondDataSaved);
                done();
            });
        });

        it('when receives a client name with format, should remove and save', function(done) {
            let dataSaved = 'a fetched data';

            let expectedGeneratedFile = process.env.SERVER_FOLDER + 'new/avengers.txt';

            new DefaultFileRepository('new/').store('avengers.txt', dataSaved).then((filePath) => {
                assertExpectedFileReadCorrectly(filePath, expectedGeneratedFile, dataSaved);
                done();
            });
        });

        it('when store files result in error should reject with error message', function() {
            /** Folder is created here*/
            let defaultFileRepository = new DefaultFileRepository('new/');

            /** Remove folder to throw an error **/
            rmdir.sync(process.env.SERVER_FOLDER);

            let clientName = 'avengers';
            let contentFile = 'I think that I never will be read';

            return expect(defaultFileRepository.store(clientName, contentFile)).to.be.rejected;
        });
    });
});


function assertExpectedFileReadCorrectly(filePath, expectedGeneratedFile, expectedDataSaved) {
    assert.strictEqual(filePath, expectedGeneratedFile);
    assert.strictEqual(fileExists(filePath), true);
    assert.strictEqual(readFile(filePath), expectedDataSaved);
}

function fileExists(filePath) {
    return fs.existsSync(filePath);
}

function readFile(filePath) {
    return fs.readFileSync(filePath).toString();
}
