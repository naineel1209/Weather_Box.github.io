//input and search
const input = document.querySelector('#city');
const search = document.querySelector('#search');

//icons to be set acc to value
const iconImage = document.querySelector('.weather_details img');

//resource url
const imgBaseUrl = 'resources/icons/';

//date
const date = document.getElementById("date");

//Min Temp & Max Temp
const minTemp = document.getElementById("minTemp");
const minNotation = document.getElementById("minNotation");

const maxTemp = document.getElementById("maxTemp");
const maxNotation = document.getElementById("maxNotation");

//Table to be updated with nextDays Content
const table = document.querySelector('.table');

//Day Texts and Night Texts
const dayText = document.querySelector('#dayText');
const nightText = document.querySelector('#nightText');

//error and loading screen
const error = document.querySelector('.error');

//resetting the values
input.value = localStorage.getItem('city') || "";
date.innerHTML = new Date().toUTCString();


//apikeys and location URLs and forecast URL
const apiKey = "1ovFKJj1C7SLwrZpYjieosvGaw861swn";
const locationKeyUrl = `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${apiKey}&q=^^`;
const forecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/^^?apikey=${apiKey}&metric=true`

//Input Enter and Search Click
input.addEventListener('keydown', async function (e) {
    try {
        if (e.key === "Enter") {
            getMeBlur("LOADING.....");
            await handleCity(input.value);
            removeBlur();
        }
    } catch (e) {
        error.innerHTML = "Error: " + e.message;
        setTimeout(removeBlur, 2000);
    }
});

search.addEventListener('click', async function (e) {
    try {
        if (input.value.length > 2) {
            getMeBlur("Loading....");
            await handleCity(input.value);
            removeBlur();
        }
    } catch (e) {
        error.innerHTML = "Error: " + e.message;
        setTimeout(removeBlur, 2000);
    }
})

//handleCity function and currentDay and nextDay and getMeBlur and removeBlur
async function handleCity(val) {
    if (val !== localStorage.getItem('city')) {
        localStorage.setItem('city', val);
    }

    let locUrl = locationKeyUrl.replace("^^", val);

    const locationKey = await axios.get(locUrl).then(res => res.data["0"]["Key"])
        .catch(e => { console.log('err') });
    let foreUrl = forecastUrl.replace("^^", locationKey);

    const response = await axios.get(foreUrl).then(res => res.data);

    //handle the editing of the current day with Highlights and 0 of the Daily Forecast
    currentDay(response.Headline, response.DailyForecasts[0]);

    //making the next days daily forecasts
    const nextForecasts = response.DailyForecasts.map((ele, i) => {
        if (i === 0) {
            return;
        }

        return ele;
    });

    nextForecasts.shift();

    nextDay(nextForecasts);
}

function currentDay(headline, currentDay) {

    //1. Handling the Weather Icon -> source
    //https://developer.accuweather.com/weather-icons
    iconImage.src = `${imgBaseUrl}/${currentDay["Day"]["Icon"]}.svg`

    //2. Handling the date of the current place
    date.innerHTML = new Date(currentDay.Date).toUTCString();

    //3. Handling the tempreature of the current place
    minTemp.innerHTML = currentDay["Temperature"]["Minimum"]["Value"];
    minNotation.innerHTML = currentDay["Temperature"]["Minimum"]["Unit"];
    maxTemp.innerHTML = currentDay["Temperature"]["Maximum"]["Value"];
    minNotation.innerHTML = currentDay["Temperature"]["Maximum"]["Unit"];

    //4. Handling the highlights text
    dayText.innerHTML = currentDay["Day"]["IconPhrase"];
    nightText.innerHTML = currentDay["Night"]["IconPhrase"];
}

function nextDay(forecasts) {
    //clearing after THEAD before appending the new data
    const TBODY = document.querySelector('#tbody');
    TBODY.innerHTML = "";

    forecasts.forEach(cast => {
        const tr = document.createElement("tr");

        //Table -- Date --
        const tdDate = document.createElement("td");
        tdDate.innerHTML = new Date(cast["Date"]).toLocaleDateString();
        tr.appendChild(tdDate);

        //Highlights
        const tdHigh = document.createElement("td");
        tdHigh.innerHTML = cast["Day"]["IconPhrase"];
        tr.appendChild(tdHigh);

        //Min Tempreature
        const tdMin = document.createElement("td");
        tdMin.innerHTML = cast["Temperature"]["Minimum"]["Value"] + " ° " + cast["Temperature"]["Minimum"]["Unit"];
        tr.appendChild(tdMin);

        //Max Tempreature
        const tdMax = document.createElement("td");
        tdMax.innerHTML = cast["Temperature"]["Maximum"]["Value"] + " ° " + cast["Temperature"]["Maximum"]["Unit"];
        tr.appendChild(tdMax);


        //append the TR to the tableDOM
        TBODY.append(tr);
    });
}

function getMeBlur(str) {
    error.style.display = 'flex';
    error.innerHTML = str;
    const elements = document.querySelectorAll('body > *:not(.error)');

    elements.forEach(el => {
        el.style.filter = 'blur(2px)';
    });
}

function removeBlur() {
    error.style.display = 'none';
    const elements = document.querySelectorAll('body > *:not(.error)');

    elements.forEach(el => {
        el.style.filter = 'none';
    });

}

//use local storage to store the city info
const value = localStorage.getItem('city');

if (!value) {
    localStorage.setItem('city', "Ahmedabad");
}

handleCity(value);