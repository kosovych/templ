var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	browserSync = require('browser-sync').create(),
	browserify = require('browserify'),
	sourse = require('vinyl-source-stream'),
	ejs = require('gulp-ejs'),
	uglify = require('gulp-uglify'),
	buffer = require('vinyl-buffer'),
	babelify = require('babelify'),
	htmlbeautify = require('gulp-html-beautify');

///DEV MODE///

gulp.task('serve', () => {
	browserSync.init({
		server: {
			baseDir: './src/'
		},
		notify: false
	});
});

gulp.task('sass', () => {
	return gulp.src('src/scss/**/*.scss')
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 15 versions'],
		cascade: false
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('src/css'))
	.pipe(browserSync.reload({
		stream: true
	}));
});


gulp.task('watch', () => {
	gulp.watch('src/**/*.html').on('change', browserSync.reload);
	gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
	gulp.watch(['src/js/**/*.js', '!./src/js/bundle.js'], gulp.series('js'));
	gulp.watch('src/js/bundle.js').on('change', browserSync.reload);

	gulp.watch('src/templates/**/*.ejs').on('change', (file) => {
		if(file.includes('/includes')) {
			return gulp.src(['./src/templates/**/*.ejs', '!./src/templates/includes/**/*.ejs'])
			.pipe(ejs({ msg: 'Hello Gulp!'}, {}, { ext: '.html' }))
			.pipe(htmlbeautify( {indentSize: 2} ))
			.pipe(gulp.dest("./src"));
		}

		let src = file.replace('/templates', '').split('/');
		src[src.length - 1] = '';
		src = src.join('/');

		gulp.src([`./${file}`])
		.pipe(ejs({ msg: 'Hello Gulp!'}, {}, { ext: '.html' }))
		.pipe(htmlbeautify( {indentSize: 2} ))
		.pipe(gulp.dest(`./${src}`));
	})
});

gulp.task('js', () => {
	return browserify('./src/js/main', { debug: true })
	.transform(babelify, {presets: ["env"]})
	.bundle()
	.pipe(sourse('./src/js/bundle.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(uglify())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('.'))
});

gulp.task('default', gulp.series(
	gulp.parallel('watch', 'serve')
));

// GULP BUILD //

const htmlmin = require('gulp-htmlmin');
const csso = require('gulp-csso');
const gzip = require('gulp-gzip');

gulp.task('html-build', () => {
	return gulp.src('src/**/*.html')
	.pipe(htmlmin({ collapseWhitespace: true }))
	.pipe(gulp.dest('dist'));
});


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

gulp.task('font-build', () =>{
	return gulp.src('src/font/**/*.*')
		.pipe(gulp.dest('./dist/font'));
});

gulp.task('favicon-build', () =>{
	return gulp.src('src/favicon/**/*.*')
		.pipe(gulp.dest('./dist/favicon'));
});
 
gulp.task('img-build', () => {
	return gulp.src('src/img/**/*.*')
	.pipe(gulp.dest('./dist/img'))
}
);

gulp.task('js-build-lib', () => {
	return gulp.src('src/js/lib/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/js/lib'))
});

gulp.task('js-build', () => {
	return gulp.src(['src/js/bundle.js', 'src/js/bundle.js.map' ])
		.pipe(gulp.dest('dist/js/'))
});

gulp.task('gzipCssFiles', () => {
	return gulp.src('dist/css/*.css')
	.pipe(gzip())
	.pipe(gulp.dest('dist/css'));
});

gulp.task('gzipJSFiles', () => {
	return gulp.src('dist/js/**/*.js')
	.pipe(gzip())
	.pipe(gulp.dest('dist/js'));
});

gulp.task('build', gulp.series('html-build', 'csso', 'font-build', 'favicon-build', 'img-build', 'js-build-lib', 'js-build', gulp.parallel('gzipCssFiles', 'gzipJSFiles')));