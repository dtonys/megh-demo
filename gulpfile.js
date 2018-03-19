// const path = require('path');
const gulp = require('gulp');
const del = require('del');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();

gulp.task('clean', () => {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del([ 'public/build', 'views/build' ]);
});

gulp.task('buildAssets', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src('views/**/*.ejs')
    .pipe( $.useref({ searchPath: 'public' }) )
    .pipe( $.if('*.js', $.sourcemaps.init()) )
    .pipe( $.if('*.js', $.babel({
      presets: [ [ 'env', { 'modules': false } ] ]
    })) )
    .pipe( $.if('*.js', $.uglify()) )
    .pipe( $.if('*.js', $.size({ title: 'scripts' })) )
    .pipe( $.if('*.js', $.sourcemaps.write()) )
    .pipe( $.if('*.js', gulp.dest('public')) )

    .pipe( $.if('*.css', $.autoprefixer(AUTOPREFIXER_BROWSERS)) )
    .pipe( $.if('*.css', $.cssnano()) )
    .pipe( $.if('*.css', $.size({ title: 'styles' })) )
    .pipe( $.if('*.css', gulp.dest('public')) )

    .pipe( $.if('*.ejs', gulp.dest('views/build')) );
});

gulp.task('default', gulp.series('clean', 'buildAssets'));
