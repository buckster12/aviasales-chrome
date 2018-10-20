// event: called when extension is installed or updated or Chrome is updated
function onInstalled() { }

function onAlarm(alarm) {
    // default set to false, to prevent of infinity of windows
    var enabled = false;

    // check if extension enabled
    chrome.storage.local.get(['enableExtension'], function (result) {
        enabled = result.enableExtension;

        if(enabled == false) {
            console.log('exension disabled');
            return false;
        }

        var betweenDates = ['01.02', '31.03'];

        var dateFrom = '0802';
        var dateTo = '2102';
        var from = "MOW";
        var to = "CMB";



        chrome.storage.local.get(['flights'], function(result) {
            var flights = result.flights;
            flights.every(function (item) {
            // flights.forEach(function (item) {
                if(item.price == null) {
                    console.log(item);
                    // var dateFrom = Date.parse();
                    // console.log('start date:'+ item.start);
                    // console.log('moment date:' + );
                    var dateFrom = moment(item.start).format("DDMM");
                    var dateTo = moment(item.end).format("DDMM");

                    var action_url = "https://www.aviasales.ru/search/"+from+dateFrom+to+dateTo+"1";
                    var creating = chrome.tabs.create({ url: action_url });

                    return 1;
                }
            });
        });





    });
}

function onError() {
    console.log('error during tab opening');
}

function onCreated() {
    console.log('tab created');
}

function onStartup() { }


// listen for extension install or update
// chrome.runtime.onInstalled.addListener(onInstalled);

// listen for Chrome starting
// chrome.runtime.onStartup.addListener(onStartup);

// listen for alarms
chrome.alarms.onAlarm.addListener(onAlarm);
