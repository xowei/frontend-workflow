console.log('Gulp setting: BrowserSync + Pug + PostCSS + Browserify');

var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')({
  DEBUG: false,
  scope: ['devDependencies'],
  pattern: [ 'browser-sync', 'browserify', 'del',
             'gulp-*', 'gulp.*', 'vinyl-*' ],
  lazy: true,
  rename: { 'vinyl-buffer'        : 'buffer',
            'vinyl-source-stream' : 'source' }
});


// uglified & compressed when type '--producton' behind gulp init command
var prod    = !!plugins.util.env.production;
console.log('production: ' + plugins.util.env.production);

var
  nodePath = 'node_modules/',  // node modules folder
  proxy    = 'localhost/'   ,  // it's useless if browserSync haven't a proxy
  src      = 'src/'         ,  // source folder
  dist     = 'dist/'        ,  // dist folder
  coFiles  = '**/*.*'       ,  // coFiles

  images = 'images/' ,
  css    = 'css/'    ,
  js     = 'js/'     ,
  fonts  = 'fonts/'  ;


// pug task
gulp.task('pug', function(){
  var options = {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: true,
    minifyCSS: true
  };

  gulp.src(src + '*.pug')
    .pipe(plugins.plumber())
    .pipe(plugins.pug({ pretty: true, extension: '.html' }))
    .pipe(prod ? plugins.htmlmin(options) : plugins.util.noop())
    .pipe(gulp.dest(dist));
});


// css task use PostCSS
gulp.task('css', function(){

  // require every used processors
  var processors = [
    atImport = require('postcss-import'),
    mqpacker = require('css-mqpacker')({ sort: true }),
    lost     = require('lost'),
    cssnext  = require('postcss-cssnext')({
                 browsers: ['IE 9', 'last 5 versions', 'Firefox 14', 'Opera 11.1']
               }),
    cssSize  = require('postcss-size'),
    precss   = require('precss'),
    rucksack = require('rucksack-css')
  ];

  var options = {
    discardComments: true,
    discardEmpty: true,
    zindex: false
  };

  gulp.src(src + css + 'style.css')
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
    .pipe(plugins.postcss(processors))
    .pipe(prod ? plugins.cssnano(options) : plugins.util.noop())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + css));

});

// js task use Browserify
gulp.task('js', function () {

 var b = plugins.browserify({
  entries: src + js + 'script.js',
  debug: true
 });

 return b.bundle()
  .on('error', plugins.util.log)
  .pipe(plugins.source('script.js'))
  .pipe(plugins.buffer())
  .pipe(plugins.plumber())
  .pipe(plugins.sourcemaps.init({ loadMaps: true }))
  .pipe(prod ? plugins.uglify() : plugins.util.noop())
  .pipe(plugins.sourcemaps.write('.'))
  .pipe(gulp.dest(dist + js));
});

// assets task
gulp.task('assets:images', function(){
  gulp.src(src + images + coFiles)
    .pipe(plugins.imagemin({ progressive: true }))
    .pipe(gulp.dest(dist + images));
});

gulp.task('assets:fonts', function(){
  gulp.src(src + fonts)
    .pipe(gulp.dest(dist + fonts));
});

gulp.task('assets', ['assets:images', 'assets:fonts']);

// del task
gulp.task('del', function() {
  plugins.del(dist);
});

// watch task
gulp.task('watch', function () {
  plugins.browserSync.init({
    host: '192.168.0.7',
    server: dist,
    // proxy: proxy ,
    open: true,
    notify: false,
  });

  gulp.watch([src + '*/*.pug',
              src + '*.pug'       ]  , ['pug']           );
  gulp.watch(src + css    + coFiles  , ['css']           );
  gulp.watch(src + js     + coFiles  , ['js']            );
  gulp.watch(src + images + coFiles  , ['assets:images'] );
  gulp.watch(src + fonts  + coFiles  , ['assets:fonts']  );

  return gulp.watch(src + coFiles).on('change', plugins.browserSync.reload);
});

// init / default
gulp.task('init', ['css', 'js', 'pug', 'assets']);
gulp.task('default', [ 'init', 'watch' ]);