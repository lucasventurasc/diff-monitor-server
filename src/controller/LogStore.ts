
class LogStore {

    static storage : string[];

    constructor() {
        LogStore.storage = [];
    }

    static addLog(string) {
        LogStore.storage.push(string);
    }

    static cleanLog() {
        LogStore.storage = [];
    }
}

LogStore.storage = [];

export { LogStore }