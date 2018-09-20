import * as rmdir from 'rimraf';
import * as fs from 'fs';
import "reflect-metadata"
import {suite, test} from "mocha-typescript";
import {expect, assert} from '../utils/chai-import';
import {DifferencesDataFileRepository} from "../../src/infrastructure/DifferencesDataFileRepository";
import {DataAnalyzer} from "../../src/application/analyze/DataAnalyzer";
import {CurrentDataFileRepository} from "../../src/infrastructure/CurrentDataFileRepository";
import {BaselineDataFileRepository} from "../../src/infrastructure/BaselineDataFileRepository";

process.env.SERVER_FOLDER = __dirname + '/resources/';

@suite
class DataAnalyzerTest {

    /**before each test*/
    before() {
        rmdir.sync(process.env.SERVER_FOLDER);
        fs.mkdirSync(process.env.SERVER_FOLDER);
    };

    /**after all tests*/
    static after() {
        rmdir.sync(process.env.SERVER_FOLDER);
    }

    @test retrieve_empty_when_there_are_no_files_with_difference(done) {
        let baselineDataRepository = new BaselineDataFileRepository();
        let currentDataRepository =  new CurrentDataFileRepository();
        let differencesDataRepository = new DifferencesDataFileRepository();
        let dataAnalyzer = new DataAnalyzer(baselineDataRepository, currentDataRepository, differencesDataRepository);

        console.log('im here again but' + Object.getOwnPropertyNames(dataAnalyzer));
        dataAnalyzer.listClientsWithAddedInconsistencies((clientFilesWithNewInconsistencies) => {
            assert.fail();
        });

        setTimeout(done, 200);
    }

    @test retrieve_differences_between_clients_comparing_with_their_baselines(done) {
        let baselineDataRepository = new BaselineDataFileRepository();
        let currentDataRepository =  new CurrentDataFileRepository();
        let differencesDataRepository = new DifferencesDataFileRepository();
        let dataAnalyzer = new DataAnalyzer(baselineDataRepository, currentDataRepository, differencesDataRepository);

        baselineDataRepository.store('ebm', 'No have inconsistencies');
        baselineDataRepository.store('pacaembu', 'No have inconsistencies');
        baselineDataRepository.store('secol', 'No have inconsistencies');

        currentDataRepository.store('ebm', '1 new inconsistency');
        currentDataRepository.store('pacaembu', 'No have inconsistencies');
        currentDataRepository.store('secol', '2 new inconsistencies');

        setTimeout(() => {
            dataAnalyzer.listClientsWithAddedInconsistencies((clientFilesWithNewInconsistencies) => {
                assert.lengthOf(clientFilesWithNewInconsistencies, 2);
                assert.equal(clientFilesWithNewInconsistencies[0], 'ebm');
                assert.equal(clientFilesWithNewInconsistencies[1], 'secol');
                done();
            });
        }, 50);
    }

    @test should_not_retrieve_as_difference_when_client_does_not_have_their_own_counterpart_on_baseline(done) {
        let baselineDataRepository = new BaselineDataFileRepository();
        let currentDataRepository =  new CurrentDataFileRepository();
        let differencesDataRepository = new DifferencesDataFileRepository();
        let dataAnalyzer = new DataAnalyzer(baselineDataRepository, currentDataRepository, differencesDataRepository);

        baselineDataRepository.store('ebm', 'Dont have current data monitored');
        currentDataRepository.store('pacaembu', 'Dont have baseline data saved');

        setTimeout(() => {
            dataAnalyzer.listClientsWithAddedInconsistencies((clientFilesWithNewInconsistencies) => {
                expect(clientFilesWithNewInconsistencies).to.have.length(0);
                done();
            });
        }, 100);
    };

    @test should_not_bring_files_with_no_differences_anymore(done) {
        let baselineDataRepository = new BaselineDataFileRepository();
        let currentDataRepository =  new CurrentDataFileRepository();
        let differencesDataRepository = new DifferencesDataFileRepository();
        let dataAnalyzer = new DataAnalyzer(baselineDataRepository, currentDataRepository, differencesDataRepository);

        baselineDataRepository.store('ebm', 'abc');
        currentDataRepository.store('ebm', '123');

        baselineDataRepository.store('secol', 'xyz');
        currentDataRepository.store('secol', 'xyz');

        differencesDataRepository.store('secol', 'xyz');

        setTimeout(() => {
            dataAnalyzer.listClientsWithAddedInconsistencies((clientFilesWithNewInconsistencies) => {
                assert.lengthOf(clientFilesWithNewInconsistencies, 1);
                assert.equal(clientFilesWithNewInconsistencies[0], 'ebm');
                done();
            });
        }, 50);
    }
}