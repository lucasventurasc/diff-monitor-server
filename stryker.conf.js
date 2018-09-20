
module.exports = function(config) {
    config.set({
        files: [
            "test/**/*.ts",
            "src/**/*.ts",
            "!src/Application.ts"
        ],
        testRunner: "mocha",
        mutator: "typescript",
        transpilers: ["typescript"],
        reporters: ["clear-text", "progress", "html"],
        testFramework: "mocha",
        coverageAnalysis: "perTest",
        tsconfigFile: "test/tsconfig.json",
        thresholds: { high: 85, low: 60, break: 50 },
        mutate: [
            "src/**/*.ts",
            "!src/Application.ts",
            "!src/controller/**/*.ts",
            "!src/inversify.config.ts"
        ],
        mochaOptions: {
            opts: "test/mocha-stryker.opts",
            files: [ 'build/test/**/*Test.js' ]
        }
    });
};