$(document).ready(function () {

    $('.datepicker').datepicker({
        autoclose: true
    });

    // set checkbox when window loaded
    chrome.storage.local.get(['enableExtension'], function (result) {
        $('#enableExtension').prop("checked", result.enableExtension);
        $("#log").text(result.enableExtension);
    });

    var $jsonData;

    // TODO: file get json airports
    var items = ['<option></option>'];
    $.getJSON("airports.json", function(data) {
        $.each( data, function( key, val ) {
            items.push( "<option id='" + key + "'>" + val.name + "</option>" );
        });
    });
    $( "<select/>", {
        "class": "my-new-list",
        html: items.join( "" )
    }).appendTo( "#airport_from" );

    // TODO: assign airports to select menu


    $('#enableExtension').on('change', function () {
        var value = $(this).is(":checked");
        chrome.storage.local.set({'enableExtension':value}, function(result) {});
    });

    // chrome.alarms.onAlarm.addListener(onAlarm);

    $('#getValue').on('click', function () {
        chrome.storage.local.get(['duration'], function(result) {
            // $('#enableExtension').val(result.key);
            $('#log').text(result.duration);
        });

    });

    $('#buttonTest').on('click', function () {
        
        // chrome.alarms.create('checkNewTasks', {
            // when: 1000,
            // periodInMinutes: 1
        // });

        var dateFrom = '0802';
        var dateTo = '2102';
        var from = "MOW";
        var to = "CMB";

        // var action_url = "https://www.aviasales.ru/search/"+from+dateFrom+to+dateTo+"1";
        // chrome.tabs.create({ url: action_url });
    });

    $('#saveSettings').on('click', function () {
        var duration = $('#durationInput').val();

        var get

        $('#log').text(duration);

        chrome.storage.local.set({duration: duration}, function() {
            $('#result').html('<span>saved</span>');
            setTimeout(function () {
                $('#result').find("span").fadeOut('slow')
            }, 200);

            // console.log('Value is set to ' + duration);
        });
    });

});

// chrome.storage.local.get(['duration'], function(result) {
//     console.log('Value currently is ' + result.key);
// });

// Run alarm every minute
// chrome.alarms.create('checkNewTasks', { periodInMinutes: 5 });
