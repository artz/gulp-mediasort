/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var through = require('through2');
var ExifImage = require('exif').ExifImage;

var defaults = {
	format: './organized/{{year}}-{{ month }}/{{ year }}-{{ month }}-{{ day }}-{{ hour }}-{{ minute }}-{{ second }}-{{ width }}x{{ height }}-{{ bytes }}{{ ext }}'
};

function mediaSort(options) {

	if (!options) {
		options = {};
	}
	var format = options.format || defaults.format;

	function outputFile(data, file) {

		var name = format;
		for (var key in data) {
			name = name.replace(new RegExp('{{ *' + key + ' *}}', 'g'), data[key]);
		}
console.log(file.path, name);
		if (fs.stat(path.dirname(file.path)));
		fs.rename(file.path, name, function (err) {
			if (err) {
				console.log('Error writing file: ' + name, err);
			} else {
				console.log('Moved file: ' + name)
			}
		});

		return name;
	}

	return through.obj(function (file, encoding, callback) {

		var stat = file.stat;
		var mtime = stat.mtime;
		// var ctime = stat.ctime;
		// var mtime = stat.mtime;

		function addZero(num) {
			if (num < 10) {
				num = '0' + num;
			}
			return num;
		}

		var data = {
			ext: path.extname(file.path).toLowerCase(),
			bytes: stat.size,
			year: mtime.getFullYear(),
			month: addZero(mtime.getMonth() + 1),
			day: addZero(mtime.getDate()),
			hour: addZero(mtime.getHours()),
			minute: addZero(mtime.getMinutes()),
			second: addZero(mtime.getSeconds())
		};

		// Exif
		try {
			new ExifImage({ image: file.path }, function (err, exif) {
				if (err) {
					console.log('Exif Error: ', err);
				} else {

					// console.log('stat', stat);
					// console.log('exif', exif, '\n');

					if (exif.exif.CreateDate) {

						var date = /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(exif.exif.CreateDate);

						data.year = date[1];
						data.month = date[2];
						data.day = date[3];
						data.hour = date[4];
						data.minute = date[5];
						data.second = date[6];

					}

					data.width = exif.exif.ExifImageWidth || 0;
					data.height = exif.exif.ExifImageHeight || 0;

					data.make = exif.image.Make;
					data.model = exif.image.Model;

					outputFile(data, file);
				}
			});
		} catch (err) {
			console.log('Exception: ', err);
		}

		// Stream Out
		this.push(file);

		// Done
		callback();
	});
}

module.exports = mediaSort;
