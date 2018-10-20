
function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('YYYY-MM-DD') );
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
}

const getRange = (start, stop) => Array.from(
    new Array((stop - start) + 1),
    (_, i) => i + start
);

function calculateNextDate(currentDate, stayFor) {
    var currentDate = moment(currentDate).add(stayFor, 'days');
    return moment(currentDate).format('YYYY-MM-DD');
}

$(document).ready(function () {

    $('.datepicker').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd"
    });

    // load values
    chrome.storage.local.get(null, function(items) {
        $('#log').text(JSON.stringify(items));
        $('#dateFrom').val(items.dateFrom);
        $('#stayForFrom').val(items.stayForFrom);
        $('#stayForTo').val(items.stayForTo);
        $('#dateTo').val(items.dateTo);
        $('#airportFrom').val(items.airportFrom);
        $('#airportTo').val(items.airportTo);
        $('#enableExtension').prop("checked", items.enableExtension);

        items.flights.forEach(function (value, index) {
            var flightRaw = document.createElement("div");
            flightRaw.classList.add("flightRaw");
            var flightRawPrice = document.createElement("span");
            flightRawPrice.classList.add("price");
            flightRawPrice.textContent = value.price;

            flightRaw.textContent = value.start +" - "+ value.end + " = ";
            // flightRaw.appendChild(flightRaw);
            flightRaw.appendChild(flightRawPrice);
            document.querySelector("#resultFlights").appendChild(flightRaw);
        });
    });

    var $jsonData;

    // TODO: file get json airports
    // var items = ['<option></option>'];
    // $.getJSON("airports.json", function(data) {
    //     $.each( data, function( key, val ) {
    //         items.push( "<option id='" + key + "'>" + val.name + "</option>" );
    //     });
    // });
    // $( "<select/>", {
    //     "class": "my-new-list",
    //     html: items.join( "" )
    // }).appendTo( "#airport_from" );

    $('#enableExtension').on('change', function () {
        var value = $(this).is(":checked");
        chrome.storage.local.set({'enableExtension':value}, function(result) {});
    });

    $('#buttonTest').on('click', function () {
        
        // chrome.alarms.create('checkNewTasks', {
            // when: 1000,
            // periodInMinutes: 1
        // });


    });

    $('#debugButton').on('click', function () {
        $('#log').toggle();
        $('#resultFlights').toggle();
    });

    $('#saveSettings').on('click', function () {
        var stayForFrom = $('#stayForFrom').val();
        var stayForTo = $('#stayForTo').val();
        var dateFrom = $('#dateFrom').val();
        var dateTo = $('#dateTo').val();
        var airportFrom = $('#airportFrom').val();
        var airportTo = $('#airportTo').val();

        var dates = getDates(dateFrom, dateTo);
        var datesJson = JSON.stringify(dates);

        var stayForArray = getRange(parseInt(stayForFrom), parseInt(stayForTo) );

        var flightsJson = [];
        dates.forEach(function (item, index) {
            stayForArray.forEach(function (stayFor, index) {
                flightsJson.push({start: item, end: calculateNextDate(item,stayFor), price: null, tabId: null});
            });
        });

        values = {
            stayForTo: stayForTo,
            stayForFrom: stayForFrom,
            dateFrom: dateFrom,
            dateTo: dateTo,
            airportTo: airportTo,
            airportFrom: airportFrom,
            flights: flightsJson
        };

        chrome.storage.local.set(values, function() {
            $('#result').html('<span>saved</span>');
            setTimeout(function () {
                $('#result').find("span").fadeOut('slow')
            }, 200);
        });
    });

});

// Run alarm every minute
// chrome.alarms.create('checkNewTasks', { periodInMinutes: 5 });
