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

function toggleDifficultRoute() {
    if ($('#difficult_route').is(":checked")) {
        $('.secondFlightContainer').show();
    }
    else {
        $('.secondFlightContainer').hide();
    }
}

$(document).ready(function () {

    $('.datepicker').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd"
    });

    $('#difficult_route').on('click', toggleDifficultRoute);
    $('#difficult_route').trigger('click');

    const flightPrefix = 'flight_';

    // load values
    chrome.storage.local.get(null, function (items) {
        $('#log').text(JSON.stringify(items));
        $('#maxTabs').val(items.maxTabs);

        $('#dateFrom').val(items.dateFrom);
        $('#dateFrom').datepicker('update');

        $('#stayForFrom').val(items.stayForFrom);
        $('#stayForTo').val(items.stayForTo);
        $('#difficult_route').prop("checked", items.difficult_route);

        $('#dateTo').val(items.dateTo);
        $('#dateTo').datepicker('update');

        $('#airportFrom').val(items.airportFrom);
        $('#airportFrom2').val(items.airportFrom2);
        $('#airportTo').val(items.airportTo);
        $('#airportTo2').val(items.airportTo2);
        document.getElementById('minimalPrice').textContent = items.minimalPrice;
        $('#enableExtension').prop("checked", items.enableExtension);

        let flightsArray = [];
        Object.keys(items).forEach(function (key) {
            if (key.includes('flight')) {
                let index = key.replace('flight_', '');
                flightsArray[index] = items[key];
            }
        });

        flightsArray.forEach(function (value, index) {
            let flightRaw = document.createElement("div");
            flightRaw.classList.add("flightRaw");
            let flightRawPrice = document.createElement("span");
            flightRawPrice.classList.add("price");
            flightRawPrice.textContent = value.price + '(' + value.tabId + ')';
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

    $('#buttonClear').on('click', function () {
        chrome.storage.local.clear(function () {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            } else {
                $('#result').html('<span>CLEARED!</span>');
                setTimeout(function () {
                    $('#result').find("span").fadeOut('slow')
                }, 200);
            }
        });
    });

    $('#debugButton').on('click', function () {
        $('#log').toggle();
        $('#resultFlights').toggle();
    });

    $('#saveSettings').on('click', function () {
        let stayForFrom = $('#stayForFrom').val();
        let stayForTo = $('#stayForTo').val();
        let difficult_route = $('#difficult_route').is(":checked");
        let maxTabs = $('#maxTabs').val();
        let dateFrom = $('#dateFrom').val();
        let dateTo = $('#dateTo').val();
        let airportFrom = $('#airportFrom').val();
        let airportFrom2 = $('#airportFrom2').val();
        let airportTo = $('#airportTo').val();
        let airportTo2 = $('#airportTo2').val();
        let stayForArray = getRange(parseInt(stayForFrom), parseInt(stayForTo));
        let flightsObject = {};
        const flightPrefix = 'flight_';

        let dates = getDates(dateFrom, dateTo);
        var i = 0;
        dates.forEach(function (item) {
            stayForArray.forEach(function (stayFor) {
                flightsObject[flightPrefix + i] = Object.assign({
                    start: item,
                    end: calculateNextDate(item, stayFor),
                    price: null,
                    tabId: null
                });
                i++;
            });
        });

        let values = {
            stayForTo: stayForTo,
            stayForFrom: stayForFrom,
            dateFrom: dateFrom,
            dateTo: dateTo,
            airportTo: airportTo,
            airportTo2: airportTo2,
            airportFrom: airportFrom,
            airportFrom2: airportFrom2,
            difficult_route: difficult_route,
            maxTabs: maxTabs,
            minimalPrice: null
        };

        const finalValues = Object.assign(values, flightsObject);

        chrome.storage.local.set(finalValues, function () {
            $('#result').html('<span>saved</span>');
            setTimeout(function () {
                $('#result').find("span").fadeOut('slow')
            }, 200);
        });
    });
});
