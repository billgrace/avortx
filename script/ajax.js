// ajax.js - utility to handle ajax data between browser and server

// global variables supporting the ajax exchange
var xmlRequestHeader = new XMLHttpRequest();
var xmlExchangeIsBusy = false;
var xmlResponseRoutine;
var xmlResponseString;
var xmlResponseData;

// // global variables supporting ajax exchanges for backgrounds
// var xmlBackgroundOutgoingObject;
// var xmlBackgroundIncomingObject;

function ajaxExchange( functionString, id, objectToGo, callbackRoutine ) {
	if( xmlExchangeIsBusy ) {
		// Handle error where an ajax exchange is requested before a previous exchange has completed
		appendMessage("Busy ajax exchange when called for function: " + functionString );
	} else {
		clearMessage();
		xmlExchangeIsBusy = true;
		var idToGo = isNaN(id) ? id : ( Math.round(id) ).toString();
		xmlResponseRoutine = callbackRoutine;
		var xmlRequestData = "function=" + functionString + "&id=" + idToGo + "&json=" + JSON.stringify( objectToGo );
		xmlRequestHeader.open( "POST", "/avortx/ajax_handler.php" );
		xmlRequestHeader.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
		xmlRequestHeader.setRequestHeader( "Cache-Control", "no-cache" );
		xmlRequestHeader.onreadystatechange = handleXmlReadyStateChanges;
		xmlRequestHeader.send( xmlRequestData );
	}
}
function handleXmlReadyStateChanges() {
	if( xmlRequestHeader.readyState == 4 ) {
		if( xmlRequestHeader.status == 200 ) {
			xmlResponseString = xmlRequestHeader.responseText;
			// the response to our ajax request has come back
			if(
				( xmlResponseString.substring( 0, 1 ) == '[' ) ||
				( xmlResponseString.substring( 0, 1 ) == '{' )
				) {
				// There's a JSON string here
				xmlResponseData = JSON.parse( xmlRequestHeader.responseText );
			} else {
				// There's just an "OK" or error message....
				// Trying to parse it would generate an error so we do nothing and let the callback routine work it out
			}
			// pass control to the callback routine that was specified with the request for this exchange
			xmlResponseRoutine();
		} else {
			// Handle error where a completed ajax exchange didn't have a "success" status code of 200
			alert( "ajax exchange completed with status: " + xmlRequestHeader.status );
		}
		// Unlock the ajax exchange process for the next request
		xmlExchangeIsBusy = false;
	}
}
