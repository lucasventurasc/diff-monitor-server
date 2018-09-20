import {injectable, unmanaged} from "inversify";

let fs = require('fs');

const FILE_FORMAT = '.txt';

@injectable()
class DefaultFileRepository {

    private folder: string;

    constructor(@unmanaged() folder) {
        this.folder = folder;
        this.makeDirWhenNecessary();
    }

    public store(clientName : string, data : string) : Promise<string> {
        return new Promise((resolve, reject) => {
            let filePath = this.buildFilePath(clientName);

            fs.writeFile(filePath, data, err => {
                if(err) reject(err);
                resolve(filePath);
            });
        })
    }

    public read(clientName : string) : Promise<string> {
        let filePath = this.buildFilePath(clientName);

        return new Promise(function(resolve, reject) {
            if(fs.existsSync(filePath)) {
                fs.readFile(filePath, function(err, data) {
                    resolve(data.toString());
                })
            } else {
                resolve('');
            }
        })
    }

    public list() : Promise<string[]> {
        let path = this.path();

        return new Promise(function(resolve, reject) {
            fs.readdir(path, function(err, files) {
                if(err) reject(err);
                resolve(files);
            })
        })
    }

    public clear() {
        const dirPath = this.path();
        let files = fs.readdirSync(dirPath);
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                let filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
        }
    }

    private buildFilePath(clientName) {
        clientName = clientName.replace(FILE_FORMAT, '');
        return this.path().concat(clientName).concat(FILE_FORMAT);
    }

    protected path() {
        return process.env.SERVER_FOLDER.concat(this.folder);
    }

    private makeDirWhenNecessary() {
        if (!fs.existsSync(this.path())) {
            fs.mkdirSync(this.path());
        }
    }
}

export { DefaultFileRepository }