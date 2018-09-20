import "reflect-metadata"
import * as assert from 'assert'
import * as rmdir from 'rimraf';
import * as fs from 'fs';
import {CurrentDataFileRepository} from "../../../src/infrastructure/CurrentDataFileRepository";

process.env.SERVER_FOLDER = __dirname + '/resources/';

describe('Given a repository which manage the current monitored data', function () {

    beforeEach(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
        fs.mkdirSync(process.env.SERVER_FOLDER);
    });

    after(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
    });

    it('when saves files should store them in the current folder', function (done) {
        new CurrentDataFileRepository().store('earth', 'space stone').then(filePath => {
            assert.strictEqual(filePath,process.env.SERVER_FOLDER + 'current/earth.txt');
            assert.strictEqual(fs.existsSync(filePath), true);
            assert.strictEqual(fs.readFileSync(filePath).toString(),'space stone');
            done();
        })
    });

    it('when read files should read from current folder', function (done) {
        let currentDataRepository = new CurrentDataFileRepository();
        currentDataRepository.store('loki', 'tesseract').then(() => {
        currentDataRepository.read('loki').then((data) => {
            assert.strictEqual(data,'tesseract');
            done();
        })});
    });
});