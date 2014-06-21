var request = require('request');
request('http://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt', function(err, resp, body) {
	body = body.split('\n');
	var data = {};
	for (var i = 0; i < body.length; ++i) {
		var bits = body[i].split(';');
		if (bits[1] == '<control>')
			continue;
		data[bits[1]] = parseInt(bits[0], 16);
	}
	var fs = require('fs');
	fs.writeFile('unicode.txt', JSON.stringify(data));
});