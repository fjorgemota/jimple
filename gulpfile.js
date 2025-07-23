const gulp = require('gulp');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const del = require('del');
const fs = require('fs');

function clean() {
  return del([ 'dist' ]);
}

function scriptsLegacy() {
  return gulp.src('src/Jimple.js')
    .pipe(babel())
    .pipe(terser({
      mangle: {
        properties: true
      }
    }))
    .pipe(rename('Jimple.legacy.min.js'))
    .pipe(gulp.dest('dist/'));
}

function scriptsModern() {
  return gulp.src('src/Jimple.js')
    .pipe(terser({
      mangle: {
        properties: true,
        toplevel: true,
        keep_fnames: /(get|set|has|factory|protect|keys|extend|register|raw)/
      }
    }))
    .pipe(rename('Jimple.modern.esm.min.js'))
    .pipe(gulp.dest('dist/'));
}

const scripts = gulp.parallel(scriptsLegacy, scriptsModern);

function watch() {
  gulp.watch(paths.scripts.src, scripts);
}

const build = gulp.series(clean, scripts);

exports.clean = clean;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;
