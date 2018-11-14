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

    const flightPrefix = 'flight_';

    // load values
    chrome.storage.local.get(null, function (items) {
        $('#log').text(JSON.stringify(items));
        $('#dateFrom').val(items.dateFrom);
        $('#stayForFrom').val(items.stayForFrom);
        $('#stayForTo').val(items.stayForTo);
        $('#dateTo').val(items.dateTo);
        $('#airportFrom').val(items.airportFrom);
        $('#airportTo').val(items.airportTo);
        document.getElementById('minimalPrice').textContent = items.minimalPrice;
        $('#enableExtension').prop("checked", items.enableExtension);

        // const allowed = 'flight_';
        // console.log(items);
        // let flights = Object.keys(items).filter(key => allowed.includes(key));
        // console.log(flights);
        // alert(flights);

        let flightsArray = [];
        Object.keys(items).forEach(function(key) {
            if(key.includes('flight')) {
                let index = key.replace('flight_', '');
                flightsArray[index] = items[key];
            }
        });

        flightsArray.forEach(function (value, index) {
            let flightRaw = document.createElement("div");
            flightRaw.classList.add("flightRaw");
            let flightRawPrice = document.createElement("span");
            flightRawPrice.classList.add("price");
            flightRawPrice.textContent = value.price + '('+value.tabId+')';

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
        chrome.storage.local.clear(function() {
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
        let dateFrom = $('#dateFrom').val();
        let dateTo = $('#dateTo').val();
        let airportFrom = $('#airportFrom').val();
        let airportTo = $('#airportTo').val();
        let stayForArray = getRange(parseInt(stayForFrom), parseInt(stayForTo));
        let flightsObject = {};
        // let minimalPrice = '';
        const flightPrefix = 'flight_';

        let dates = getDates(dateFrom, dateTo);
        var i=0;
        dates.forEach(function (item) {
            stayForArray.forEach(function (stayFor) {
                // flightsObject.assign({start: item, end: calculateNextDate(item, stayFor), price: null, tabId: null });
                flightsObject[flightPrefix+i] = Object.assign({start: item, end: calculateNextDate(item, stayFor), price: null, tabId: null })
                i++;
            });
        });

        let values = {
            stayForTo: stayForTo,
            stayForFrom: stayForFrom,
            dateFrom: dateFrom,
            dateTo: dateTo,
            airportTo: airportTo,
            airportFrom: airportFrom,
            // flights: flightsJson,
            minimalPrice: null
        };

        // values.assign(flightsObject);

        const finalValues = Object.assign(values, flightsObject);

        chrome.storage.local.set(finalValues, function () {
            $('#result').html('<span>saved</span>');
            setTimeout(function () {
                $('#result').find("span").fadeOut('slow')
            }, 200);
        });
    });
});
