const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const minify = require('gulp-minify');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

gulp.task('min-css', () => {
  gulp.src('css/*.css')
    .pipe(cssmin())
    // .pipe(rename({ suffix: '' }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('min-js', () => {
  gulp.src(['js/*.js'])
    .pipe(minify({
      ignoreFiles: ['*.js']
    }))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('min-img', () =>
  gulp.src('img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'))
);

gulp.task('copy', () => {
  gulp.src('*.html')
    .pipe(gulp.dest('dist/'));
  gulp.src('*.json')
    .pipe(gulp.dest('dist/'));
  gulp.src('sw.js')
    .pipe(gulp.dest('dist/'));
});





gulp.task('default', ['min-img', 'min-js', 'min-css', 'copy']);
