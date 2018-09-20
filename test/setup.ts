import "reflect-metadata"
import * as path from 'path';

const allFilesRequired = require('require-all')({
    dirname: path.dirname(__dirname).concat('/src/'),
    filter:   /^(?!.*Application\.ts)([^\.].+)\.ts(on)?$/,
    recursive: true
});
export { allFilesRequired };