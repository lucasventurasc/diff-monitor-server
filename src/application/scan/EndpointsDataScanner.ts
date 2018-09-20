import {DefaultRestClient} from "../../infrastructure/DefaultRestClient";
import {EndpointsRepository} from "./EndpointsRepository";
import {inject, injectable} from "inversify";
import {ScannerRepository} from "./ScannerRepository";

@injectable()
class EndpointsDataScanner {

    private endpointsRepository: EndpointsRepository;
    private restClient: DefaultRestClient;
    private repository: ScannerRepository;

    constructor(@inject('endpointsRepository') endpointsRepository: EndpointsRepository,
                @inject('restClient') restClient: DefaultRestClient,
                @inject('repository') repository: ScannerRepository) {
        this.endpointsRepository = endpointsRepository;
        this.restClient = restClient;
        this.repository = repository;
    }

    public scan() {
        let context = this;
        return this.endpointsRepository.retrieveEndpoints()
            .then((clientsLinks) => {
                context.restClient.fetchAllInconsistencies(clientsLinks, this.repository)
            });
    }
}

export {EndpointsDataScanner}