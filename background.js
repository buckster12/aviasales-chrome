// event: called when extension is installed or updated or Chrome is updated
function onInstalled() {
}


function openNewTab(item, index, flights, airportFrom, airportTo) {
    console.log("call openNewTab()");
    var dateFrom = moment(item.start).format("DDMM");
    var dateTo = moment(item.end).format("DDMM");

    var action_url = "https://www.aviasales.ru/search/" + airportFrom + dateFrom + airportTo + dateTo + "1";
    chrome.tabs.create({url: action_url, active: false}, function (tab) {
        console.log('tab opened: ' + tab.id);
        flights[index].tabId = tab.id;
        chrome.storage.local.set({flights: flights}, function (result) {
            console.log('tab updated in db');
        });
        return false;
    });
    return true;
}

function onAlarm(alarm) {
    // default set to false, to prevent of infinity of windows
    var enabled = false;
    var openedTab = false;

    // check if extension enabled
    chrome.storage.local.get(['enableExtension', 'airportTo', 'airportFrom'], function (result) {
        enabled = result.enableExtension;
        var airportFrom = result.airportFrom;
        var airportTo = result.airportTo;

        if (enabled == false) {
            console.log('exension disabled');
            return false;
        }

        chrome.storage.local.get(['flights'], function (result) {
            var flights = result.flights;

            // open next flight's window
            flights.every(function (item, index) {
                if(item.tabId !== null) {
                    return true;
                }
                if (parseInt(item.price) > 0) {
                    return true;
                }
                if (item.price == null) {
                    openNewTab(item, index, flights, airportFrom, airportTo);
                }
                return false;
            });

            // process old flight and get price
            flights.every(function (item, index) {
                if (item.tabId === null) {
                    return true;
                }
                // check opened tabs
                if (item.tabId && item.tabId != null) {
                    var currentTabId = item.tabId;

                    chrome.tabs.get(item.tabId, function (result) {
                        if (chrome.runtime.lastError) {
                            // clear tabId and continue
                            console.log('cannot get info about tab');
                            flights[index].tabId = null;
                            chrome.storage.local.set({flights: flights}, function () {
                                openNewTab(item, index, flights, airportFrom, airportTo);
                                openedTab = true;
                            });
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
                                    chrome.tabs.remove(currentTabId);
                                    console.log('close the tab id=' + currentTabId);

                                    // if get price
                                    if (results != null && typeof results[0] !== 'undefined') {
                                        console.log('Min price is ' + results[0].price);

                                        flights[index].tabId = null;
                                        flights[index].price = parseInt(results[0].price);
                                        chrome.storage.local.set({flights: flights}, function (result) {
                                            console.log('price and tabId updated');
                                        });

                                        // here we should open new tab!!!
                                        // BUT FOR NEXT!!!!!
                                        // openNewTab(item, index, flights, airportFrom, airportTo);

                                    } else {
                                        // console.log('cannot get price');
                                    }
                                });
                            }
                        }
                    });
                    // console.log("HERE WE UPDATED PRICE, but cannot open new tab");
                    // console.log('is tab opened: ' + openedTab);
                    // if(openNewTab === false) {
                    //     return false;
                    // }
                    return false;
                    // return true;
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

function onStartup() {
}


// listen for extension install or update
// chrome.runtime.onInstalled.addListener(onInstalled);

// listen for Chrome starting
// chrome.runtime.onStartup.addListener(onStartup);

// listen for alarms
chrome.alarms.onAlarm.addListener(onAlarm);
