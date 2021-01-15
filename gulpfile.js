console.log('Gulp setting: BrowserSync + Pug + PostCSS + Browserify');

const { series, parallel, src, dest, watch } = require('gulp');
const sugarss = require('sugarss');
const $ = require('gulp-load-plugins')({
  DEBUG: false,
  scope: ['devDependencies'],
  pattern: [ 'browser-sync', 'browserify', 'del',
             'gulp-*', 'gulp.*', 'vinyl-*'],
  lazy: true,
  rename: { 'vinyl-buffer'        : 'buffer',
            'vinyl-source-stream' : 'source' }
});

// uglified & compressed when type '--producton' behind gulp init command
var prod    = !!$.util.env.production;
console.log('production: ' + $.util.env.production);

function pug(done) {
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
  
  return src(['src/*.pug', '!src/includes/**/*.pug'])
    .pipe($.pug({ basedir: 'src/',
                  pretty: true }))
    .pipe(prod ? $.htmlmin(options) : $.util.noop())
    .on('error', done)
    .pipe(dest('dist/'));
}

function css(done) {
  var processors = [
    require('postcss-import'),
    require('postcss-mixins'),
    require('postcss-nested'),
    require('postcss-cssnext')({
      browsers: ['IE 9', 'last 5 versions', 'Firefox 14', 'Opera 11.1'],
    }),
    require('rucksack-css'),
    require('lost'),
    require('postcss-reporter')({ clearMessages: true })
  ];

  var cssnanoConfig = {
    discardComments: true,
    discardEmpty: true,
    discardUnused: { fontFace: false },
    minifyFontValues: false,
    zindex: false
  };

  return src('src/css/styles.css')
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.postcss(processors, { parser: sugarss }))
    .pipe(prod ? $.cssnano(cssnanoConfig) : $.util.noop())
    .pipe($.sourcemaps.write('.'))
    .on('error', done)
    .pipe(dest('dist/css/'))
    .pipe($.browserSync.stream());
}

function js(done) {
  var b = $.browserify({
    debug: true,
    entries: 'src/js/scripts.js',
  });

  return b.bundle()
    .on('error', $.util.log)
    .pipe($.source('scripts.js'))
    .pipe($.buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe(prod ? $.uglify() : $.util.noop())
    .pipe($.sourcemaps.write('.'))
    .on('error', done)
    .pipe(dest('dist/js/'));
}

function images(done){
  return src('src/images/*.*', { allowEmpty: true })
    .pipe($.imagemin({ progressive: true }))
    .on('error', done)
    .pipe(dest('dist/images/'));
};

function fonts(done){
  return src('src/fonts/', { allowEmpty: true })
    .on('error', done)
    .pipe(dest('dist/fonts/'));
};

function del() {
  $.del('dist');
};

function server() {
  $.browserSync.init({
    notify: false,
    open: true,
    server: 'dist/',
  });

  watch(['src/**/*.pug', 'src/*.pug'], pug);
  watch('src/css/*.*', css);
  watch('src/js/*.*', js);
  watch('src/images/*.*', images);
  watch('src/fonts /*.*', fonts);

  watch(['src/*.*', 'src/**/*.*']).on('change', $.browserSync.reload);
};

exports.del = del;
exports.pug = pug;
exports.css = css;
exports.js = js;
exports.assets = parallel(fonts, images);
exports.server = server;
exports.build = parallel(pug, css, js, fonts, images);
exports.default = series(parallel(pug, css, js, fonts, images), server);
