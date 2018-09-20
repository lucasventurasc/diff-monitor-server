import "reflect-metadata"
import {expect, assert} from '../utils/chai-import';
import * as rmdir from 'rimraf';
import * as fs from 'fs';
import {DefaultRestClient} from "../../src/infrastructure/DefaultRestClient";
import {ClientLink} from "../../src/domain/ClientLink";
import {HttpRequestMockBuilder} from "./HttpRequestMockBuilder";
import {StoreKeeperMock} from "./StoreKeeperMock";
import has = Reflect.has;

const TEST_INTERVAL_BETWEEN_REQUESTS = 50;
process.env.SERVER_FOLDER = __dirname + '/resources/';

describe('Given a Sienge endpoint accessible by this component', function () {

    beforeEach(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
        fs.mkdirSync(process.env.SERVER_FOLDER);
    });

    after(function () {
        rmdir.sync(process.env.SERVER_FOLDER);
    });

    it('when make http request to an invalid link should not call store keeper', function(done) {
        let mockHttpRequest = new HttpRequestMockBuilder()
            .forUrl('http://gen.sienge.com.br').status(500).resultOnError(null).and()
            .forUrl('http://sup.sienge.com.br').resultOnError('Fail to call request').status(null).mock();

        let clientsLinksExpected = [new ClientLink('http://gen.sienge.com.br', '123'),
                                    new ClientLink('http://sup.sienge.com.br', '456')];
        let restClient = new DefaultRestClient(mockHttpRequest, TEST_INTERVAL_BETWEEN_REQUESTS);

        restClient.fetchAllInconsistencies(clientsLinksExpected, {
            store: function() {
                assert.fail("Store keeper should never be called")
            }
        });

        finishTestSuccessfullyAfterThreeTimesIntervalBetweenRequests(done);
    });

    it('should wait between requests to not be recognized as DDOS attack and makes performance issues on target', function(done) {
        let mockHttpRequest = new HttpRequestMockBuilder()
            .forUrl('http://eng.sienge.com.br').status(200).body('eng123').and()
            .forUrl('http://sup.sienge.com.br').status(200).body('sup456').and()
            .forUrl('http://pla.sienge.com.br').status(200).body('pla789').mock();

        let clientsLinksExpected = [new ClientLink('http://eng.sienge.com.br', '123'),
                                    new ClientLink('http://sup.sienge.com.br', '456'),
                                    new ClientLink('http://pla.sienge.com.br', '789')];


        let specifiedTimeBetweenRequests = 80;
        let restClient = new DefaultRestClient(mockHttpRequest, specifiedTimeBetweenRequests);

        let storeCalledTimesCount = 0;
        let intervalsBetweenCalls = [];
        let timeBeforeCalls = Date.now();
        restClient.fetchAllInconsistencies(clientsLinksExpected, {
            store: function () {
                storeCalledTimesCount++;
                intervalsBetweenCalls.push(Date.now() - timeBeforeCalls);
                if(hasDoneAllExpectedCalls(storeCalledTimesCount, clientsLinksExpected.length)) {
                    assertIntervalsBetweenCallsAreApproximately(specifiedTimeBetweenRequests, intervalsBetweenCalls);
                    done();
                }
            }
        });
    });

    it('should not make request calls with a delay less than 4000 milliseconds, when interval is not specified', function() {
        let restClient = new DefaultRestClient({}, null);

        expect(restClient._intervalBetweenRequests).to.be.gte(4000);
    });

    it('when receives valid links, should be able to make http requests and chain to a store keeper', function(done) {
        let mockHttpRequest = new HttpRequestMockBuilder()
            .forUrl('http://eng.sienge.com.br').status(200).body('eng123').and()
            .forUrl('http://sup.sienge.com.br').status(200).body('sup456').mock();

        let clientsLinksExpected = [new ClientLink('http://eng.sienge.com.br', '123'),
                                    new ClientLink('http://sup.sienge.com.br', '456')];

        let storeKeeper = new StoreKeeperMock();
        let restClient = new DefaultRestClient(mockHttpRequest, TEST_INTERVAL_BETWEEN_REQUESTS);
        restClient.fetchAllInconsistencies(clientsLinksExpected, storeKeeper);

        let storedData = [];
        storeKeeper.waitCallback((actualClientName, actualData) => {
            storedData.push({clientName: actualClientName, data: actualData});

            if(hasDoneAllExpectedCalls(storedData.length, clientsLinksExpected.length)) {
                assertStoredData('eng', 'eng123', storedData);
                assertStoredData('sup', 'sup456', storedData);
                done();
            }
        });

        it('should build header with basic auth using data from client link', function(done) {
            let mockHttpRequest = new HttpRequestMockBuilder();
            let mockHttpRequestCall = mockHttpRequest
                .forUrl('http://eng.sienge.com.br').status(200).body('eng123').and()
                .forUrl('http://sup.sienge.com.br').status(200).body('sup456').mock();

            let clientsLinksExpected = [new ClientLink('http://eng.sienge.com.br', '123'),
                new ClientLink('http://sup.sienge.com.br', '456')];

            let storeKeeper = new StoreKeeperMock();
            new DefaultRestClient(mockHttpRequestCall, TEST_INTERVAL_BETWEEN_REQUESTS)
                .fetchAllInconsistencies(clientsLinksExpected, storeKeeper);

            let count = 0;
            storeKeeper.waitCallback((clientName) => {
                let headers = mockHttpRequest.requestSettingsFor('http://' + clientName + '.sienge.com.br').headers;
                assertHeadersFor(clientName === 'eng' ? '123' : '456', headers);

                count++;
                if(count === 2) done();
            })
        })
    });

});
function assertHeadersFor(clientId, headers) {
    let userAndPasswordEncoded = new Buffer("beaver:" + new ClientLink('', clientId).password()).toString("base64");
    assert.strictEqual(headers["Accept"], 'text/plain');
    assert.strictEqual(headers["Authorization"], 'Basic ' + userAndPasswordEncoded);
}

function assertStoredData(clientName, data, storedData) {
    let expectedRegister = findByClientName(clientName, storedData);
    assert.notStrictEqual(expectedRegister, null);
    assert.strictEqual(expectedRegister.data, data);
}

function findByClientName(clientName, array) {
    for (let element of array) {
        if(element.clientName === clientName) {
            return element;
        }
    }
    return null;
}

function finishTestSuccessfullyAfterThreeTimesIntervalBetweenRequests(done) {
    setTimeout(function () {
        done();
    }, TEST_INTERVAL_BETWEEN_REQUESTS * 3)
}

function hasDoneAllExpectedCalls(storeCalledTimesCount: number, expectedTimesLength: number) {
    return storeCalledTimesCount === expectedTimesLength;
}

function assertIntervalsBetweenCallsAreApproximately(expectedApproximatedTime: number, intervalsBetweenCalls: number[]) {
    let callsCount = 0;
    for (let interval of intervalsBetweenCalls) {
        expect(interval).to.be.closeTo(expectedApproximatedTime*callsCount, 10);
        callsCount++;
    }
}