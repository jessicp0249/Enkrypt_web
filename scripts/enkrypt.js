
// "EnKrypt!" button
var encryptInput = function()
{
	var raw = $("#user_input").val();
	var message = format_string(raw);

	if(message != '')
	{
		// Build and scramble message
		var enkrypted = new eString();
		enkrypted.buildFromText(message);
		enkrypted.scramble();
		$("#output_wrapper").html('');
		enkrypted.outputSvgsTo("#output_wrapper");

	/*
		// Build and scramble message
		var eString = scramble(messageFromString(message));
		var size = eString.length;
		$("#output_wrapper").html('');	// Clear previous output
		for(var i = 0; i < size; i++)
			symbolToSvg(eString[i], "#output_wrapper");
	*/
	}

	$("#user_input").focus();
};

$(document).ready(function() 
{
	fillSvgArray();
	svg_nodes = preloadSvgs();

	$("#clear_btn").click(function() {
		$("#user_input").html("");
	});	// end clear button click

	$(".expanded, .collapsed").click(function() {
		$(this).toggleClass("expanded");
		$(this).toggleClass("collapsed");

		$(this).siblings().toggle();
	});

	$("#enkrypt_btn").click(encryptInput);

	$(".color_options").click(function() {
		var href = "styles/" + $(this).attr("id") + ".css";
		$("#color_styles").attr("href", href);
		// Change option displayed in "selected_options"
		var mode = $(this).children("img").attr("alt");
		$("#color_mode").html(mode);
		// FIXME: close dropdown menu after click
	});	// end click for color options
	
	$(".size_options").click(function() {
		var id = $(this).attr("id");

		/*
		var width;
		if(id == "smaller")
			width = size_list[0];
		else if(id == "default_size")
			width = size_list[1];
		else if(id == "bigger")
			width = size_list[2];
		else if(id == "biggest")
			width = size_list[3];
		*/

		size_mode = size_list[id];
		$("#size_styles").html("svg { width: " + width + "px; }");
		$("#size_styles").append("svg.half { width: " + width/2 + "px; }");
		$("#size_styles").append("svg.quarter { width: " + width/4 + "px; }");
		$("#size_mode").html($("#" + id).html());
		// FIXME: close dropdown menu after click
	});	// end click for size options

});	// end ready

// FIXME: Modifiers must be on same line as the previous ESymbol