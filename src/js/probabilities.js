
//^ Probabilities page

let date;
let entries = [];

async function pageLoad() {
  console.log("Page-load function");

  //Run schedule endpoint
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
  console.log(todayFormatted);
  let scheduleEndpoint = 'http://localhost:8010/proxy/v1/schedule/' + '2023-11-09';
  console.log(scheduleEndpoint);

  const scheduleResponse = await fetch(scheduleEndpoint);
  let scheduleData = await scheduleResponse.json();

  console.log(scheduleData);

  //Get games today, including logo links, team abbreviations
  //Populate in entries variable
  scheduleData["gameWeek"][0]["games"].forEach(entry => {
    console.log(entry["awayTeam"]["abbrev"]);
    console.log(entry["homeTeam"]["abbrev"])
    entries.push([entry["awayTeam"]["abbrev"], entry["homeTeam"]["abbrev"]]);
  });
  console.log(scheduleData["gameWeek"].length);

  //Loop through entries variable feeding info to a entryAdder function which adds html elements
  entries.forEach(entry => {
    let firstProb = parseFloat(Math.random().toFixed(3));
    let secondProb = 1-firstProb;
    console.log('First prob, second prob: ' + firstProb + ', ' + secondProb);
    addGameProbability(entry[0], '-100', '2.0', firstProb, entry[1], '-100', '2.0', secondProb);
  });

}

window.onload = pageLoad;

function addGameProbability(team1Abbr, team1American, team1Decimal, team1PctRaw, team2Abbr, team2American, team2Decimal, team2PctRaw) {

  //Format decimal percentages to strings
  const team1Pct = (team1PctRaw * 100).toFixed(1) + '%';
  const team2Pct = (team2PctRaw * 100).toFixed(1) + '%';

  console.log("Adjusted percents: " + team1Pct, ", " + team2Pct);

  entry = '<div class="prob-entry"><div class="prob-content"><div class="prob-logo-container"><img src="https://assets.nhle.com/logos/nhl/svg/' + team1Abbr + '_light.svg" class="entry-team-logo clickable"></div>' +
          '<div class="prob-info-container"><div class="prob-info"><div class="prob-top-spacer"></div><div class="prob-info-team clickable left">' + team1Abbr + '</div><div class="prob-mid-spacer"></div>' +
          '<div class="prob-odds-text left">' + team1American + '</div><div class="prob-odds-text left">' + team1Decimal + '</div></div><div class="prob-info-analysis clickable">Game Analysis</div><div class="prob-info">' +
          '<div class="prob-top-spacer"></div><div class="prob-info-team right clickable">' + team2Abbr + '</div><div class="prob-mid-spacer"></div><div class="prob-odds-text right">' + team2American + '</div><div class="prob-odds-text right">' + team2Decimal + '</div>' +
          '</div></div><div class="prob-logo-container"><img src="https://assets.nhle.com/logos/nhl/svg/' + team2Abbr + '_light.svg" class="entry-team-logo clickable"></div></div>';

  //Add percentages with boxes labled TEAMONEpct TEAMTWOpct
  entry += '<div class="prob-percentage-container"><div class="prob-percentage-dash"></div><div class="percentage-left" id="' + team1Abbr + 'pct"><span class="percentage-text">' + team1Pct + '</span></div><div class="percentage-spacer"></div><div class="percentage-right" id="' + team2Abbr + 'pct"><span class="percentage-text">' + team2Pct + '</span></div></div></div>';

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
  console.log(leftPixels);
  console.log(rightPixels);
  leftPercentage.style.width = (885 * team1PctRaw) + 'px';
  rightPercentage.style.width = (885 * team2PctRaw) + 'px';

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


