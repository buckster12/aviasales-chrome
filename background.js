// event: called when extension is installed or updated or Chrome is updated
function onInstalled() { }

function onAlarm(alarm) {
    // console.log('alarm');
    console.log(alarm);

    // switch (alarm.name) {
    //     case 'updatePhotos':
    //         break;
    //
    //     default:
    //         break;
    // }

    var betweenDates = ['01.02', '31.03'];


    var dateFrom = '0802';
    var dateTo = '2102';
    var from = "MOW";
    var to = "CMB";

    var action_url = "https://www.aviasales.ru/search/"+from+dateFrom+to+dateTo+"1";
    chrome.tabs.create({ url: action_url });
}


// event: called when Chrome first starts
function onStartup() {
    // CREATE ALARMS HERE
// ...
}


// listen for extension install or update
chrome.runtime.onInstalled.addListener(onInstalled);

// listen for Chrome starting
chrome.runtime.onStartup.addListener(onStartup);

// listen for alarms
chrome.alarms.onAlarm.addListener(onAlarm);
