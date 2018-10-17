// event: called when extension is installed or updated or Chrome is updated
function onInstalled() {
    // CREATE ALARMS HERE
// ...
}

// event: called when Chrome first starts
function onStartup() {
    // CREATE ALARMS HERE
// ...
}

// event: alarm raised
function onAlarm(alarm) {

    console.log('FIRE FIRE FIRE');

    switch (alarm.name) {
        case 'updatePhotos':
            // get the latest for the live photo streams
            // photoSources.processDaily();
            break;
        // ...
        default:
            break;
    }
}

// listen for extension install or update
chrome.runtime.onInstalled.addListener(onInstalled);

// listen for Chrome starting
chrome.runtime.onStartup.addListener(onStartup);

// listen for alarms
chrome.alarms.onAlarm.addListener(onAlarm);
