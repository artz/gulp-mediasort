var gulp = require('gulp');
var mediasort = require('../');

gulp.task('mediasort', function () {
	gulp.src('./import/**/*.jpg', {
		nocase: true
	}).pipe(mediasort());
});

gulp.task('default', ['mediasort']);
