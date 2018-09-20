import {DefaultFileRepository} from "../../src/infrastructure/DefaultFileRepository";

class StoreKeeperMock extends DefaultFileRepository {

    callbackAfterStore;

    constructor() {
        super('folder/');
    }

    store(clientName, data) {
        this.callbackAfterStore(clientName, data);
        return null;
    }

    waitCallback(callback) {
        this.callbackAfterStore = callback;
        return this.callbackAfterStore;
    }
}

export {StoreKeeperMock}