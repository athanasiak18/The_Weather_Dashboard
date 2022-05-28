var myAPI = "c83f688a772596959b4e8bfb3bbbe2d7";
var currentCity = "";
var lastCity = "";
var currentDate = moment().format('MMMM Do YYYY, h:mm a');
$("#currentDay").html(currentDate);

// Error handler
var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// Function to show the current conditions
var getCurrentConditions = (event) => {

// Show city name
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();

    
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {

// Save to local storage
        saveCity(city);
        $('#search-error').text("");

// Weather icons
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

// UTC timezone
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

// Cities list
        renderCities();

// Show five day forecast
        getFiveDayForecast(event);

// Change header to city name
        $('#header-text').text(response.name);

// HTML results
let currentWeatherHTML = `
<h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
<ul class="list-unstyled">
    <li>Temperature: ${response.main.temp}&#8457;</li>
    <li>Humidity: ${response.main.humidity}%</li>
    <li>Wind Speed: ${response.wind.speed} mph</li>
    <li id="uvIndex">UV Index:</li>
</ul>`;

// Append results to the DOM
$('#current-weather').html(currentWeatherHTML);

// Latitude and longitude for UV search
let latitude = response.coord.lat;
let longitude = response.coord.lon;
let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "current.uvi=" + "&APPID=" + myAPI;
uvQueryURL = uvQueryURL;

        
fetch(uvQueryURL)
.then(handleErrors)
.then((response) => {
    return response.json();
})
.then((response) => {
    let uvIndex = response.value;
    $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
    if (uvIndex>=0 && uvIndex<3){
        $('#uvVal').attr("class", "uv-favorable");
    } else if (uvIndex>=3 && uvIndex<8){
        $('#uvVal').attr("class", "uv-moderate");
    } else if (uvIndex>=8){
        $('#uvVal').attr("class", "uv-severe");
    }
});
})
}

// Display HTML for five day forecast
var getFiveDayForecast = (event) => {
    let city = $('#search-city').val();

// Forecast search
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + myAPI;

    fetch(queryURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {

        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;

        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            
            // Showing forecasts
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }

     `</div>`;


        fiveDayForecastHTML += `</div>`;

        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

//Save city to local storage
var saveCity = (newCity) => {
    let cityExists = false;

    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    // Save to the local storage if the city is new
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

//Show list of searched cities
var renderCities = () => {
    $('#city-results').empty();

// If the local storage is empty
if (localStorage.length===0){
    if (lastCity){
        $('#search-city').attr("value", lastCity);
    } else {
        $('#search-city').attr("value", "Paris");
    }
} else {

 // Show last city
 let lastCityKey="cities"+(localStorage.length-1);
 lastCity=localStorage.getItem(lastCityKey);

 // Set search input to last city searched
 $('#search-city').attr("value", lastCity);


// Append cities to the page
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;

            // Set to lastCity if currentCity not set
            if (currentCity===""){
                currentCity=lastCity;
            }

            // Set button class to active for currentCity
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            
            // Append city to page
            $('#city-results').prepend(cityEl);
        }

            // Clear button
        if (localStorage.length>0){
            $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        } else {
            $('#clear-storage').html('');
        }
    }
    
}

// City search button
$('#search-button').on("click", (event) => {
    event.preventDefault();
    presentCity = $('#search-city').val();
    getCurrentConditions(event);
    });

// Previous searched cities button
$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    presentCity=$('#search-city').val();
    getCurrentConditions(event);
});

// Clear old searched cities from localStorage
$("#clear-storage").on("click", (event) => {
    localStorage.clear();
    renderCities();
});

// Render searched cities
renderCities();

// Get the current conditions
getCurrentConditions();