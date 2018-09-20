import {injectable} from "inversify";
import {EndpointsRepository} from "../application/scan/EndpointsRepository";
import {ClientLink} from "../domain/ClientLink";

@injectable()
class ManualClientEndpointsLoader implements EndpointsRepository {

    public retrieveEndpoints(): Promise<ClientLink[]> {
        return new Promise(function(resolve, reject) {
            resolve([new ClientLink("http://localhost:8181", "1001")])
        });
    }
}

export { ManualClientEndpointsLoader }
