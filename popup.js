function getDates(startDate, stopDate) {
    let dateArray = [];
    let currentDate = moment(startDate);
    stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
}

const getRange = (start, stop) => Array.from(
    new Array((stop - start) + 1),
    (_, i) => i + start
);

function calculateNextDate(currentDate, stayFor) {
    currentDate = moment(currentDate).add(stayFor, 'days');
    return moment(currentDate).format('YYYY-MM-DD');
}

$(document).ready(function () {

    $('.datepicker').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd"
    });

    // load values
    chrome.storage.local.get(null, function (items) {
        $('#log').text(JSON.stringify(items));
        $('#dateFrom').val(items.dateFrom);
        $('#stayForFrom').val(items.stayForFrom);
        $('#stayForTo').val(items.stayForTo);
        $('#dateTo').val(items.dateTo);
        $('#airportFrom').val(items.airportFrom);
        $('#airportTo').val(items.airportTo);
        $('#enableExtension').prop("checked", items.enableExtension);

        items.flights.forEach(function (value, index) {
            let flightRaw = document.createElement("div");
            flightRaw.classList.add("flightRaw");
            let flightRawPrice = document.createElement("span");
            flightRawPrice.classList.add("price");
            flightRawPrice.textContent = value.price;

            flightRaw.textContent = value.start + " - " + value.end + " = ";
            flightRaw.appendChild(flightRawPrice);
            document.querySelector("#resultFlights").appendChild(flightRaw);
        });
    });

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
        let value = $(this).is(":checked");
        chrome.storage.local.set({'enableExtension': value}, function (result) {
        });
    });

    $('#buttonCron').on('click', function () {
        chrome.alarms.create('checkNewTasks', {
            periodInMinutes: 1
        });
    });

    $('#debugButton').on('click', function () {
        $('#log').toggle();
        $('#resultFlights').toggle();
    });

    $('#saveSettings').on('click', function () {
        let stayForFrom = $('#stayForFrom').val();
        let stayForTo = $('#stayForTo').val();
        let dateFrom = $('#dateFrom').val();
        let dateTo = $('#dateTo').val();
        let airportFrom = $('#airportFrom').val();
        let airportTo = $('#airportTo').val();
        let stayForArray = getRange(parseInt(stayForFrom), parseInt(stayForTo));
        let flightsJson = [];

        let dates = getDates(dateFrom, dateTo);
        dates.forEach(function (item) {
            stayForArray.forEach(function (stayFor) {
                flightsJson.push({start: item, end: calculateNextDate(item, stayFor), price: null, tabId: null});
            });
        });

        let values = {
            stayForTo: stayForTo,
            stayForFrom: stayForFrom,
            dateFrom: dateFrom,
            dateTo: dateTo,
            airportTo: airportTo,
            airportFrom: airportFrom,
            flights: flightsJson
        };

        chrome.storage.local.set(values, function () {
            $('#result').html('<span>saved</span>');
            setTimeout(function () {
                $('#result').find("span").fadeOut('slow')
            }, 200);
        });
    });
});
