// Global variables
var num_colors = 3;
var color_mode = '';
var size_mode = '';


// Shorthand function
var $ = function(id)
{
	return document.getElementById(id);
}

// FIXME - Incomplete function
var set_color_mode = function(button_id)
{
	// get selected button
	var selected = $(button_id);
	var old = $("selected_color");
	if (selected != old)
	{
		// Remove "selected color" id from old and add to selected
		// Apply color classes to <span> elements in the output element
	}
}

// Define Symbol object
function eSymbol(character, modifier, color)
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

// FIXME - Account for "double" modifier

	for(var i = 0; i < max; i++)
	{
		// Capitalize first character and add to string
		if(i == 0)
			formatted = (raw[i]).toUpperCase();
		// Capitalize first letter of each word
		else if(raw[i].match(/[a-z]/) && raw[i-1].match(dividers))
			formatted += (raw[i]).toUpperCase();
		// Add valid characters to formatted string
		else if(raw[i].match(valid_chars))
			formatted += raw[i];
	}

	return formatted;
}

var messageFromString = function(message)
{
	var eString = [];	// Array for eSymbols
	// Convert each character to eSymbol and add to array
	for(var i = 0; i < message.length; i++)
	{
		// Letters and numbers
		if(message[i].match(/[A-z0-9]/))
		{
			// Assign to new ESymbol at position i
			if(i > 0)
				eString[eString.length] = new eSymbol(message[i],'','');
			// Assign to new eSymbol at first position
			else
				eString[0] = new eSymbol(message[i],'','');
		}
		// Punctuation
		else if(i > 0)	// Add to modifier of previous eSymbol
			eString[eString.length - 1].modifier += message[i];
		else 	// If no previous Symbol exists, create one and assign to modifier
			eString[eString.length] = new Symbol('',message[i],'');
	}

	return eString;
}

// Determine which characters will be which color
var splitIntoSections = function(size)
{
	var remainder = (size % num_colors);
	// Minimum section size when splitting up by color
	var section_size = Math.floor(size / num_colors);
	// Array contains indexes of first item in each section
	var indexes = [0, section_size, (2 * section_size)];

	// Distribute remainder among sections
	var i = indexes.size-1;
	while(remainder > 0)
	{
		indexes[i] += remainder;
		remainder--;
	}

	return indexes;
}

var colorFromInt = function(integer)
{
	var color = '';

	if(integer == 0)
		color = 'Y';
	else if(integer == 1)
		color = 'B';
	else if(integer == 2)
		color = 'R';

	return color;
}

var assign_colors = function(eString)
{
	var size = eString.length;
	// Switch colors for each character
	for(var i = 0; i < size; i++)
		eString[i].color = colorFromInt(i % num_colors);
}

var scramble = function(eString)
{
	var size = eString.length;
	if( size <= num_colors)
	{
		// Don't scramble if there's only one character per color
		assign_colors(eString);
		return eString;
	}

	var mixed = new Array(size);
	// divide eString into equal sections of color
	var sections = splitIntoSections(size);
	// Target index in eString, offset in section, color section
	var target = 0, offset = 0, color = 0;

	for(var i = 0; i < size; i++)
	{
		color = i % num_colors;
		target = sections[color] + offset;
		mixed[i] = eString[target];

		if(num_colors - 1 == color)
			offset++;
	}

	assign_colors(mixed);
	return mixed;
}

// Get HTML representation of the given eSymbol object
var symbolToHTML = function(mySymbol)
{
	var tag_open = "<span class=";
	var tag_close = "</span>";
	var classes = "\"" + mySymbol.color + color_mode + "\">";
	var punctuation = "";
	// Character portion
	var output = tag_open + classes + mySymbol.character;
	// Add "double" modifiers
	var size = mySymbol.modifier.length;
	for(var i = 0; i < size; i++)
	{
	//		if(mySymbol.modifier[i] == "'" || mySymbol.modifier[i] == "-")
		if(mySymbol.modifier[i] == "-")
			output += mod[i];
		else
			punctuation += mod[i];
	}

	if(punctuation != "")
	{
		classes = "\"" + colorFromInt(0) + color_mode + "\">";
		output += tag_open + classes + punctuation + tag_close;
	}

	output+= "\n";

	return output;
}

// Validation check
var isValid = function(input, invalid_chars)
{
	var validity = false;
	// If invalid, print message to output div
	if (input.length == 0 || input.match(invalid_chars))
	{
		$('output_wrapper').innerHTML += "<p>For best results, \
		use the characters listed in the 'How to use' section.</p>";
	}
	else
	{
		validity = true;
	}

	return validity;
}

// "EnKrypt!" button
$("enkrypt_btn").onclick = function() 
{
	var raw = $("user_input").value;
	if(isValid(raw, /[^A-z0-9.,!?'"\s]/))
	{
		// Clear previous contents of output wrapper
		$("output_wrapper").innerHTML = '';
		var message = format_string(raw);

	// DEBUGGER
		alert(message);
	// DEBUGGER

		// Convert string to an array of eSymbols
		var eString = messageFromString(message);

		eString = scramble(eString);
		// Convert each eSymbol to HTML and add to document
		for(var i = 0; i < eString.length; i++)
			$("output_wrapper").innerHTML += symbolToHTML(eString[i]);
	}
}

// "Clear" button
$("clear_btn").onclick = function()
{
	$('output_wrapper').innerHTML = 
	"<p>Encrypted message will appear here.</p>\
	\n<noscript>Warning: this page uses Javascript.</noscript>";
}


// Each ESymbol has width of 1
// Each modifier has width of 1/2 or 1/4
// Modifiers must be on the same line as the previous ESymbol