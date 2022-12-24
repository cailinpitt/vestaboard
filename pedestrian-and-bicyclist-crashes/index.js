const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));

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

const sendToVestaboard = async (readWriteKey, message) => {
  await axios.post('https://rw.vestaboard.com', message, {
    headers: {
      'X-Vestaboard-Read-Write-Key': readWriteKey,
    }
  });
};

const convertDigit = (stringDigit) => {
  if (stringDigit === "0") {
    return 36;
  } else {
    return Number(stringDigit) + 26;
  }
};

const main = async () => {
    const allIncidents = await fetchIncidents();
    const filteredIncidents = filterIncidents(allIncidents);
    const numIncidents = filteredIncidents.length;

    const convertedNum = convertDigit(numIncidents.toString());
    const borderColor = numIncidents === 0 ? "66" : "63";

    // https://docs.vestaboard.com/characters
    const firstLine = numIncidents !== 1 ? 
      `[${borderColor},0,0,0,0,0,20,8,5,18,5,0,23,5,18,5,0,0,0,0,0,${borderColor}]` : 
      `[${borderColor},0,0,0,0,0,20,8,5,18,5,0,23,1,19,0,0,0,0,0,0,${borderColor}]` 
    // THERE WERE : THERE WAS
    const secondLine = `[${borderColor},59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,59,${borderColor}]`
    // ////////////////////
    const thirdLine = `[${borderColor},0,${convertedNum},0,16,5,4,5,19,20,18,9,1,14,0,47,0,2,9,11,5,${borderColor}]` 
    // x PEDESTRIAN & BIKE
    const fourthLine = numIncidents !== 1 ? 
      `[${borderColor},0,3,18,1,19,8,5,19,0,9,14,0,1,20,12,1,14,20,1,0,${borderColor}]` : 
      `[${borderColor},0,0,3,18,1,19,8,0,9,14,0,1,20,12,1,14,20,1,0,0,${borderColor}]`
    // CRASHES IN ATLANTA : CRASH IN ATLANTA
    const fifthLine = `[${borderColor},0,0,0,0,15,22,5,18,0,20,8,5,0,16,1,19,20,0,0,0,${borderColor}]`
    // OVER THE PAST
    const sixthLine = `[${borderColor},0,0,20,23,5,14,20,25,44,6,15,21,18,0,8,15,21,18,19,0,${borderColor}]` 
    // TWENTY-FOUR HOURS
    
    await sendToVestaboard(
      argv.key, 
      `[${firstLine},${secondLine},${thirdLine},${fourthLine},${fifthLine},${sixthLine}]`,
    );
};

main();
