

// Global variables
var color_list = ['Y', 'B', 'R'];
var size_list = {
	'smaller':36, 
	'default_size':56, 
	'bigger':72, 
	'biggest':108
};	// Default size is 72
var double_char = ':';
var size_mode = size_list[1];	// Set to default


// Validation check for user input.
// input: string to be checked for validity
// invalid_chars: regular expression for invalid characters
// Returns true if valid, false if invalid.
var isValid = function(input, invalid_chars)
{
	// If input contains no invalid characters, it's valid
	if (input.length > 0 && !input.match(invalid_chars))
		return true;
	else
		return false;
};

// Format string so it can be encoded.
// raw: string to be formatted
// returns formatted version of string raw, or
// empty string if raw is invalid
var format_string = function(raw)
{
	// Characters that separate words
	var dividers = /[\s.!?"]/;
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
		use the characters listed in the 'Valid Characters' \
		section.</p>");
	}

	return formatted;
};

var  colorFromInt = function(integer)
{
	var color = '';
	if(integer >= 0 && integer < color_list.length)
		color = color_list[integer];

	return color;
};


/*
==========
eSymbol object
==========
*/
// eSymbol constructor
function eSymbol(character, modifier, color)
{
	this.character = character,
	this.modifier = modifier,
	this.color = color;
};

eSymbol.prototype.setChar = function(chara)
{this.character = chara;}

eSymbol.prototype.setMod = function(mod)
{this.modifier= mod;}

eSymbol.prototype.setColor = function(col)
{this.color = col;}

// Shifts the character based on color
eSymbol.prototype.encodedCharacter = function() 
{
	// Steps: number of steps to shift character
	var steps = this.color * color_list.length;
	var letter = this.character[0];	// first character
	var result = letter;
	// Number of double characters to add, if any
	var duplicates = this.character.length - 1;

	if(steps > 0 && letter.match(/[A-z]/))
	{
		result = result.toLowerCase().charCodeAt(0) + steps;
		// keep within range of lowercase letters
		if(result > 'z'.charCodeAt(0))
			result = (result - 'z'.charCodeAt(0)) +
			('a'.charCodeAt(0) - 1);

		result = String.fromCharCode(result);
		// Capitalize if necessary
		if(letter == letter.toUpperCase())
			result = result.toUpperCase();
	}
	// add double character(s) if necessary
	for(var i = 0; i < duplicates; i++)
		result += double_char;

	return result;
};


eSymbol.prototype.toSvg = function(selector) 
{
	var text, mod_index, color, size, node;
	text = this.encodedCharacter();
	mod_index = text.length;
	color = colorFromInt(this.color);

	if(this.modifier != "" && this.modifier != undefined)
		text += this.modifier;

	size = text.length;
	for(var i = 0; i < size; i++)
	{
		if(i == mod_index)
			color = colorFromInt(0);
		/*		
		node = $(svg_nodes[text.charCodeAt(i)]).clone();
		node.addClass(color);
		node.appendTo(selector); // add node to document
		*/
		node = svg_nodes[text.charCodeAt(i)];
		$(selector).append(node);
		$(selector).children("svg").last().addClass(color);
	}
};

// Get HTML representation of the given eSymbol object
eSymbol.prototype.toHTML = function()
{
	var tag_open = "<span class=";
	var tag_close = "</span>";
	var classes = "\"" + colorFromInt(this.color) + "\">";
	var punctuation = "";
	// Character portion
	var output = tag_open + classes +
		this.encodedCharacter() + tag_close;
	
	// Punctuation/modifier portion
	if(this.modifier != undefined)
		punctuation = this.modifier;
	if(punctuation != "")
	{
		classes = "\"" + colorFromInt(0) + "\">";
		output += tag_open + classes + punctuation + tag_close;
	}

	output+= "\n";

	return output;
};


/*
==========
eString object
==========
*/
// eString constructor
function eString()
{ this.symbols = []; /* Array for eSymbols */ };

