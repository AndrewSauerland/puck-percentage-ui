
//^ Probabilities page

let date = getDate();
console.log("today = " + date);
const url = 'https://wyvn83sqsb.execute-api.us-east-2.amazonaws.com/default/dbDateQuery?date=';

window.onload = render(date);

//Build out the page contents
async function render(date) {  
  
  //Clear table
  let table = document.getElementById('prob-table');
  table.innerHTML = '';

  //Run schedule endpoint, pull games
  let scheduleData = await pullGames(url, date); 
  let entries = formatEntries(scheduleData);

  console.log(entries);


  //Loop through entries variable feeding info to a entryAdder function which adds html elements
  entries.forEach(entry => {
    let firstProb = parseFloat(Math.random().toFixed(3));
    let secondProb = 1-firstProb;
    console.log('First prob, second prob: ' + firstProb + ', ' + secondProb);
    addGameProbability(entry[1], '-100', '2.0', firstProb, entry[2], '-100', '2.0', secondProb);
  });

}

//Takes payload (returned from endpoint) and formats to account for html injection
//returns array of arrays [gameID, awayTeam, homeTeam]
function formatEntries(payload) {
  let formatted = [];
  payload.forEach(game => {
    let gameEntry = [];
    gameEntry.push(game.gameID);
    gameEntry.push(game.awayTeam);
    gameEntry.push(game.homeTeam);
    formatted.push(gameEntry);
  });
  return formatted;
}

//Get todays date, format into string to pass to endpoint
function getDate() {
  let today = new Date();
  let todayFormatted = today.getFullYear() + '-';
  if ((today.getMonth() + 1) < 10) {
    todayFormatted += '0' + (today.getMonth() + 1) + '-';
  } else {
    todayFormatted += (today.getMonth() + 1) + '-';
  }
  if (today.getDate() < 10) {
    todayFormatted += '0' + today.getDate();
  } else {
    todayFormatted += today.getDate();
  }
  return todayFormatted;
}

//URL endpoint call
async function pullGames(url, date) {
  let endpoint = url + date;
  const response = await fetch(endpoint);
  let data = await response.json();
  return data;
}

//Adds fully rendered element
function addGameProbability(team1Abbr, team1American, team1Decimal, team1PctRaw, team2Abbr, team2American, team2Decimal, team2PctRaw) {

  //Format decimal percentages to strings
  const team1Pct = (team1PctRaw * 100).toFixed(1) + '%';
  const team2Pct = (team2PctRaw * 100).toFixed(1) + '%';

  //Create HTML entry element
  entry = formatHTMLEntry(team1Abbr, team1American, team1Decimal, team1Pct, team2Abbr, team2American, team2Decimal, team2Pct);
  
  console.log("Adding entry: " + team1Abbr + " vs " + team2Abbr);
  document.querySelector('.prob-table').innerHTML += entry;

  let leftPercentage = document.getElementById(team1Abbr + 'pct');
  let rightPercentage = document.getElementById(team2Abbr + 'pct');

  //Scale percentage bar color
  if (team1PctRaw > team2PctRaw) {
    const colorIndex = calculateColor(team1PctRaw * 100);
    leftPercentage.style.backgroundColor = 'rgb(' + colorIndex + ', 255, ' + colorIndex + ')';
    rightPercentage.style.backgroundColor = 'rgb(255, ' + colorIndex + ', ' + colorIndex + ')';
  } else {
    const colorIndex = calculateColor(team2PctRaw * 100);
    rightPercentage.style.backgroundColor = 'rgb(' + colorIndex + ', 255, ' + colorIndex + ')';
    leftPercentage.style.backgroundColor = 'rgb(255, ' + colorIndex + ', ' + colorIndex + ')';
  }

  //Scale percentage bar spacing here
  const leftPixels = 885 * team1PctRaw;
  const rightPixels = 885 * team2PctRaw;
  leftPercentage.style.width = (885 * team1PctRaw) + 'px';
  rightPercentage.style.width = (885 * team2PctRaw) + 'px';

}

