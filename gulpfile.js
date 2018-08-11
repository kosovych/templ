var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	browserSync = require('browser-sync').create(),
	browserify = require('browserify'),
	sourse = require('vinyl-source-stream'),
	ejs = require("gulp-ejs"),
	uglify = require('gulp-uglify');
	buffer = require('vinyl-buffer');
	const babelify = require("babelify");


gulp.task('serve', () => {
	browserSync.init({
		server: {
			baseDir: "./src/"
		},
		notify: false
	});
});

gulp.task('sass', () => {
	return gulp.src('src/scss/**/*.scss')
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 10 versions'],
		cascade: false
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('src/css'))
	.pipe(browserSync.reload({
		stream: true
	}));
});

gulp.task('ejs', function() {
	return gulp.src(['./src/templates/**/*.ejs', '!./src/templates/templ/**/*.ejs'])
	.pipe(ejs({ msg: 'Hello Gulp!'}, {}, { ext: '.html' }))
	.pipe(gulp.dest("./src"));
});

gulp.task('watch', () => {
	gulp.watch('src/**/*.html').on('change', browserSync.reload);
	gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
	gulp.watch('src/js/main.js', gulp.series('js'));
	gulp.watch('src/js/bundle.js').on('change', browserSync.reload);
	gulp.watch('src/templates/**/*.ejs', gulp.series('ejs'));
});

gulp.task('default', gulp.series(
	gulp.parallel('sass', 'ejs'),
	gulp.parallel('watch', 'serve')
));

gulp.task('js', function() {
	// return browserify('/src/js/main.js')
	// 	.bundle({debug: true})
	// 	.pipe(sourse('/src/js/bundle.js'))
	// 	.pipe(gulp.dest('.'))
	
	return browserify('./src/js/main', { debug: true })
	.transform(babelify, {presets: ["env"]})
	.bundle()
	.pipe(sourse('./src/js/bundle.js'))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(gulp.dest('.'))
});

// GULP build

gulp.task('html-build', ()=>{
	return gulp.src('src/**/*.html')
		.pipe(gulp.dest('./dist'));
});

var csso = require('gulp-csso');

gulp.task('csso', () => {
	return gulp.src('src/scss/**/*.scss')
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 15 versions'],
		cascade: false
	}))
	.pipe(sourcemaps.write())
	.pipe(csso({
		restructure: false,
		sourceMap: true,
		debug: true
	}))
	.pipe(gulp.dest('dist/css'));
});

gulp.task('font-build', ()=>{
	return gulp.src('src/font/**/*.*')
		.pipe(gulp.dest('./dist/font'));
});

gulp.task('favicon-build', ()=>{
	return gulp.src('src/favicon.ico')
		.pipe(gulp.dest('./dist'));
});

const imagemin = require('gulp-imagemin');
 
gulp.task('img-build', () =>
	gulp.src('src/img/**/*.*')
			.pipe(imagemin())
			.pipe(gulp.dest('dist/img'))
);

gulp.task('js-build-lib', () => {
	return gulp.src('src/js/lib/**/*.js')
		.pipe(gulp.dest('dist/js/lib'))
})

gulp.task('js-build', () => {
	return gulp.src('src/js/bundle.js')
		.pipe(gulp.dest('dist/js/'))
})