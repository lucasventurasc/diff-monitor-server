import {ClientLink} from "../../domain/ClientLink";

export interface EndpointsRepository {

    retrieveEndpoints() : Promise<ClientLink[]>;
}
