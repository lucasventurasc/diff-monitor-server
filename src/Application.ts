require('console-stamp')(console, '[yyyy-mm-dd HH:MM:ss.l]');
var express = require('express');
var bodyparser = require('body-parser');
var cors = require('cors');
var app = express();
app.engine('html', require('ejs').renderFile);
app.use(cors());
app.use(bodyparser.json());

var ip = require("ip");
console.dir ( ip.address() );

let port = (process.env.PORT || 5398);
app.set('port', port);

app.use(express.static(__dirname + 'public'));

if (typeof process.env.EXTERNAL_SERVER_ADDRESS !== "undefined") {
    process.env.APP_ADDRESS = process.env.EXTERNAL_SERVER_ADDRESS;
} else {
    process.env.APP_ADDRESS = ip.address() + ":" + port;
}

app.listen(app.get('port'), function () {
    console.info("Node app is running at "  + process.env.APP_ADDRESS);
});

app.get('/', (req, res, next) => {
    res.render('index.html', {url: process.env.APP_ADDRESS})
});

import {kernel} from './inversify.config';

import {ScanController}  from './controller/ScanController';
import {AnalysisController} from './controller/AnalysisController';
import {LogStore} from './controller/LogStore'

let oldConsoleInfo = console.info;
console.info = function(log) {
    LogStore.addLog(log);
    oldConsoleInfo(log)
};

let oldConsoleLog = console.log;
console.log = function(log) {
    LogStore.addLog(log);
    oldConsoleLog(log)
};


app.get('/log', (req, res) => {
    res.status(200).send(LogStore.storage.shift());
});

process.env.SERVER_FOLDER = process.env.OUTPUT_FOLDER ? process.env.OUTPUT_FOLDER : '/temp/diffmonitor/';

let scanController = kernel.get<ScanController>("scanController");
app.get('/scan', (request, response) => scanController.scan(request, response));
app.get('/reset-baseline', (request, response) => scanController.resetBaseline(request, response));
app.get('/initialize', (request, response) => scanController.initialize(request, response));

let analysisController = kernel.get<AnalysisController>("analysisController");
app.get('/analysis/', (request, response) => analysisController.get(request, response));
app.get('/analysis/:name/',  (request, response, next) => analysisController.getByName(request, response, next));
app.get('/last-analysis/',  (request, response) => analysisController.getLastAnalysis(request, response));



