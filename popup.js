$(document).ready(function () {

    chrome.alarms.onAlarm.addListener(onAlarm);

    function onAlarm() {
        var dateFrom = '0802';
        var dateTo = '2102';
        var from = "MOW";
        var to = "CMB";

        var action_url = "https://www.aviasales.ru/search/"+from+dateFrom+to+dateTo+"1";
        chrome.tabs.create({ url: action_url });
    }

    $('#buttonTest').on('click', function () {

        // chrome.tabs.create('sdfdsf');

        var dateFrom = '0802';
        var dateTo = '2102';
        var from = "MOW";
        var to = "CMB";

        var action_url = "https://www.aviasales.ru/search/"+from+dateFrom+to+dateTo+"1";
        chrome.tabs.create({ url: action_url });

        // var openedWindow = window.open('https://www.aviasales.ru/search/MOW0802CMB19021', '_blank');
        // if (openedWindow) {
        //     Browser has allowed it to be opened
            // openedWindow.focus();
        // } else {
        //     Browser has blocked it
            // alert('Please allow popups for this website');
        // }

    });

});

// function checkNewTasks() {
//     'use strict';
//     console.log('started');
//     var action_url = "https://www.aviasales.ru/search/"+from+dateFrom+to+dateTo+"1";
//     chrome.tabs.create({ url: action_url });
// }

chrome.alarms.create('checkNewTasks', {
    // when: 1000,
    periodInMinutes: 1
});