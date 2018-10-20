// event: called when extension is installed or updated or Chrome is updated
function onInstalled() { }

function onAlarm(alarm) {
    // default set to false, to prevent of infinity of windows
    var enabled = false;

    // check if extension enabled
    chrome.storage.local.get(['enableExtension','airportTo', 'airportFrom'], function (result) {
        enabled = result.enableExtension;
        var airportFrom = result.airportFrom;
        var airportTo = result.airportTo;

        if(enabled == false) {
            console.log('exension disabled');
            return false;
        }

        chrome.storage.local.get(['flights'], function(result) {
            var flights = result.flights;

            flights.every(function (item, index) {
                console.log('index: '+index);

                // check opened tabs
                if(item.tabId && item.tabId != null) {
                    chrome.tabs.get(item.tabId, function (result) {
                        if (chrome.runtime.lastError) {
                            // console.log('MY_ERROR: '+chrome.runtime.lastError.message);
                        } else {
                            // check if tab exists and complete already
                            if (result.status === 'complete') {
                                chrome.tabs.executeScript(result.id, {
                                    code: '(' + function () {
                                        return {
                                            price: document.querySelector('.sorting__price-wrap .price').innerHTML,
                                        };
                                    } + ')()'
                                }, function (results) {
                                    // if get price
                                    if(results != null && typeof results[0] !== 'undefined') {
                                        console.log('Min price is '+results[0].price);

                                        var updateValue = flights[index];
                                        updateValue.price = parseInt(results[0].price);
                                        updateValue.tabId = null;
                                        chrome.storage.local.set(updateValue, function (result) {
                                            console.log('price and tabId updated');
                                        });
                                    }

                                    // close tab and update tabId to null
                                    chrome.tabs.remove(item.tabId);
                                    // var updateValue = flights[index];
                                    // updateValue.tabId = null;
                                    // chrome.storage.local.set(updateValue);
                                });
                            }
                        }
                    });
                }

                // find un-checked flight
                if(item.price == null) {
                    console.log(item);

                    var dateFrom = moment(item.start).format("DDMM");
                    var dateTo = moment(item.end).format("DDMM");

                    var action_url = "https://www.aviasales.ru/search/"+airportFrom+dateFrom+airportTo+dateTo+"1";
                    chrome.tabs.create({ url: action_url, active: false }, function (tab) {
                        // console.log(tab);

                        // flights[index].price = 500;
                        flights[index].tabId = tab.id;
                        // console.log(flights);

                        chrome.storage.local.set({flights: flights}, function(result) {});
                        return false;
                    });
                } else {
                    // send true to continue every()
                    return true;
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
