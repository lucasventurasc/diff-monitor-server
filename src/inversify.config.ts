import "reflect-metadata"
import {Kernel} from "inversify";

import {CurrentDataFileRepository} from "./infrastructure/CurrentDataFileRepository";
import {BaselineDataFileRepository} from "./infrastructure/BaselineDataFileRepository";
import {EndpointsDataScanner} from "./application/scan/EndpointsDataScanner";

import {ScanController} from "./controller/ScanController";
import {AnalysisController} from "./controller/AnalysisController";
import {DataAnalyzer} from "./application/analyze/DataAnalyzer";
import {DifferencesRepository} from "./application/analyze/DifferencesRepository";
import {DifferencesDataFileRepository} from "./infrastructure/DifferencesDataFileRepository";
import {ScannerRepository} from "./application/scan/ScannerRepository";
import {EndpointsRepository} from "./application/scan/EndpointsRepository";
import {ManualClientEndpointsLoader} from "./infrastructure/ManualClientEndpointsLoader";
import {DefaultRestClient} from "./infrastructure/DefaultRestClient";

var kernel = new Kernel();

kernel.bind<ScanController>("scanController").to(ScanController);
kernel.bind<AnalysisController>("analysisController").to(AnalysisController);

kernel.bind<DifferencesRepository>("differencesRepository").to(DifferencesDataFileRepository);
kernel.bind<EndpointsRepository>("endpointsRepository").to(ManualClientEndpointsLoader);

kernel.bind<BaselineDataFileRepository>("baselineRepository").to(BaselineDataFileRepository);
kernel.bind<CurrentDataFileRepository>("currentRepository").to(CurrentDataFileRepository);

const INTERVAL_BETWEEN_REQUESTS = 4000;
kernel.bind<DefaultRestClient>("restClient")
    .toConstantValue(new DefaultRestClient(require('request'), INTERVAL_BETWEEN_REQUESTS));

kernel.bind<DataAnalyzer>("dataAnalyzer").toDynamicValue(() => {
    let baselineRepository = kernel.get<ScannerRepository>('baselineRepository');
    let currentRepository = kernel.get<ScannerRepository>('currentRepository');
    let differencesRepository  = kernel.get<DifferencesRepository>('differencesRepository');
    return new DataAnalyzer(baselineRepository, currentRepository, differencesRepository);
});

kernel.bind<EndpointsDataScanner>("scannerForBaseline").toDynamicValue(() => {
    let baselineRepository = kernel.get<ScannerRepository>('baselineRepository');
    let endpointsRepository = kernel.get<ManualClientEndpointsLoader>('endpointsRepository');
    let siengeRestClient = kernel.get<DefaultRestClient>('restClient');
    return new EndpointsDataScanner(endpointsRepository, siengeRestClient, baselineRepository);
});

kernel.bind<EndpointsDataScanner>("scannerForCurrent").toDynamicValue(() => {
    let currentRepository = kernel.get<ScannerRepository>('currentRepository');
    let endpointsRepository = kernel.get<EndpointsRepository>('endpointsRepository');
    let restClient = kernel.get<DefaultRestClient>('restClient');
    return new EndpointsDataScanner(endpointsRepository, restClient, currentRepository);
});

export {kernel}
