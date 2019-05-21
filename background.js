// event: called when extension is installed or updated or Chrome is updated
function onInstalled() {
}


function parseFlight(result) {
    let flightsArray = [];
    Object.keys(result).forEach(function (key) {
        if (key.includes('flight')) {
            let index = key.replace('flight_', '');
            flightsArray[index] = result[key];
        }
    });
    return flightsArray;
}

function openNewTab(item, index, airportFrom, airportTo, airportFrom2 = null, airportTo2 = null) {
    let dateFrom = moment(item.start).format("DDMM");
    let dateTo = moment(item.end).format("DDMM");

    let action_url = '';
    if (airportFrom2 && airportTo2) {
        action_url = "https://www.aviasales.ru/search/" + airportFrom + dateFrom + airportTo + "-" + airportFrom2 + dateTo + airportTo2 + "1";
    } else {
        action_url = "https://www.aviasales.ru/search/" + airportFrom + dateFrom + airportTo + dateTo + "1";
    }

    chrome.tabs.create({url: action_url, active: false}, function (tab) {
        console.log('tab opened: ' + tab.id);
        item.tabId = tab.id;
        updateValue(index, item);
    });
    return true;
}

function onAlarm() {
    // default set to false, to prevent of infinity of windows
    var enabled = false;
    // var openedTab = false;

    // check if extension enabled
    chrome.storage.local.get(null, function (result) {
        'use strict';

        const enabled = result.enableExtension;
        const airportFrom = result.airportFrom;
        const airportTo = result.airportTo;
        const difficult_route = result.difficult_route;
        const airportFrom2 = result.airportFrom2;
        const airportTo2 = result.airportTo2;

        console.log("airportFrom2=" + airportFrom2);
        console.log("difficult_route=" + difficult_route);

        const flightPrefix = 'flight_';

        if (enabled === false) {
            console.log('plugin disabled');
            return false;
        }

        let flights = parseFlight(result);

        // open next flight's window
        let maxNewTabs = result.maxTabs;
        if (parseInt(maxNewTabs) <= 0 || typeof maxNewTabs === 'undefined') {
            maxNewTabs = 1;
        }

        flights.forEach(function (item, index) {
            'use strict';

            if (item.tabId !== null) {
                if (item.tabId === false) {
                    item.tabId = null;
                    updateValue(index, item);
                }
                return true;
            }
            if (parseInt(item.price) > 0 && item.tabId !== null) {
                // flights[index].tabId = null;
                console.log('price more than 0, but tab not null');
                item.tabId = null;
                updateValue(index, item);
                return true;
            }
            if (item.price === null) {
                if (maxNewTabs <= 0) {
                    return false;
                } else {
                    maxNewTabs--;

                    if (difficult_route === true) {
                        console.log("DIFFICULT ROUTE");
                        openNewTab(item, index, airportFrom, airportTo, airportFrom2, airportTo2);
                    } else {
                        console.log("SIMPLE ROUTE");
                        openNewTab(item, index, airportFrom, airportTo);
                    }
                }
            }
        });

        console.log('---------------------');

        // processing opened tabs & parse info
        flights.forEach(function (item, index) {
                'use strict';


                if (item.tabId !== null && item.price !== null) {
                    chrome.tabs.remove(item.tabId);
                    item.tabId = null;
                    updateValue(index, item);
                }

                // if tab isn't empty, try to get info from it and add to var 'flight'
                if (item.tabId !== null) {

                    console.log('found that not null tabId=' + item.tabId);

                    chrome.tabs.get(item.tabId, function (result) {
                        'use strict';

                        console.log('get tab info of tabId=' + item.tabId);

                        // if error with tab -- clear tab info and save
                        if (chrome.runtime.lastError) {
                            console.log('error!!! need to remove index:' + index);
                            console.log(chrome.runtime.lastError);
                            item.tabId = null;
                            updateValue(index, item);
                        }
                        else {
                            console.log('tab found, checking status=' + result.status);

                            // check if tab exists and complete already
                            // if (result.status === 'complete') {

                            chrome.tabs.executeScript(result.id, {
                                code: '(' + function () {
                                    'use strict';
                                    return {
                                        price: document.querySelector('.sorting__price-wrap .price').innerHTML,
                                        transferLong: document.querySelector('.ticket-desktop__content').querySelector(".segment-route__duration").innerHTML,
                                        stops: document.querySelector('.ticket-desktop__content').querySelectorAll(".segment-route__stop").length - 2,
                                        // transferLong: document.querySelector('.ticket-desktop__content').querySelector(".ticket-desktop__header").querySelector('.--transfer-long').innerHTML,
                                        // path: document.querySelector('.ticket__content').querySelector(".segment-route__path").innerHTML,
                                    };
                                } + ')()'
                            }, function (results) {
                                'use strict';

                                console.log('closing tab #' + item.tabId);
                                chrome.tabs.remove(item.tabId);

                                console.log('we parsed info:');
                                console.log(results);

                                // if get price
                                if (results !== null && typeof results[0] !== 'undefined') {
                                    // console.log('Min price is ' + results[0].price);

                                    // item.tabId = null;
                                    item.price = results[0].price;
                                    item.transferLong = results[0].transferLong;
                                    item.stops = results[0].stops;
                                    updateValue(index, item);

                                    // update minimalPrice
                                    chrome.storage.local.get(['minimalPrice'], function (result) {
                                        'use strict';

                                        if (results[0].price < parseInt(result.minimalPrice) || parseInt(result.minimalPrice) === 0 || result.minimalPrice === null) {
                                            chrome.storage.local.set({minimalPrice: results[0].price}, function () {
                                                'use strict';
                                                console.log('minimalPrice updated');
                                            });
                                        } else {
                                        }
                                    });

                                } else {
                                }
                            });
                        }
                    });
                }
            }
        );
    });
}

function updateValue(index, item) {
    let flightPrefix = 'flight_';
    let obj = {};
    obj[flightPrefix + index] = item;
    chrome.storage.local.set(obj);
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
