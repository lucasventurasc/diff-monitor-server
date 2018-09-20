import {inject, injectable} from "inversify";

const DEFAULT_INTERVAL = 4000;
import "console";

@injectable()
class DefaultRestClient {

    readonly _intervalBetweenRequests: number;
    private _httpRequestCaller: any;

    constructor(@inject('request') httpRequestCaller, intervalBetweenRequestsInMilliseconds?) {
        this._intervalBetweenRequests = intervalBetweenRequestsInMilliseconds ? intervalBetweenRequestsInMilliseconds : DEFAULT_INTERVAL;
        this._httpRequestCaller = httpRequestCaller;
    }

    fetchAllInconsistencies(clientsLinks, repository) {
        let context = this;
        let interval = 0;

        for(let clientLink of clientsLinks) {
            setTimeout(() => {
                context.processRequest(clientLink, repository);
            }, interval);
            interval = interval + this._intervalBetweenRequests;
        }
    }

    private processRequest(clientLink, repository) {
        let requestSettings = {
            url: clientLink.url
        };
        this._httpRequestCaller(requestSettings, function (err, response, body) {
            if (err || response.statusCode !== 200) {
                console.log('DefaultRestClient - request failed to ' + clientLink.name());
                console.error(err);
                return;
            }
            console.log('DefaultRestClient - request succeeded to ' + clientLink.name());
            repository.store(clientLink.name(), body);
        });
    }
}

export {DefaultRestClient}