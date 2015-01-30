document.addEventListener('DOMContentLoaded', function(){
	var oldValue;
	var req = new XMLHttpRequest();
	req.onload = function() {

		var data = JSON.parse(this.responseText);
		var reverse = {};
		var charNames = Object.keys(data);
		for (var x = 0; x < charNames.length; ++x)
			reverse[data[charNames[x]]] = charNames[x];

		var i = document.getElementById('char');
		var r = document.getElementById('results');

		var setResult = function(a, included) {
			var charCode, name;

			if (typeof(a) == 'number') {
				name = reverse[a];
				charCode = a;
			} else {
				name = a;
				charCode = data[a];
			}

			if (!name || !charCode)
				return;

			var old = document.getElementById(name);
			if (!included && old)
				r.removeChild(old);
			else if (included && !old) {
				var result = document.createElement('li');
				result.id = name;
				var chr = document.createElement('span');
				chr.classList.add('char');
				if (charCode > 0xffff) {
					var hi = ((charCode - 0x10000) >> 10) + 0xD800;
					var lo = (charCode - 0x10000) % 0x400 + 0xDC00;	
				}
				chr.appendChild(document.createTextNode(
					charCode > 0xffff
						? String.fromCharCode(hi, lo)
						: String.fromCharCode(data[name])));
				result.appendChild(chr);
				result.appendChild(document.createTextNode(name));
				chr = document.createElement('span');
				chr.appendChild(document.createTextNode(
					'U+' + charCode.toString(16) + ' | ' +
					'\\u' + (charCode > 0xffff 
						? hi.toString(16) + '\\u' + lo.toString(16) 
						: charCode.toString(16)) + ' | ' +
					'&#x' + charCode.toString(16) + ';'));
				chr.classList.add('charcode');
				result.appendChild(chr);
				r.appendChild(result);
			}
		};

		var f = function() {
			if (oldValue == this.value) return;
			oldValue = this.value;
			document.location.href = document.location.href.split('#')[0] + '#' + this.value;
			var skip = [];
			if (/^[0-9]+$/.test(this.value)) {
				var n = parseInt(this.value, 10);
				skip.push(reverse[n]);
				setResult(n, true);
			}
			if (/^[0-9a-fA-F]+$/.test(this.value)) {
				var n = parseInt(this.value, 16);
				skip.push(reverse[n]);
				setResult(n, true);
			}
			var bits = this.value.split(' ');
			var count = 0;
			var regexes = [];
			for (var bit = 0; bit < bits.length; ++bit)
				if (bits[bit].length > 0)
					regexes.push(new RegExp(bits[bit].length == 1
						? '\\b' + bits[bit] + '\\b'
						: bits[bit], 'i'));
			if (regexes.length == 0)
				regexes = [{ test: function() { return false } }];
			for (var candidate = 0; candidate < charNames.length; ++candidate) {
				var name = charNames[candidate];
				if (skip.indexOf(name) >= 0)
					continue;
				for (var regex = 0; regex < regexes.length; ++regex)
					if (!regexes[regex].test(name))
						regex = NaN;
				setResult(name, !isNaN(regex) && (++count <= 100));
			}
		};
		var n = document.location.href.indexOf('#');
		if (n > 0)
			i.value = decodeURIComponent(document.location.href.substr(n + 1));
		f.bind(i)();
		i.addEventListener('type', f);
		i.addEventListener('keypress', f);
		i.addEventListener('paste', f);
		i.addEventListener('input', f);
		i.focus();
	};
	req.open("get", "unicode.txt", true);
	req.send();
});