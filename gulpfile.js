var gulp = require('gulp');
var babelify = require('babelify');
var ts = require('gulp-typescript');
var watch = require('gulp-watch');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var connect = require('gulp-connect');

var tsProject = ts.createProject('./tsconfig.json');

/**
 * compile typescript
 * use ES5 and commonJS module
 */
gulp.task('typescript', function () {
  tsResult = tsProject
    .src()
    .pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('build/js'));
});

/**
 * Web server to test app
 */
gulp.task('webserver', function () {
  return connect.server({
    livereload: true,
    port: 3000,
    root: ['.', 'dist']
  });
});

/**
 * Automatic Live Reload
 */
gulp.task('livereload', function () {
  return gulp.src(['dist/**/*'])
    .pipe(watch(['dist/**/*']))
    .pipe(connect.reload());
});

/**
 * copy all html files and assets
 */
gulp.task('copy', function () {
  return gulp.src('public/**/*')
    .pipe(gulp.dest('dist'), {end: true});
});

/**
 * browserify
 * now is only for Javascript files
 */
gulp.task('browserify', function () {
  return browserify('./build/js/index.js')
    .transform(
      babelify,
      {
        only: [
          "./node_modules/three/build/three.module.js",
          "./node_modules/three/examples/jsm/*"
        ],
        global: true,
        sourceType: "unambiguous",
        presets: ["@babel/preset-env"],
      }
    )
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist/js'));
});

/**
 * Watch typescript and less
 */
gulp.task('watch', function () {
  gulp.watch('src/**/*.ts*', gulp.series(['typescript', 'browserify']));
  gulp.watch('public/**/*', gulp.series(['copy']));
})

/**
 * default task
 */
 gulp.task('default', 
  gulp.series([
    'typescript',
    'browserify',
    'copy',
    gulp.parallel([
      'webserver',
      'livereload',
      'watch'
    ])
  ])
)

/**
 * distribution task
 */
 gulp.task('dist', 
  gulp.series([
    'typescript',
    'browserify',
    'copy'
  ])
)
