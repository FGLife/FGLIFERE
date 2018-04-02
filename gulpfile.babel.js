// generated on 2015-07-02 using generator-gulp-webapp 1.0.1
var gulp = require('gulp');
var wiredep = require('wiredep').stream;
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');

//these are needed for the them builder task
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var minifyHtml = require('gulp-minify-html');


var concat = require('gulp-concat');
var htmlreplace = require('gulp-html-replace');
var uglify = require('gulp-uglify');
var cssminify = require('gulp-minify-css');
var rename = require('gulp-rename');
var less = require('gulp-less');
var zip = require('gulp-zip');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');

var php = require('gulp-connect-php');
var notify = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer');

//begin themebuilder tasks
//include plug-ins
var jshint = require('gulp-jshint');

//JS hint task
gulp.task('jshint', function(){
  gulp.src('app/scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/*//uglify minify js
 gulp.task('uglify',function(){
 var jsSrc = 'app/scripts/!**!/!*.js';
 var jsDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/js';

 gulp.src(jsSrc)
 .pipe(gulp.dest(jsDst));
 });*/

//fonts
gulp.task('fontstheme', function(){
  var fSrc = 'app/css/fonts/**/*';
  var fDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/fonts';

  gulp.src(fSrc)
    .pipe(gulp.dest(fDst));
});

//minify images
gulp.task('imagemin', function(){
  var imgSrc = 'app/images/**/*',
    imgDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/Images';

  gulp.src(imgSrc)
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst));
});

/*gulp.task('cssmin',function(){
 var cssSrc = 'app/styles/!**!/!*.css',
 cssDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/Styles';

 gulp.src(cssSrc)
 .pipe(cssminify({processImport:false}))
 .pipe(gulp.dest(cssDst));
 });*/

gulp.task('htmltheme',function(){
  var htmlSrc = 'app/*.html';
  var htmlDst = 'build/WebsiteTemplates/CanvasBase/App_Master';

  gulp.src(htmlSrc)
    .pipe(minifyHtml())
    .pipe(gulp.dest(htmlDst));
});

//concatenate, rename, and uglify js files
gulp.task('scripts',function(){
  var jsSrc = 'app/js/**/*.js';
  var jsDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/js';

  gulp.src(jsSrc)
    .pipe(concat('main.js'))
    .pipe(rename({suffix: '.min'}))
    //.pipe(uglify())
    .pipe(gulp.dest(jsDst));
});

//preprocess less, minify, and save as css
gulp.task('less', ['less:responsive', 'less:dark']);
gulp.task('less:responsive', function() {
  var lsSrc = 'app/less/**/responsive.less',
    lsDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/Styles/';

  return gulp.src(lsSrc)
    .pipe(less())
    .pipe(cssminify({processImport:false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(lsDst));
});
gulp.task('less:dark', function() {
  var lsSrc = 'app/less/**/dark.less',
    lsDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/Styles/';

  return gulp.src(lsSrc)
    .pipe(less())
    .pipe(cssminify({processImport:false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(lsDst));
});
//commented out due to error
/*gulp.task('less:shortcodes', function() {
 var lsSrc = 'app/less/!**!/shortcodes.less',
 lsDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/Styles/';

 return gulp.src(lsSrc)
 .pipe(less())
 .pipe(cssminify({processImport:false}))
 .pipe(gulp.dest(lsDst));
 });*/


gulp.task('buildtheme',['scripts','fontstheme','imagemin','less','htmltheme'],function(){

});
//end themebuilder tasks


const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', function() {
  return gulp.src('app/css/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  },
  globals: {
    assert: false,
    expect: false,
    should: false
  }
};

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], function() {
  const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function(){
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/css/fonts/**/*'))
    .pipe(gulp.dest('.tmp/css/fonts'))
    .pipe(gulp.dest('dist/css/fonts'));
});

gulp.task('extras', function() {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

//Serve app

gulp.task('serve', ['styles', 'fonts'], function() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

var reload  = browserSync.reload;

gulp.task('default', ['browser-sync'], function () {
    gulp.watch(['build/*.php'], [reload]);
});

//

  gulp.watch([
    'app/*.html',
    'app/js/**/*.js',
    'app/images/**/*',
    '.tmp/css/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/css/**/*.css', ['styles']);
  gulp.watch('app/css/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

// end serv app

gulp.task('serve:dist', function() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', function() {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', function() {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], function() {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});

///////////////////////////////////////
//
//
// Bundle for AWS and UAT servers
//
//
///////////////////////////////////////


// Move webfonts
gulp.task('aws_webfonts_move', function(){
    var fSrc = 'app/css/fonts/**/*';
    var fDst = 'aws/css/fonts';

    gulp.src(fSrc)
        .pipe(gulp.dest(fDst));
});

// Minify and move main style.css

gulp.task('aws_css_minify_move', function() {
    var cssSrc = 'app/style.css',
      cssDst = 'aws';

    return gulp.src(cssSrc)
        .pipe(cssminify({processImport:false}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(cssDst));
});

gulp.task('aws_css1_minify_move', function() {
  var cssSrc = 'app/css/bootstrap.css',
    cssDst = 'aws/css';

  return gulp.src(cssSrc)
    .pipe(cssminify({processImport:false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(cssDst));
});

gulp.task('aws_css2_minify_move', function() {
  var cssSrc = 'app/css/font-icons.css',
    cssDst = 'aws/css';

  return gulp.src(cssSrc)
    .pipe(cssminify({processImport:false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(cssDst));
});


// Move other supporting vendor style.css
gulp.task('aws_css_move', function() {
    var cssSrc = 'app/css/**/*.css',
        cssDst = 'aws/css';

    return gulp.src(cssSrc)
        //.pipe(cssminify({processImport:false}))
        //.pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(cssDst));
});

// Move style-import.css
gulp.task('aws_style-import_move', function() {

  var cssSrc = 'app/style-import.css',
    cssDst = 'aws/';

  return gulp.src(cssSrc)
    //.pipe(cssminify({processImport:false}))
    //.pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(cssDst));
});

// Move style.css
gulp.task('aws_style_move', function() {

  var cssSrc = 'app/style.css',
    cssDst = 'aws/';

  return gulp.src(cssSrc)
    //.pipe(cssminify({processImport:false}))
    //.pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(cssDst));
});

// Move htaccess
gulp.task('aws_htaccess', function() {

  var cssSrc = 'app/.htaccess',
    cssDst = 'aws/';

  return gulp.src(cssSrc)
    .pipe(gulp.dest(cssDst));
});


// Move js
gulp.task('aws_js_move',function(){
  //php files
  var fSrc = 'app/js/**/*.js';
  var fDst = 'aws/js';
  return gulp.src(fSrc)
    .pipe(gulp.dest(fDst));

});

// Move html
gulp.task('aws_html_move', function() {

  var cssSrc = 'app/**/*.html',
    cssDst = 'aws/';

  return gulp.src(cssSrc)
    .pipe(gulp.dest(cssDst));
});

// Move sitemap
gulp.task('aws_sitemap_move', function() {

  var cssSrc = 'app/sitemap.xml',
    cssDst = 'aws/';

  return gulp.src(cssSrc)
    .pipe(gulp.dest(cssDst));
});

// Move images
gulp.task('aws_images_move', function() {
  var fSrc = 'app/images/**/*';
  var fDst = 'aws/images';
  return gulp.src(fSrc)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(fDst));
});

// Move favicons
gulp.task('aws_favicons_move', function() {
  var fSrc = 'app/favicons/**/*';
  var fDst = 'aws/favicons';
  return gulp.src(fSrc)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(fDst));
});

//Clean Tasks
// Clean AWS file

// @deprecated
gulp.task('aws_clean', function() {
  del(['aws/**']);
});

gulp.task('aws_clean_new', function() {
  del(['aws/**/*', 'aws/.htaccess']);
});


//JS rename concat tasks

//replace paths and reference for concatenated minified/unminified css, and js
gulp.task('htmlreplace', function() {

  var htmlSrc = 'aws/**/*.html';
  var htmlDst = 'aws';

  return gulp.src(htmlSrc)
     .pipe(htmlreplace({
      'css': '/style.min.css',
      'css1': '/css/bootstrap.min.css',
      'css2': '/css/font-icons.min.css',
      'js': '/js/lib.min.js',
      'js1': '/js/app.min.js' //these go on the bottom
    }))
    .pipe(gulp.dest(htmlDst));
});

gulp.task('scriptsspecific', function(){
  var jsSrc = 'app/js/!**!/!*.js';
  //var jsDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/js';
  var jsDst = 'aws/js';

  return gulp.src(['app/js/functions.js'])
    .pipe(concat('app.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(jsDst));
});

//concatenate and rename jquery and plugins to app.min.js
gulp.task('scriptsspecifictop', function(){
  var jsSrc = 'app/js/!**!/!*.js';
  //var jsDst = 'build/WebsiteTemplates/CanvasBase/App_Themes/CanvasBase/js';
  var jsDst = 'aws/js';

  return gulp.src(['app/js/jquery.js','app/js/plugins.js'])
    .pipe(concat('lib.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(jsDst));
});


// Clean UAT file - do first

// @deprecated
gulp.task('uat_clean', function(cb) {
  del(['uat/*'],{dot: true}, cb)
});

gulp.task('uat_clean_new', function() {
  del(['uat/**/*']);
});

// Copy AWS directory and name UAT directory
gulp.task('aws_dir_copy_uat', function() {

  var appSrc = 'aws/**/*',
    appDst = 'uat';

  return gulp.src(appSrc)
    .pipe(gulp.dest(appDst));
});

// Move sitemap
gulp.task('uat_sitemap_move', function() {

  var cssSrc = 'app/sitemap.xml',
    cssDst = 'uat';

  return gulp.src(cssSrc)
    .pipe(gulp.dest(cssDst));
});

// Move configuration files for UAT
gulp.task('uat_config1', function() {
  var fSrc = 'app/*.txt';
  var fDst = 'uat';
  return gulp.src(fSrc)
    .pipe(gulp.dest(fDst));
});

gulp.task('uat_config2', function() {
  var fSrc = 'app/*.config';
  var fDst = 'uat';
  return gulp.src(fSrc)
    .pipe(gulp.dest(fDst));
});

// Zip UAT file for upload
gulp.task('uat_zip', function () {
  var Src = 'uat/**';
  var Dst = 'uat';

  return gulp.src(Src)
    .pipe(zip('uat_archive.zip'))
    .pipe(gulp.dest(Dst));
});

// Zip AWS file for upload

gulp.task('aws_zip', function () {
  var Src = 'aws/**';
  var Dst = 'aws';

  return gulp.src([Src], {dot: true})
    .pipe(zip('aws_archive.zip'))
    .pipe(gulp.dest(Dst));
});

//////////////////////////////////////////////////////////
//
// Subscripts 1-4 must run sequentially
// Script 5 - makepackage completes build for AWS and UAT
//
//////////////////////////////////////////////////////////

//#1 Clean directory
gulp.task('aws_clean_new');

//#2 Run all prep
gulp.task('aws_prepare', ['aws_webfonts_move', 'aws_css_minify_move', 'aws_css_move', 'aws_css1_minify_move', 'aws_css2_minify_move', 'aws_style_move','aws_style-import_move', 'aws_htaccess', 'aws_js_move', 'aws_html_move', 'aws_sitemap_move', 'aws_images_move', 'aws_favicons_move']);

//#3 Concat & rename JS
gulp.task('aws_postprod',['htmlreplace', 'scriptsspecific','scriptsspecifictop']);

//#4 Clean UAT folder
gulp.task('uat_clean_new');

//#5 Master build command
gulp.task('makepackage', function(){
  runSequence('aws_clean_new','aws_prepare','aws_postprod','uat_clean_new',['aws_dir_copy_uat','uat_sitemap_move','uat_config1','uat_config2'],['uat_zip','aws_zip']);
});



//start serve aws folder
gulp.task('serve_aws', ['styles', 'fonts'], function(){
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'aws'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

var reload  = browserSync.reload;

gulp.watch([
  'aws/*.html',
  'aws/js/**/*.js',
  'aws/images/**/*',
  '.tmp/css/fonts/**/*'
]).on('change', reload);

gulp.watch('aws/css/**/*.css', ['styles']);
gulp.watch('aws/css/fonts/**/*', ['fonts']);
gulp.watch('bower.json', ['wiredep', 'fonts']);
});

//end serve AWS folder

//start serve UAT folder
gulp.task('serve_uat', ['styles', 'fonts'], function(){
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'uat'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

var reload  = browserSync.reload;

gulp.watch([
  'uat/*.html',
  'uat/js/**/*.js',
  'uat/images/**/*',
  '.tmp/css/fonts/**/*'
]).on('change', reload);

gulp.watch('uat/css/**/*.css', ['styles']);
gulp.watch('uat/css/fonts/**/*', ['fonts']);
gulp.watch('bower.json', ['wiredep', 'fonts']);
});

//end serve UAT folder

