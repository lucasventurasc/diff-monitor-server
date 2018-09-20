import "reflect-metadata"
import {suite, test, slow, timeout} from "mocha-typescript";
import {expect, assert} from '../utils/chai-import'
import * as rmdir from 'rimraf';
import * as fs from 'fs';
import {BaselineDataFileRepository} from "../../src/infrastructure/BaselineDataFileRepository";
import {CurrentDataFileRepository} from "../../src/infrastructure/CurrentDataFileRepository";
import {HttpRequestMockBuilder} from "../infrastructure/HttpRequestMockBuilder";
import {DefaultRestClient} from "../../src/infrastructure/DefaultRestClient";
import {EndpointsRepositoryStub} from "./EndpointsRepositoryStub";
import {EndpointsDataScanner} from "../../src/application/scan/EndpointsDataScanner";


process.env.SERVER_FOLDER = __dirname + '/resources/';

@suite
class EndpointsDataScannerTest {

    private requestMock: HttpRequestMockBuilder;
    private baselineRepository: BaselineDataFileRepository;
    private currentRepository: CurrentDataFileRepository;
    private endpointsRepository: EndpointsRepositoryStub;

    /**before each test*/
    before() {
        rmdir.sync(process.env.SERVER_FOLDER);
        fs.mkdirSync(process.env.SERVER_FOLDER);
        this.requestMock = new HttpRequestMockBuilder();

        this.baselineRepository = new BaselineDataFileRepository();
        this.currentRepository = new CurrentDataFileRepository();
        this.endpointsRepository = new EndpointsRepositoryStub();
    }


    /**after all tests*/
    static after() {
        rmdir.sync(process.env.SERVER_FOLDER);
    }

    @test shouldClearBaselineAndRepopulate(done) {
        let request = this.requestMock
            .forUrl('http://clientlink.com').status(200).body('new-content').and()
            .forUrl('http://clientthik.com').status(200).body('either-new').mock();
        let siengeRestClient = new DefaultRestClient(request, 10);

        let scanner = new EndpointsDataScanner(this.endpointsRepository, siengeRestClient, this.baselineRepository);

        let promiseBaseline = Promise.all([
            this.baselineRepository.store('clientlink', 'abc'),
            this.baselineRepository.store('clientthik', 'xyz'),
            this.baselineRepository.store('old', 'hey')
        ]);

        promiseBaseline.then(() => scanner.scan());

        setTimeout(() => {
            let folder = process.env.SERVER_FOLDER + 'baseline/';
            expect(fs.readdirSync(folder))
                .contain('clientlink.txt').and
                .contain('clientthik.txt').and
                .contain('old.txt');

            expect(fs.readFileSync(folder + '/clientlink.txt').toString()).equal('new-content');
            expect(fs.readFileSync(folder + '/clientthik.txt').toString()).equal('either-new');
            expect(fs.readFileSync(folder + '/old.txt').toString()).equal('hey');
            done();
        }, 500);
    }

    @test should_override_already_scanned_data_add_new_ones_and_preserve_not_downloaded(done) {
        let promiseCurrent = Promise.all([
            this.currentRepository.store('clientlink', 'dfg'),
            this.currentRepository.store('old', 'lady')
        ]);

        let request = this.requestMock
            .forUrl('http://clientlink.com').status(200).body('new-content').and()
            .forUrl('http://clientthik.com').status(200).body('new-client').mock();
        let siengeRestClient = new DefaultRestClient(request, 10);

        let scanner = new EndpointsDataScanner(this.endpointsRepository, siengeRestClient, this.currentRepository);
        promiseCurrent.then(() => scanner.scan());

        setTimeout(() => {
            let folder = process.env.SERVER_FOLDER + 'current/';
            expect(fs.readdirSync(folder))
                .to.have.length(3).and
                .contain('clientlink.txt').and
                .contain('clientthik.txt').and
                .contain('old.txt');

            expect(fs.readFileSync(folder + '/clientlink.txt').toString()).equal('new-content');
            expect(fs.readFileSync(folder + '/clientthik.txt').toString()).equal('new-client');
            expect(fs.readFileSync(folder + '/old.txt').toString()).equal('lady');
            done();
        }, 500);
    }
}