eString.prototype.length = function() 
{ return this.symbols.length; };

// Get last symbol in array
eString.prototype.lastSymbol = function()
{ return this.symbols[this.length() - 1];};

eString.prototype.buildFromText = function(message)
{
	var current = '';	// Current character in message
	var size = message.length;
	var len;
	// Initialize first character in array
	/*
		if(message[0].match(/[A-z0-9]/))
			this.symbols[0] = new eSymbol(message[0],'','');
		// if punctuation, initialize as modifier
		else
			this.symbols[0] = new eSymbol('',message[0],'');

		
		// Convert each character to eSymbol and add to array
		for(var i = 1; i < size; i++)
		{
			current = message[i];
			len = this.length;

			if(current.match(/[A-z]/))
			{
				// If same as previous character (in same word), 
				// add to last eSymbol
				if(current == message[i-1].toLowerCase())
					this.lastSymbol.character += current;
				else
					this.symbols[len] = new eSymbol(current,'','');
			}
			else if(current.match(/[0-9]/))
				this.symbols[len] = new eSymbol(current,'','');
			// Add punctuation to modifier of previous eSymbol
			else
				this.lastSymbol.modifier += current;
		}
	*/

	// initialize first symbol
	this.symbols[0] = new eSymbol('','','');

	for(var i = 0; i < size; i++)
	{
		current = message[i];
		len = this.length();
		var temp = '';

		if(current.match(/[A-z0-9]/))
		{
			// If same as previous character (in same word), 
			// add to last eSymbol
			if(i == 0 || current == message[i-1].toLowerCase())
			{
				temp = this.lastSymbol().character;
				if(temp == undefined || temp == '')
					this.lastSymbol().setChar(current);
				else
					this.lastSymbol().setChar(temp + current);
			}
			else	// create new symbol
				this.symbols[len] = new eSymbol(current,'','');
		}
		// Add punctuation to modifier of previous eSymbol
		else
		{
			temp = this.lastSymbol.modifier;
			if(temp == undefined || temp == '')
				this.lastSymbol().setMod(current);
			else
				this.lastSymbol().setMod(temp + current);
		}
	}

};

eString.prototype.splitIntoSections = function()
{
	var size = this.length();
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

eString.prototype.assign_colors = function()
{
	var size = this.length();
	var all_colors = color_list.length;
	var color_num = 0;
	// Switch colors for each character
	for(var i = 0; i < size; i++)
	{
		color_num = i % all_colors;
		this.symbols[i].color = color_num;
		//this.symbols[i].character = 
		//	letterShift(this.symbols[i].character, color_num * all_colors);
	}
};

eString.prototype.fixStringEnd = function()
{
	var size = this.length();
	var remainder = size % color_list.length;
	// Index of symbol that should be at the end
	var endcap = (size-1) - remainder;
	var temp;
	// Swap endcap with element after it until it reaches the end
	while(endcap < (size-1))
	{
		temp = this.symbols[endcap];
		this.symbols[endcap] = this.symbols[endcap + 1];
		this.symbols[endcap + 1] = temp;
		endcap++;
	}
};

eString.prototype.scramble = function()
{
	var size = this.length();
	var all_colors = color_list.length;
	var mixed = new Array(size);

	// Don't scramble if there's only one character per color
	if( size <= all_colors)
		mixed = this.symbols;
	else
	{
		// Target index in eString; number of chars used from each
		// section; color of current character
		var target = 0, offset = 0, color = 0;
		var sections = this.splitIntoSections(size);

		for(var i = 0; i < size; i++)
		{
			color = i % all_colors;
			target = sections[color] + offset;
			mixed[i] = this.symbols[target];

			if(all_colors - 1 == color)
				offset++;
		}
	}

	this.symbols = mixed;
	this.assign_colors();
	this.fixStringEnd();		
};

eString.prototype.outputSvgsTo = function(selector)
{
	var size = this.length();
	for(var i=0; i<size; i++)
		this.symbols[i].toSvg(selector);
}