//Creates entry using template literals with the variables passed into to addGameProbability
function formatHTMLEntry(team1Abbr, team1American, team1Decimal, team1Pct, team2Abbr, team2American, team2Decimal, team2Pct) {
  entry = `
    <div class="prob-entry">
      <div class="prob-content">
        <div class="prob-logo-container">
          <img src="https://assets.nhle.com/logos/nhl/svg/${team1Abbr}_light.svg" class="entry-team-logo clickable">
        </div>
        <div class="prob-info-container">
          <div class="prob-info">
            <div class="prob-top-spacer"></div>
            <div class="prob-info-team clickable left">${team1Abbr}</div>
            <div class="prob-mid-spacer"></div>
            <div class="prob-odds-text left">${team1American}</div>
            <div class="prob-odds-text left">${team1Decimal}</div>
          </div>
          <div class="prob-info-analysis clickable">Game Analysis</div>
          <div class="prob-info">
            <div class="prob-top-spacer"></div>
            <div class="prob-info-team right clickable">${team2Abbr}</div>
            <div class="prob-mid-spacer"></div>
            <div class="prob-odds-text right">${team2American}</div>
            <div class="prob-odds-text right">${team2Decimal}</div>
          </div>
        </div>
        <div class="prob-logo-container">
          <img src="https://assets.nhle.com/logos/nhl/svg/${team2Abbr}_light.svg" class="entry-team-logo clickable">
        </div>
      </div>
      <div class="prob-percentage-container">
        <div class="prob-percentage-dash"></div>
        <div class="percentage-left" id="${team1Abbr}pct">
          <span class="percentage-text">${team1Pct}</span>
        </div>
        <div class="percentage-spacer"></div>
        <div class="percentage-right" id="${team2Abbr}pct">
          <span class="percentage-text">${team2Pct}</span>
        </div>
      </div>
    </div>
  `;
  return entry;
}

//Calculate scaled color index with full saturation depending on chance of winning
function calculateColor(teamPct) {
  colorIndex = ((.1 * (teamPct ** 2)) - (20 * teamPct) + 1000);
  if (colorIndex > 255) {
    colorIndex = 255;
  } else if (colorIndex < 0) {
    colorIndex = 0;
  }
  return Math.round(colorIndex);
}

// Function to set the input text
function setInputText(date) {
  const input = document.querySelector("#flatpickr");
  input.value = date;
}

//Updates for new date
function handleDateSelection(newDate) {
 console.log("DATE SELECTED: " + newDate);
 date = newDate;
 render(date);
}

//Renders date+1
function handleNextDate() {

  //Convert string date to a Date object, sets it to today + 1
  let [year, month, day] = date.split('-').map(Number);
  let dateObject = new Date(year, month-1, day);
  dateObject.setDate(dateObject.getDate() + 1);
  console.log("Adding a day to date: " + date);

  //Format back to string
  year = dateObject.getFullYear();
  month = String(dateObject.getMonth() + 1).padStart(2, '0');
  day = String(String(dateObject.getDate()).padStart(2, '0'));

  date = year + "-" + month + "-" + day;
  setInputText(date);
  console.log("Set new date: " + date);

  return `${year}-${month}-${day}`;

}

//Renders date-1
function handlePrevDate() {

  //Convert string date to a Date object, sets it to today - 1
  let [year, month, day] = date.split('-').map(Number);
  let dateObject = new Date(year, month-1, day);
  dateObject.setDate(dateObject.getDate() - 1);
  console.log("Subtracting a day from date: " + date);

  //Format back to string
  year = dateObject.getFullYear();
  month = String(dateObject.getMonth() + 1).padStart(2, '0');
  day = String(String(dateObject.getDate()).padStart(2, '0'));

  date = year + "-" + month + "-" + day;
  setInputText(date);
  console.log("Set new date: " + date);

  return `${year}-${month}-${day}`;

}

