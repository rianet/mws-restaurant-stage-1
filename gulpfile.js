const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const minify = require('gulp-minify');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
 
gulp.task('min-css', () => {
    gulp.src('css/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '-min'}))
        .pipe(gulp.dest('dist/css'));
});
 
gulp.task('compress', () => {
  gulp.src(['js/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('dist/js'))
});
 
gulp.task('default', () =>
    gulp.src('img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
);