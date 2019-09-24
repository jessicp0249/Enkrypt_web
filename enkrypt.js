// global variable
var num_colors = 3;


// Define Symbol object
function Symbol(character, modifier, color)
{
	this.character = character,
	this.modifier = modifier,
	this.color = color;
}

// Format string so it can be encoded
var format_string = function(raw)
{
	// Characters that separate words
	var dividers = /[\s.!?"]/;
	// Characters that can be encoded (no whitespace)
	var valid_chars = /[a-z0-9.!?'"]/;

	raw = raw.toLowerCase();
	var formatted = '';
	var max = raw.length;

	for(var i = 0; i < max; i++)
	{
		if(i == 0)
		{
			// Capitalize first character and add to string
			formatted = (raw[i]).toUpperCase();
		}
		else if(raw[i].match(/[a-z]/) && raw[i-1].match(dividers))
		{
			// Capitalize first letter of each word
			formatted += (raw[i]).toUpperCase();
		}
		else if(raw[i].match(valid_chars))
		{
			// Add valid characters to formatted string
			formatted += raw[i];
		}
	}

	return formatted;
}

var messageFromString = function(message)
{
	var eString = [];	// Array for eSymbols
	// Convert each character to eSymbol and add to array
	for(var i = 1; i < message.length; i++)
	{
		if(message[i].match(/[A-z0-9]/))
		{
			if(i > 0)
			{
				// Assign to new ESymbol
				eString[eString.length] = new Symbol(message[i],'','');				
			}
			else
			{
				eString[0] = new Symbol(message[i],'','');
			}
		}
		else if(i > 0)
		{
			// Add to modifier of previous eSymbol
			eString[eString.length - 1].modifier += message[i];
		}
		else
		{
			// If no previous Symbol exists, create one and assign to modifier
			eString[eString.length] = new Symbol('',message[i],'');
		}
	}

	return eString;
}

var splitIntoSections = function(size)
{
	var remainder = (size % num_colors);
	// Minimum section size when splitting up by color
	var section_size = Math.floor(size / num_colors);
	// Index of first item in each section
	var indexes = [0, section_size, (2 * section_size)];

	// Shift red section to make room for remainder
	indexes[2] += remainder;
	indexes[1] += (remainder - 1);

	return indexes;
}

var colorFromInt = function(integer)
{
	var color = '';
	if(integer == 0)
	{
		color = 'Y';
	}
	else if(integer == 1)
	{
		color = 'B';
	}
	else if(integer == 2)
	{
		color = 'R';
	}

	return color;
}

var assign_colors = function(eString)
{
	var size = eString.length;

	for(var i = 0; i < size; i++)
	{
		eString[i].color = colorFromInt(i % num_colors);
	}
}

var scramble = function(eString)
{
	var size = eString.length;

	if( size <= num_colors)
	{
		// Don't scramble if there's only one character per color
		return eString;
	}

	var mixed = new Array(size);
	var target = 0, offset = 0, color = 0;
	var sections = splitIntoSections(size);

	for(var i = 0; i < size; i++)
	{
		color = i % num_colors;
		target = sections[color] + offset;
		mixed[i] = eString[target];
		if(num_colors - 1 == color)
		{
			offset++;
		}
	}

	assign_colors(mixed);

	return mixed;
}

var symbolToHTML = function(mySymbol)
{
	// Convert eSymbol to HTML
}

// Each ESymbol has width of 1
// Each modifier has width of 1/2 or 1/4
// Modifiers must be on the same line as the previous ESymbol


// EnKrypt button
document.getElementById("enkrypt_btn").onclick = function() 
{
	var raw = document.getElementById("user_input").value;

	// Regular expression matching all characters except valid oness
	var invalid_chars = /[^A-z0-9.,!?'"\s]/;
	// Validation check
	if (raw.length == 0 || raw.match(invalid_chars))
	{
		// If string is invalid, print message to output div
		alert("Invalid entry");
		document.getElementById('output_wrapper').innerHTML += 
		"<p>For best results, use the characters listed above.</p>";
	}
	else
	{
		// Clear previous contents of output wrapper
		document.getElementById("output_wrapper").innerHTML = '';

		var message = format_string(raw);
		// Convert string to an array of eSymbols
		var eString = messageFromString(message);
		eString = scramble(eString);

		var output = '';

		// Convert each eSymbol to HTML and add to document
		for(var i = 0; i < eString.length; i++)
		{
			output = symbolToHTML(eString[i]);
			document.getElementById("output_wrapper").innerHTML += output;
		}

		alert(message);
	}
}

// Clear button
document.getElementById('clear_btn').onclick = function()
{
	document.getElementById('output_wrapper').innerHTML = 
	"<p>Encrypted message will appear here.</p>\
	\n<noscript>Warning: this page uses Javascript.</noscript>";
}
