import {DefaultFileRepository} from "./DefaultFileRepository";
import {injectable} from "inversify";
import {ScannerRepository} from "../application/scan/ScannerRepository";

@injectable()
class CurrentDataFileRepository extends DefaultFileRepository implements ScannerRepository {

    constructor() {
        super('current/')
    }
}

export { CurrentDataFileRepository }