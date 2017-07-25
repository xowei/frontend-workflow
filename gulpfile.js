console.log('Gulp setting: BrowserSync + Pug + PostCSS + Browserify');

var gulp    = require('gulp');
var $ = require('gulp-load-plugins')({
  DEBUG: false,
  scope: ['devDependencies'],
  pattern: [ 'browser-sync', 'browserify', 'del',
             'gulp-*', 'gulp.*', 'vinyl-*' ],
  lazy: true,
  rename: { 'vinyl-buffer'        : 'buffer',
            'vinyl-source-stream' : 'source' }
});

// uglified & compressed when type '--producton' behind gulp init command
var prod    = !!$.util.env.production;
console.log('production: ' + $.util.env.production);

var
  coFiles  = '**/*.*'       , // cofiles
  dist     = 'dist/'        , // dist folder
  host     = 'your ip/'     , // set your ip
  nodePath = 'node_modules/', // node modules folder
  proxy    = 'localhost/'   , // it's useless if browserSync haven't a proxy
  src      = 'src/'         , // source folder

  css    = 'css/'    ,
  fonts  = 'fonts/'  ,
  images = 'images/' ,
  js     = 'js/'     ,
  sprite = 'sprite/*';


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

  gulp.src([src + '*.pug',
            '!' + src + 'includes/**/*.pug'])
    .pipe($.changed(dist, { extension: '.html' }))
    .pipe($.plumber())
    .pipe($.pug({ basedir: src,
                        pretty: true }))
    .pipe(prod ? $.htmlmin(options) : $.util.noop())
    .pipe(gulp.dest(dist));
});


// css task use PostCSS
gulp.task('css', function(){

  // require every used processors
  var processors = [
    require('postcss-import'),
    require('precss'),
    require('rucksack-css'),
    require('lost'),
    require('postcss-cssnext')({
      browsers: ['IE 9', 'last 5 versions', 'Firefox 14', 'Opera 11.1'],
    }),
    require('postcss-reporter')({ clearMessages: true })
  ];

  var cssnanoConfig = {
    discardComments: true,
    discardEmpty: true,
    discardUnused: { fontFace: false },
    minifyFontValues: false,
    zindex: false
  };

  gulp.src(src + css + 'styles.css')
    .pipe($.plumber())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.postcss(processors))
    .pipe(prod ? $.cssnano(cssnanoConfig) : $.util.noop())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + css));
});

// js task use Browserify
gulp.task('js', function () {

  var b = $.browserify({
    debug: true,
    entries: src + js + 'scripts.js',
  });

  return b.bundle()
    .on('error', $.util.log)
    .pipe($.source('scripts.js'))
    .pipe($.buffer())
    .pipe($.plumber())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe(prod ? $.uglify() : $.util.noop())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(dist + js));
});

// assets task
gulp.task('assets:images', function(){
  gulp.src(src + images + coFiles)
    .pipe($.imagemin({ progressive: true }))
    .pipe(gulp.dest(dist + images));
});

gulp.task('assets:fonts', function(){
  gulp.src(src + fonts)
    .pipe(gulp.dest(dist + fonts));
});

gulp.task('assets', ['assets:images', 'assets:fonts']);

// del task
gulp.task('del', function() {
  $.del(dist);
});

// watch task
gulp.task('watch', function () {
  $.browserSync.init({
    host: host,
    notify: false,
    open: true,
    // proxy: proxy,
    server: dist,
  });

  gulp.watch([src + '**/*.pug',
              src + '*.pug'       ]  , ['pug']           );
  gulp.watch(src + css    + coFiles  , ['css']           );
  gulp.watch(src + js     + coFiles  , ['js']            );
  gulp.watch(src + images + coFiles  , ['assets:images'] );
  gulp.watch(src + fonts  + coFiles  , ['assets:fonts']  );

  return gulp.watch(src + coFiles).on('change', $.browserSync.reload);
});

// init / default
gulp.task('init', ['css', 'js', 'pug', 'assets']);
gulp.task('default', [ 'init', 'watch' ]);