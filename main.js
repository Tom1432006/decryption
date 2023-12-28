function printResult(alogrithm){
    $("#result").html(alogrithm.printResult());
}

function printResultSolving(){
    $("#result").html(substitution.printResult(true));
}

var substitution, text, ceasar, viginere;
$("#submit_button").on("click", function(){
    text = $("#text").val();
    substitution = new Substitution(text);
    printResult(substitution);
});
$("#change_button").on("click", function(){
    var from = $("#from").val().charAt(0);
    var to = $("#from").val().charAt(1);
    substitution.change(from, to);
    printResult(substitution);
});
$("#copy_button").on("click", function(){
    copy();
});
$("#import_button").on("click", function(){
    var key = $("#key").val();
    substitution.importKey(key);
    printResult(substitution);
});
$("#solve_button").on("click", function(){
    let changes_allowed = $("#changes_allowed").val();
    let depth = $("#depth_search").val();
    
    for(var i = 0; i<changes_allowed ; i++){
        printResultSolving();
        setTimeout(function(){
            substitution.solveText(1, depth);
            printResultSolving();
        }, 1);
    }

    setTimeout(function(){
        printResult(substitution);
    }, 1);
});

$("#caesar_button").on("click", function(){
    text = $("#text").val();
    ceasar = new Ceasar(text);
    printResult(ceasar);
});
$("#viginere_load_text").on("click", function(){
    var text = $("#text").val();
    viginere = new Viginere(text);
    printResult(viginere);
})
$("#viginere_set_key").on("click", function(){
    var key = $("#viginere_key").val();
    viginere.setKey(key);
    printResult(viginere);
})
$("#viginere_get_key_length").on("click", function(){
    viginere.guessLength();
    printResult(viginere);
});
$("#viginere_guess_key").on("click", function(){
    viginere.guessKey();
    printResult(viginere);
})

$("#haeufigkeitsanalyse_menu_control").on("click", function(){
    $("#haeufigkeitsanalyse_controls").addClass("selected");
    $("#haeufigkeitsanalyse_menu_control").addClass("selected");
    $("#ceasar_controls").removeClass("selected");
    $("#ceasar_menu_control").removeClass("selected");
    $("#viginere_controls").removeClass("selected");
    $("#viginere_menu_control").removeClass("selected");
});
$("#ceasar_menu_control").on("click", function(){
    $("#haeufigkeitsanalyse_controls").removeClass("selected");
    $("#haeufigkeitsanalyse_menu_control").removeClass("selected");
    $("#ceasar_controls").addClass("selected");
    $("#ceasar_menu_control").addClass("selected");
    $("#viginere_controls").removeClass("selected");
    $("#viginere_menu_control").removeClass("selected");
});
$("#viginere_menu_control").on("click", function(){
    $("#haeufigkeitsanalyse_controls").removeClass("selected");
    $("#haeufigkeitsanalyse_menu_control").removeClass("selected");
    $("#ceasar_controls").removeClass("selected");
    $("#ceasar_menu_control").removeClass("selected");
    $("#viginere_controls").addClass("selected");
    $("#viginere_menu_control").addClass("selected");
})


function copy(){
    var content = substitution.copyKey();
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(content);
        return;
    }

    navigator.clipboard.writeText(content);
}

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;
	
	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}