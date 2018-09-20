import "reflect-metadata"
import {expect, assert} from '../../utils/chai-import'
import * as rmdir from 'rimraf';
import * as fs from 'fs';

import {DifferencesDataFileRepository} from "../../../src/infrastructure/DifferencesDataFileRepository";

process.env.SERVER_FOLDER = __dirname + '/resources/';

describe('Given a repository which manage the differences monitored data', function () {

    beforeEach(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
        fs.mkdirSync(process.env.SERVER_FOLDER);
    });

    after(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
    });

    it('when saves files should store them in the differences folder', function (done) {
        new DifferencesDataFileRepository().store('earth', 'space stone').then(filePath => {
            assert.strictEqual(filePath, process.env.SERVER_FOLDER + 'differences/earth.txt');
            assert.strictEqual(fs.existsSync(filePath), true);
            assert.strictEqual(fs.readFileSync(filePath).toString(), 'space stone');
            done();
        })
    });

    it('when read files should read from differences folder', function () {
        let differencesDataFileRepository = new DifferencesDataFileRepository();
        differencesDataFileRepository.store('loki', 'tesseract')
            .then(() => {
                return expect(differencesDataFileRepository.read('loki')).to.eventually.eq('tesseract');
            });
    });

    it('should read list client names correcly', function () {
        let differencesDataFileRepository = new DifferencesDataFileRepository();

        fs.writeFileSync(process.env.SERVER_FOLDER + 'differences/loki.txt', 'tesseract');
        fs.writeFileSync(process.env.SERVER_FOLDER + 'differences/vision.txt', 'mind');

        fs.writeFileSync(process.env.SERVER_FOLDER + 'differences/guardian.txt', 'power');
        return expect(differencesDataFileRepository.listNames()).to
            .eventually.an('array').and
            .eventually.lengthOf(3).and
            .eventually.contain('loki').and
            .eventually.contain('vision').and
            .eventually.contain('guardian')
    });
});