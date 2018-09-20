let diff = require('diff');

import {DifferencesRepository} from "./DifferencesRepository";
import {inject, injectable} from "inversify";
import {ScannerRepository} from "../scan/ScannerRepository";

@injectable()
class DataAnalyzer {

    private baselineRepository: ScannerRepository;
    private currentRepository: ScannerRepository;
    private differencesRepository: DifferencesRepository;

    constructor(@inject('baselineRepository') baselineRepository: ScannerRepository,
                @inject('currentRepository') currentRepository: ScannerRepository,
                @inject('differencesRepository') differencesRepository: DifferencesRepository) {
        this.baselineRepository = baselineRepository;
        this.currentRepository = currentRepository;
        this.differencesRepository = differencesRepository;
    }

    public getDiffFromClient(clientName, callback) {
        this.differencesRepository.read(clientName).then((current) => {
            this.baselineRepository.read(clientName).then((baseline) => {
                let diffChars = diff.diffChars(baseline, current, {ignoreWhitespace: true});
                callback(diffChars);
            })
        })
    }

    public listClientsWithAddedInconsistencies(callback) {
        this.analyzeDifferences(() => {
            setTimeout(() => {
                this.differencesRepository.listNames().then((names) => callback(names))
            }, 500);
        });
    }

    public analyzeDifferences(callback) {
        this.differencesRepository.clear();
        console.log('DataAnalyzer::Analyzing differences');
        this.currentRepository.list().then((files) => {
            if(files.length === 0) {
                callback([]);
            }

            for (let index = 0; index < files.length; index++) {
                this.processDifferenceFor(files[index]);
                this.callbackAfterFinishes(index, files.length, callback);
            }
        })
    }

    public listClientsFromLastAnalysis(callback) {
        this.differencesRepository.listNames().then((names) => {
            callback(names);
        });
    }

    private callbackAfterFinishes(currentIndex, totalOfFiles, callback) {
        if(!callback) {
            return;
        }

        if (currentIndex + 1 >= totalOfFiles) {
            console.log('DataAnalyzer::Finishing Analysis');
            setTimeout(callback, 1000);
        }
    }

    private processDifferenceFor(file) {
        this.baselineRepository.read(file).then((baselineData) => {
            if (baselineData) {
                this.checkAndStoreDifferenceBetweenCurrentData(file, baselineData);
            }
        });
    }

    private checkAndStoreDifferenceBetweenCurrentData(file, baselineData) {
        this.currentRepository.read(file).then((currentData) => {
            this.checkAndStoreDifference(baselineData, currentData, file);
        })
    }

    private checkAndStoreDifference(baselineData, currentData, file) {
        if (this.haveDifferences(baselineData, currentData)) {
            return this.storeDifference(file, currentData)
        }
    }

    private haveDifferences(baselineData, currentData) {
        return !Buffer.from(baselineData).equals(Buffer.from(currentData));
    }

    private storeDifference(file, currentData) {
        console.log('Storing difference for ' + file);
        return this.differencesRepository.store(file, currentData)
    }
}

export { DataAnalyzer }