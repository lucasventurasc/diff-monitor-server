import {ClientLink} from "../../src/domain/ClientLink";
import * as assert from "assert";

process.env.SERVER_FOLDER = __dirname + '/resources/';

describe('Given a client link, should be able to retrieve server name', function () {

    it('when url is http', function () {
        assert.strictEqual(new ClientLink('http://localhost.com', '9').name(), 'localhost');
    });

    it('when url is https', function () {
        assert.strictEqual(new ClientLink('https://localhost.com', '9').name(),'localhost');
    });

    it('when url has port number', function () {
        assert.strictEqual(new ClientLink('http://localhost:9090', '9').name(),'localhost');
    });

    it('when url has a resource', function () {
        assert.strictEqual(new ClientLink('http://localhost.com/api/resource', '9').name(),'localhost');
    });

    it('when url has multiple domains', function () {
        assert.strictEqual(new ClientLink('http://user.sienge.datacenter.com', '9').name(),'user');
    });

    it('when url starts with www', function () {
        assert.strictEqual(new ClientLink('http://www.sienge.com.br', '9').name(),'sienge');
    });

    it('when url starts with www and sub-domain contains www', function () {
        assert.strictEqual(new ClientLink('http://www.engwww.com.br', '9').name(),'engwww');
    });


    it('when url starts with https and  www and sub-domain contains www', function () {
        assert.strictEqual(new ClientLink('https://www.engwww.com.br', '9').name(),'engwww');
    });
});

describe('Given a client link, should be able to retrieve the correct password for each client', function () {

    it('scenario with client id 3908', function () {
        assert.strictEqual(new ClientLink('url', '3908').password(),'8033892');
    });

    it('scenario with client id 4511', function () {
        assert.strictEqual(new ClientLink('url', '4511').password(),'9313458');
    });

    it('scenario with client id 112', function () {
        assert.strictEqual(new ClientLink('url', '112').password(),'-21220');
    });
});