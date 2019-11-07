"use strict";

// Global variables
var color_list = ['Y', 'B', 'R'];
var size_list = [36, 72, 108, 144];	// Default size is 72
var double_char = ':';
var size_mode = size_list[1];	// Set to default

// Define Symbol object
function eSymbol(character, modifier, color)
{
	this.character = character,
	this.modifier = modifier,
	this.color = color;
	this.encodedCharacter = function() {
		var steps = this.color * color_list.length;
		var result = this.character[0];
		var duplicates = this.character.length - 1;

		if(steps != 0 && this.character[0].match(/[A-z]/))
		{
			result = result.toLowerCase().charCodeAt(0) + steps;
			// keep within range of lowercase letters
			if(result > 'z'.charCodeAt(0))
				result = (result - 'z'.charCodeAt(0)) +
				('a'.charCodeAt(0) - 1);

			result = String.fromCharCode(result);
			// Capitalize if necessary
			if(this.character[0] == this.character[0].toUpperCase())
				result = result.toUpperCase();
		}
		// add double character(s) if necessary
		for(var i = 0; i < duplicates; i++)
			result += double_char;

		return result;
	};	// end encodedCharacter
};

// Validation check for user input.
// input: string to be checked for validity
// invalid_chars: regular expression for invalid characters
// Returns true if valid, false if invalid.
var isValid = function(input, invalid_chars)
{
	var validity = false;
	// If input contains no invalid characters, it's valid
	if (input.length > 0 && !input.match(invalid_chars))
		validity = true;

	return validity;
};

// Format string so it can be encoded.
// raw: string to be formatted
// returns formatted version of string raw, or
// empty string if raw is invalid
function format_string(raw)
{
	var dividers = /[\s.!?"]/;	// Characters that separate words
	var valid_chars = /[a-z0-9.!?'"]/;
	var formatted = '';
	var max = raw.length;
	raw = raw.toLowerCase();

	if(isValid(raw, /[^A-z0-9.,!?'"\s]/))
	{
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
	}
	else
	{
		// If raw is invalid, print message to output div
		$("#output_wrapper").append("<p>For best results, \
		use the characters listed in the 'How to use' section.</p>");
	}

	return formatted;
};

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
			// If same as previous character (in same word), add to last eSymbol
			if(current == current.toLowerCase() && 
				current.toLowerCase() == message[i-1].toLowerCase())
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
};

// Determine which characters are what color
// size: number of symbols in message
// returns an array of indexes for the first character in each section
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
};

// Shifts the given letter the given number of steps
// Adds duplicate symbol if necessary
/*
var letterShift = function(letter, steps)
{
	var shifted = letter;
	var duplicates = letter.length - 1;
	var min = 'a'.charCodeAt(0);
	var max = 'z'.charCodeAt(0);

	if(steps != 0 && letter.match(/[A-z]/))
	{
		letter = letter[0]	// Only use first character
		shifted = (letter.toLowerCase()).charCodeAt(0) + steps;

		if(shifted > max)	// keep within range of lowercase letters
			shifted = (shifted - max) + (min - 1);

		shifted = String.fromCharCode(shifted);

		if(letter == letter.toUpperCase())	// Capitalize if necessary
			shifted = shifted.toUpperCase();

		for(var i = 0; i < duplicates; i++)
			shifted += double_char;
	}

	return shifted;
};
*/

var  colorFromInt = function(integer)
{
	var color = '';
	// if integer is a valid index, get color from list
	if( integer >= 0 && integer < color_list.length)
		color = color_list[integer];

	return color;
};

var fixStringEnd = function(eString)
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
		eString[endcap] = eString[endcap + 1];
		eString[endcap + 1] = temp;
		endcap++;
	}
};

var assign_colors = function(eString)
{
	var size = eString.length;
	var all_colors = color_list.length;
	var color_num = 0;
	// Switch colors for each character
	for(var i = 0; i < size; i++)
	{
		color_num = i % all_colors;
		eString[i].color = color_num;
//		eString[i].character = 
//			letterShift(eString[i].character, color_num * all_colors);
	}
};

var scramble = function(eString)
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
	fixStringEnd(mixed);
	return mixed;
};

