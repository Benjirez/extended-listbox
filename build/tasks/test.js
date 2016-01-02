var gulp = require('gulp');
var paths = require('../paths');
var ts = require('gulp-typescript');
var compilerOptions = require('../tsc-options');
var through = require('through2');
var fs = require('fs');
var path = require('path');
var runSequence = require('run-sequence');

gulp.task('build-tests', function () {
    return gulp.src(paths.testSource + "**/*Test.ts")
        .pipe(ts(compilerOptions))
        .pipe(gulp.dest(paths.testOutput));
});

function writeTestMain(files) {
    var template = 'var tests = [FILES]; require(tests);';

    var relatives = files.map(function(f) {
        return path.relative(paths.testOutput, f);
    });

    var list = '"' + relatives.join('", "') + '"';
    template = template.replace("FILES", list);

    fs.writeFileSync("test/TestMain.js", template);
}

function generateTestMain() {
    var files = [];

    // creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, cb) {
        files.push(file.path);

        // make sure the file goes through the next gulp plugin
        this.push(file);
        // tell the stream engine that we are done with this file
        cb();
    }, function () {
        writeTestMain(files);
    });

    // returning the file stream
    return stream;
}

gulp.task('generate-testmain', function () {
    return gulp.src(paths.testSource + "**/*Test.js")
        .pipe(generateTestMain());
});

gulp.task('prepare-tests', function (callback) {
    return runSequence('clean-tests', 'build-tests', 'generate-testmain', callback);
});