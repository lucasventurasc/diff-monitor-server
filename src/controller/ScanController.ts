import {EndpointsDataScanner} from "../application/scan/EndpointsDataScanner";
import {inject, injectable} from "inversify";

@injectable()
class ScanController {

    private currentDataScanner : EndpointsDataScanner;
    private baselineScanner: EndpointsDataScanner;

    constructor(@inject("scannerForCurrent") currentDataScanner : EndpointsDataScanner,
                @inject("scannerForBaseline") baselineScanner : EndpointsDataScanner) {
        this.currentDataScanner = currentDataScanner;
        this.baselineScanner = baselineScanner;
    }

    scan(request, response) {
        this.currentDataScanner.scan();

        return response.status(200).send();
    }

    resetBaseline(request, response) {
        this.baselineScanner.scan();

        return response.status(200).send();
    }

    initialize(request, response) {
        return response.status(500).send();
    }
}

export { ScanController }