// Get HTML representation of the given eSymbol object
var symbolToHTML = function(mySymbol)
{
	var tag_open = "<span class=";
	var tag_close = "</span>";
	var classes = "\"" + colorFromInt(mySymbol.color) + "\">";
	var punctuation = "";
	// Character portion
	var output = tag_open + classes + mySymbol.encodedCharacter() + tag_close;
	
	// Punctuation/modifier portion
	if(mySymbol.modifier != undefined)
		punctuation = mySymbol.modifier;
	/*
	var size = 0;
	if(mySymbol.modifier != undefined)
		size = mySymbol.modifier.length;
	for(var i = 0; i < size; i++)
		punctuation += mySymbol.modifier[i];
	*/
	if(punctuation != "")
	{
		classes = "\"" + colorFromInt(0) + "\">";
		output += tag_open + classes + punctuation + tag_close;
	}

	output+= "\n";

	return output;
};

// FIXME: incomplete function
var textToSvg = function(text, color)
{
	// Name of directory containing svg files
	var filename = 'https://jessicp0249.github.io/Enkrypt_web/images/svg_list.html';
	var nodes = [];	// Array of nodes to return
	var node, id;

	for(var i = 0; i < text.length; i++)
	{
		id = "#" + text.charCodeAt(i);
		node = document.createElement("svg");
		// FIXME: Assign file contents to node
		node.load(filename + " " + id);
		// FIXME: Assign class: color to node
		node.attr("class", color);
		// FIXME: Add node to array
		nodes.append(node);
	}
	
	return nodes;
};

var outputSvg = function(eString, outSource) {
	var size = eString.length;
	var char_nodes, mod_nodes, text, color;
	for(var i = 0; i < size; i++)
	{
		text = eString[i].encodedCharacter();
		color = eString[i].color;
		sym_nodes = textToSvg(text, color);
		outSource.appendChild(sym_nodes);

		text = eString[i].modifier;
		if(text != undefined && text != '')
		{
			sym_nodes = textToSvg(text, 0);
			$(outSource).appendChild(sym_nodes);
		}
	}
}

// "EnKrypt!" button
var encryptInput = function() {
	var raw = $("#user_input").val();
	var message = format_string(raw);

	if(message != '')
	{
		// Build and scramble message
		var eString = scramble(messageFromString(message));
		$("#output_wrapper").html('');	// Clear previous output

		outputSvg(eString, "#output_wrapper");
/*
		// Convert each eSymbol to HTML and add to document
		for(var i = 0; i < eString.length; i++)
			$("#output_wrapper").append(symbolToHTML(eString[i]));
*/	
	}

	$("#user_input").focus();
};

$(document).ready(function() 
{
	$("#clear_btn").click(function() {
		$("#user_input").html("");
	});	// end clear button click

	$("#enkrypt_btn").click(encryptInput);

	$(".color_options").click(function() {
		var id = $(this).attr("id");
		$("#color_styles").attr("href", "styles/" + id + ".css");
		// Change option displayed in "selected_options" span for color mode
		var name = $(this).children("img").attr("alt");
		$("#color_mode").html(": " + name);
	});	// end click for color options
	
	$(".size_options").click(function() {
		var id = $(this).attr("id");
		var width;

		if(id == "smaller")
			width = size_list[0];
		else if(id == "default_size")
			width = size_list[1];
		else if(id == "bigger")
			width = size_list[2];
		else if(id == "biggest")
			width = size_list[3];

		size_mode = width;
		$("#size_styles").html("svg { width: " + width + "px; }");
		$("#size_mode").html(": " + $("#" + id).html());
	});	// end click for size options

	$("#user_input").focus();
});	// end ready

// Each ESymbol has width of 1
// Each modifier has width of 1/2 or 1/4
// Modifiers must be on the same line as the previous ESymbol