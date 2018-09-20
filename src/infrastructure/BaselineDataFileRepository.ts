import {DefaultFileRepository} from "./DefaultFileRepository";
import {ScannerRepository} from "../application/scan/ScannerRepository";

class BaselineDataFileRepository extends DefaultFileRepository implements ScannerRepository {

    constructor() {
        super('baseline/');
    }
}

export { BaselineDataFileRepository }