$(document).ready(function () {

    // chrome.alarms.onAlarm.addListener(onAlarm);

    $('#buttonTest').on('click', function () {


        // chrome.alarms.create('checkNewTasks', {
            // when: 1000,
            // periodInMinutes: 1
        // });

        var dateFrom = '0802';
        var dateTo = '2102';
        var from = "MOW";
        var to = "CMB";

        var action_url = "https://www.aviasales.ru/search/"+from+dateFrom+to+dateTo+"1";
        chrome.tabs.create({ url: action_url });
    });

    $('#saveSettings').on('click', function () {
        var duration = $('#durationInput').val();

        chrome.storage.local.set({duration: duration}, function() {
            $('#result').html('<span>saved</span>');
            setTimeout(function () {
                $('#result').find("span").fadeOut('slow')
            }, 200);

            // console.log('Value is set to ' + duration);
        });
    });

});

// chrome.storage.local.set({key: value}, function() {
//     console.log('Value is set to ' + value);
// });

chrome.storage.local.get(['duration'], function(result) {
    console.log('Value currently is ' + result.key);
});

// Run alarm every minute
// chrome.alarms.create('checkNewTasks', { periodInMinutes: 5 });
