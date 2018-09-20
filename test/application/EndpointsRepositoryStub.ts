import {EndpointsRepository} from "../../src/application/scan/EndpointsRepository";
import {ClientLink} from "../../src/domain/ClientLink";

export class EndpointsRepositoryStub implements EndpointsRepository {

    retrieveEndpoints(): Promise<ClientLink[]> {
        return new Promise((resolve, reject) => {
            let clients: ClientLink[] = [
                new ClientLink('http://clientlink.com', '123'),
                new ClientLink('http://clientthik.com', '456')
            ];
            resolve(clients);
        });
    }
}