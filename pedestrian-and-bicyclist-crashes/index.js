const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const Message = require('../helpers/message.js').Message;
const { 
  blankLine,
  fillLine,
  sendToVestaboard,
} = require("../helpers/vestaboard");

/**
 * Makes a GET request to Citizen to fetch 200 recent incidents. Using 200 because I think that
 * shgould be a high enough limit to grab all incidents for a given day.
 * @returns JSON list of incidents.
 */
const fetchIncidents = async () => {
    const response = await axios.get("https://citizen.com/api/incident/trending?lowerLatitude=33.692994325504756&lowerLongitude=-84.6263932477379&upperLatitude=33.829528677581095&upperLongitude=-84.2235162487753&fullResponse=true&limit=200");

    return response.data.results;
};

/**
 * Filters Citizen incidents and returns ones involving Pedestrian and Bicyclists.
 * @param {Array} allIncidents an array of Citizen incidents
 * @returns an array of Citizen incidents mentioning Pedestrians or Bicyclists.
 */
const filterIncidents = (allIncidents) => {
    const yesterdayTimestampInMs = Date.now() - 86400000;

    // Get incidents from the last 24 hours with pedestrian or bicyclist in the top level description
    const relevantIncidents = allIncidents
        .filter(x => x.ts >= yesterdayTimestampInMs)
        .filter(x => 
            !x.raw.toLowerCase().includes("robbed") &&
            !x.raw.toLowerCase().includes("burglary") &&
            !x.title.toLowerCase().includes("robbed") &&
            !x.title.toLowerCase().includes("burglary")
        )
        .filter(x => 
            x.raw.toLowerCase().includes("pedestrian") ||
            x.raw.toLowerCase().includes("bicyclist") ||
            x.raw.toLowerCase().includes("struck by vehicle") ||
            x.raw.toLowerCase().includes("bicycle") ||
            x.raw.toLowerCase().includes("scooter") ||
            x.title.toLowerCase().includes("pedestrian") ||
            x.title.toLowerCase().includes("bicyclist") ||
            x.title.toLowerCase().includes("struck by vehicle") ||
            x.title.toLowerCase().includes("bicycle") ||
            x.title.toLowerCase().includes("scooter")
        )
        .filter(x => {
            // Specifically handle fire hydrants. 
            // Sometimes drivers will hit both a hydrant and a pedestrian: https://twitter.com/PedCrashCincy/status/1547222336377704451?s=20&t=7Ul5acOZibIxmw_m9RXxqg
            // Sometimes they'll only hit a hydrant: https://twitter.com/PedCrashCincy/status/1550121472286285824?s=20&t=7Ul5acOZibIxmw_m9RXxqg
            // We want to handle hydrants only if non-drivers are also involved, and ignore if not.
            if (x.raw.toLowerCase().includes("hydrant") || x.title.toLowerCase().includes("hydrant")) {
                if (
                    x.raw.toLowerCase().includes("pedestrian") || x.title.toLowerCase().includes("pedestrian") ||
                    x.raw.toLowerCase().includes("bicyclist") || x.title.toLowerCase().includes("bicyclist") ||
                    x.raw.toLowerCase().includes("bicycle") || x.title.toLowerCase().includes("bicycle") ||
                    x.raw.toLowerCase().includes("scooter") || x.title.toLowerCase().includes("scooter")
                ) {
                    return true
                } else {
                    return false;
                }
            }

            return true;
        });

    // Get incidents from the last 24 hours with pedestrian or bicyuclist in an update
    // It's possible an incident could have a description that doesn't involve a pedestrian
    // or bicyclist but in a 911 update Citizen later learns they were involved
    const incidentsWithRelevantUpdates = allIncidents
        .filter(x => x.ts >= yesterdayTimestampInMs)
        .filter(x => {
            for (const updateObjectKey in x.updates) {
                const updateText = x.updates[updateObjectKey].text.toLowerCase()
                if (
                    updateText.includes("robbed") ||
                    updateText.includes("burglary") ||
                    updateText.includes("breaking into")
                ) {
                    return false
                }
                else if (
                    updateText.includes("pedestrian") || 
                    updateText.includes("bicyclist") || 
                    updateText.includes("struck by vehicle") || 
                    updateText.includes("bicycle") ||
                    updateText.includes("scooter")
                ) {
                    return true
                }
            }
            return false
        });

    return Array.from(new Set([...relevantIncidents, ...incidentsWithRelevantUpdates]));
};

const main = async () => {
  const allIncidents = await fetchIncidents();
  const filteredIncidents = filterIncidents(allIncidents);
  const numIncidents = filteredIncidents.length;
  const dipColor = numIncidents === 0 ? "Green" : "PoppyRed";

  const firstLine = new Message(numIncidents === 1 ? "there was" : "there were")
    .center()
    .dipEnds(dipColor);
  const secondLine = new Message(fillLine("/"))
    .center()
    .dipEnds(dipColor);
  const thirdLine = new Message(`${numIncidents} pedestrian & bike`)
    .center()
    .dipEnds(dipColor);
  const fourthLine = new Message(numIncidents === 1 ? "crash in atlanta" : "crashes in atlanta")
    .center()
    .dipEnds(dipColor);
  const fifthLine = new Message("over the past")
    .center()
    .dipEnds(dipColor);
  const sixthLine = new Message("twenty-four hours")
    .center()
    .dipEnds(dipColor);
    
  await sendToVestaboard(
    axios,
    argv.key, 
    `[${firstLine.toString()},${secondLine.toString()},${thirdLine.toString()},${fourthLine.toString()},${fifthLine.toString()},${sixthLine.toString()}]`,
  );
};

main();
