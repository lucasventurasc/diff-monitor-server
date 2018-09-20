import "reflect-metadata"
import * as assert from 'assert'
import {BaselineDataFileRepository} from "../../../src/infrastructure/BaselineDataFileRepository";

let rmdir = require('rimraf');
let fs = require('fs');

process.env.SERVER_FOLDER = __dirname + '/resources/';

describe('Given a repository with manage baseline data', function () {

    beforeEach(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
        fs.mkdirSync(process.env.SERVER_FOLDER);
    });

    after(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
    });

    it('when saves files should store them into the baseline folder', function (done) {
        new BaselineDataFileRepository().store('galaxy', 'power stone').then(filePath => {
            assert.strictEqual(filePath,process.env.SERVER_FOLDER + 'baseline/galaxy.txt');
            assert.strictEqual(fs.existsSync(filePath), true);
            assert.strictEqual(fs.readFileSync(filePath).toString(),'power stone');
            done();
        })
    });

    it('when read files should read from baseline folder', function (done) {
        let baselineDataFileRepository = new BaselineDataFileRepository();
        baselineDataFileRepository.store('galaxy', 'power stone').then(() => {
            baselineDataFileRepository.read('galaxy').then((data) => {
                assert.strictEqual(data,'power stone');
                done();
            });
        });
    });

    it('should be able to list all baseline saved data', function (done) {
        let baselineDataFileRepository = new BaselineDataFileRepository();

        baselineDataFileRepository.store('galaxy', 'power stone')
            .then(() => baselineDataFileRepository.store('milkway', 'white')
            .then(() => baselineDataFileRepository.store('andromeda', 'purple')
            .then(() => baselineDataFileRepository.list().then((files) => {
            assert.strictEqual(filesArrayContains('galaxy.txt', files), true);
            assert.strictEqual(filesArrayContains('milkway.txt', files), true);
            assert.strictEqual(filesArrayContains('andromeda.txt', files), true);
            done();
        }))));
    });
});

function filesArrayContains(fileName, files) {

    for (let file of files) {
        console.log(file);
        if (file === fileName) {
            return true;
        }
    }
    return false;
}