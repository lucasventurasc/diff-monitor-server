import {inject, injectable} from "inversify";
import {DataAnalyzer} from "../application/analyze/DataAnalyzer";

@injectable()
class AnalysisController {

    private dataAnalyzer: DataAnalyzer;

    constructor(@inject('dataAnalyzer') dataAnalyzer) {
        this.dataAnalyzer = dataAnalyzer;
    }

    get(request, response) {
        this.dataAnalyzer.listClientsWithAddedInconsistencies((clientsName) => {
            let links = this.buildLinksFor(clientsName);
            response.status(200).send(links);
        });
    }

    getLastAnalysis(request, response) {
        this.dataAnalyzer.listClientsFromLastAnalysis((clientsName) => {
            let links = this.buildLinksFor(clientsName);
            response.status(200).send(links);
        });
    }

    getByName(req, response, next) {
        let name = req.params.name;

        this.dataAnalyzer.getDiffFromClient(name, (diffChars) => {
            response.render('inconsistences.html', {diff:  JSON.stringify(diffChars)});
            next();
        })
    }

    private buildLinksFor(clientsName) {
        let links = [];
        for (let name of clientsName) {
            links.push(process.env.APP_ADDRESS + '/analysis/' + name);
        }
        return links;
    }
}

export {AnalysisController}