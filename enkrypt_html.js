"use strict";

// Global variables
var color_list = ['Y', 'B', 'R'];
var size_list = [36, 72, 108, 144];	// Default size is 72
var double_char = ':';
var size_mode = size_list[1];	// Set to default


// Shorthand function
var $ = function(id) { return document.getElementById(id); }

// Define Symbol object
function eSymbol(character, modifier, color)
{
	this.character = character,
	this.modifier = modifier,
	this.color = color;
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
		validity = true;

	return validity;
}

// Format string so it can be encoded
function format_string(raw)
{
	var dividers = /[\s.!?"]/;	// Characters that separate words
	var valid_chars = /[a-z0-9.!?'"]/;

	raw = raw.toLowerCase();
	var formatted = '';
	var max = raw.length;

	for(var i = 0; i < max; i++)
	{
		// Capitalize first character
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

function messageFromString(message)
{
	var eString = [];	// Array for eSymbols
	var current = '';	// Current character in message
	var size = message.length;
	// Initialize first character in array
	eString[0] = new eSymbol(message[0],'','');

	// Convert each character to eSymbol and add to array
	for(var i = 1; i < size; i++)
	{
		current = message[i];

		if(current.match(/[A-z]/))
		{
			// If same as previous character, add to last eSymbol
			if(current.toLowerCase() == message[i-1].toLowerCase())
				eString[eString.length-1].character += current;
			else
				eString[eString.length] = new eSymbol(current,'','');
		}
		else if(current.match(/[0-9]/))
			eString[eString.length] = new eSymbol(current,'','');
		// Punctuation
		else if(i > 0)	// Add to modifier of previous eSymbol
			eString[eString.length - 1].modifier += current;
		else 	// If no previous exists, create one
			eString[eString.length] = new Symbol('', current,'');
	}

	return eString;
}

// Determine which characters are what color
function splitIntoSections(size)
{
	var num_colors = color_list.length;
	var remainder = (size % num_colors);
	var section_size = Math.floor(size / num_colors);
	// Array contains indexes of first item in each section
	var indexes = [0, section_size, (2 * section_size)];

	// Distribute remainder among sections
	// for each 1 in remainder, increment the size of a section
	for(var i = 0; i < remainder; i++)
	{
		// scoot forward first item of all following sections to make room
		for(var j = i+1; j < num_colors; j++)
			indexes[j]++;
	}

	return indexes;
}

// Shifts the given letter the given number of steps
// Adds duplicate symbol if necessary
function letter_shift(letter, steps)
{
	if(steps == 0 || !letter.match(/[A-z]/))
		shifted = letter;	// No change
	else
	{
		var duplicates = letter.length-1;
		letter = letter[0]	// Only use first character
		
		var is_capital = (letter == letter.toUpperCase());
		var shifted = (letter.toLowerCase()).charCodeAt(0) + steps;
		
		// Keep within range of lowercase letters
		var min = 'a'.charCodeAt(0);
		var max = 'z'.charCodeAt(0);
		if(shifted > max)
			shifted = (min - 1) + (shifted - max);

		shifted = String.fromCharCode(shifted);
		if(is_capital)	// Capitalize if necessary
			shifted = shifted.toUpperCase();

		for(var i = 0; i < duplicates; i++)
			shifted += double_char;
	}

	return shifted;
}

function colorFromInt(integer)
{
	var color = '';
	// if integer is a valid index, get color from list
	if( integer >= 0 && integer < color_list.length)
		color = color_list[integer];

	return color;
}

function assign_colors(eString)
{
	var size = eString.length;
	var all_colors = color_list.length;
	var color_num = 0;
	// Switch colors for each character
	for(var i = 0; i < size; i++)
	{
		color_num = i % all_colors;
		eString[i].color = colorFromInt(color_num);
		eString[i].character = 
			letter_shift(eString[i].character, color_num * all_colors);
	}
}

function fix_string_end(eString)
{
	var size = eString.length;
	var remainder = size % color_list.length;
	// Index of symbol that should be at the end
	var endcap = (size-1) - remainder;
	var temp;
	// Swap endcap with element after it until it reaches the end
	while(endcap < (size-1))
	{
		temp = eString[endcap];
		eString[endcap] = eString[endcap+1];
		eString[endcap+1] = temp;
		endcap++;
	}
}

function scramble(eString)
{
	var size = eString.length;
	var all_colors = color_list.length;
	var mixed = new Array(size);

	// Don't scramble if there's only one character per color
	if( size <= all_colors)
		mixed = eString;
	else
	{
		// Target index in eString; number of chars used from each
		// section; color of current character
		var target = 0, offset = 0, color = 0;
		var sections = splitIntoSections(size);

		for(var i = 0; i < size; i++)
		{
			color = i % all_colors;
			target = sections[color] + offset;
			mixed[i] = eString[target];

			if(all_colors - 1 == color)
				offset++;
		}
	}

	assign_colors(mixed);
	fix_string_end(mixed);
	return mixed;
}

// Get HTML representation of the given eSymbol object
function symbolToHTML(mySymbol)
{
	var tag_open = "<span class=";
	var tag_close = "</span>";
	var classes = "\"" + mySymbol.color + "\">";
	var punctuation = "";
	// Character portion
	var output = tag_open + classes + mySymbol.character + tag_close;
	
	// Punctuation/modifier portion
	var size = 0;
	if(mySymbol.modifier != undefined)
		size = mySymbol.modifier.length;
	for(var i = 0; i < size; i++)
		punctuation += mySymbol.modifier[i];

	if(punctuation != "")
	{
		classes = "\"" + colorFromInt(0) + "\">";
		output += tag_open + classes + punctuation + tag_close;
	}

	output+= "\n";

	return output;
}

// "EnKrypt!" button
function encrypt_input() 
{
	var raw = $("user_input").value;
	if(isValid(raw, /[^A-z0-9.,!?'"\s]/))
	{
		// Clear previous contents of output wrapper
		$("output_wrapper").innerHTML = '';

		var message = format_string(raw);
		var eString = messageFromString(message);
		eString = scramble(eString);

		// Convert each eSymbol to HTML and add to document
		for(var i = 0; i < eString.length; i++)
			$("output_wrapper").innerHTML += symbolToHTML(eString[i]);

		$("user_input").focus();
	}
}

var set_color_mode = function(id)
{
	var style = $("color_styles");	// Color stylesheet
	style.href = "styles/" + id + ".css";	// Change url

	// Change option displayed in "selected_options" span for color mode
//	var name = $(id).getFirstChild.getAttribute("alt");
	var name = $(id).firstElementChild.getAttribute("alt");
	$("color_mode").innerHTML = ": " + name;
}

// FIXME: untested function.
var set_size_mode = function(id)
{
	var width;

	if(id == "smaller")
		width = size_list[0];
	else if(id == "default_size")
		width = size_list[1];
	else if(id == "bigger")
		width = size_list[2];
	else if(id == "biggest")
		width = size_list[3];


	$("size_styles").innerHTML = "svg { width: " + width + "px; }";

	$("size_mode").innerHTML = ": " + $(id).innerHTML;
}

var setup_display_options = function(classname, handler)
{
	var options = document.getElementsByClassName(classname);
	var size = options.length;

	for(var i=0; i < size; i++)
	{
		options[i].onclick = function(evt) {
			// Prevent default action of anchor element
			if(!evt) { evt = window.event; }
			if(evt.preventDefault)
				evt.preventDefault();
			else
				evt.returnValue = false;
			// Send to set_color_mode/set_size_mode function
			handler(this.id);
		}
	}
}

// "Clear" button
function clear_output()
{
	$('user_input').value = '';
}

window.onload = function()
{
	$("user_input").focus();
	$("clear_btn").onclick = clear_output;
	$("enkrypt_btn").onclick = encrypt_input;
	setup_display_options("color_options", set_color_mode);
	setup_display_options("size_options", set_size_mode);

}

// Each ESymbol has width of 1
// Each modifier has width of 1/2 or 1/4
// Modifiers must be on the same line as the previous ESymbol