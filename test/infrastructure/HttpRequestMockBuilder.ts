class HttpRequestMockBuilder {
    
    private mocks: {};
    private actualUrl: any;

    constructor() {
        this.mocks = {};
    }

    forUrl(url) {
        this.mocks[url] = {};
        this.actualUrl = url;
        return this;
    }

    and() {
        this.actualUrl = null;
        return this;
    }

    resultOnError(err) {
        this._mockSettingsForActualUrl().err = err;
        return this;
    }

    status(status) {
        this._mockSettingsForActualUrl().status = status;
        return this;
    }

    body(body) {
        this._mockSettingsForActualUrl().body = body;
        return this;
    }

    _mockSettingsForActualUrl() {
        return this.mocks[this.actualUrl];
    }

    mock() {
        let context = this;
        return (requestSettings, callback) => {
            let mockData = context.mocks[requestSettings.url];
            mockData.requestSettings = requestSettings;
            callback(mockData.err, {statusCode: mockData.status}, mockData.body);
        }
    }

    requestSettingsFor(url) {
        return this.mocks[url].requestSettings;
    }
}

export { HttpRequestMockBuilder }