'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');

var SOURCE = 'src/*.js';

gulp.task('compile', function() {
    return gulp.src(SOURCE)
        .pipe(babel({
            optional: [
                'runtime',
                'es7.decorators',
                'es7.objectRestSpread'
            ]
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('test:core', function() {
    return gulp.src('test/core-tests.js')
        .pipe(mocha());
});

gulp.task('test:unique', function() {
    return gulp.src('test/unique-tests.js')
        .pipe(mocha());
});

gulp.task('lint', function() {
    return gulp.src(SOURCE)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('default', ['lint', 'compile'], function() {
    gulp.watch(SOURCE, ['lint', 'compile']);

    gulp.watch(['dist/core.js', 'test/core-tests.js'], ['test:core']);
    gulp.watch(['dist/unique.js', 'test/unique-tests.js'], ['test:unique']);
});
