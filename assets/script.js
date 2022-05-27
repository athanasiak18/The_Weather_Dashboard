var apiKey = "981e39b07d61fe2892bafaa16593aff8";
var thisCity = "";
var lastCity = "";


//Error Handler

var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusTest);
    }
    return response;
}