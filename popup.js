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

let bkg = chrome.extension.getBackgroundPage();

function createURL(item, value) {
    if (typeof value.price === 'undefined' || value.price === null || parseInt(value.price) === 0) {
        return null;
    }

    chrome.extension.getBackgroundPage().console.log(value);

    let dateFrom = moment(value.start);
    let dateFromFormatted = dateFrom.format("DDMM");

    let dateTo = moment(value.end);
    let dateToFormatted = dateTo.format("DDMM");


    let action_url = '';
    if (item.airportFrom2 && item.airportTo2) {
        action_url = "https://www.aviasales.ru/search/" + item.airportFrom + dateFromFormatted + item.airportTo + "-" + item.airportFrom2 + dateToFormatted + item.airportTo2 + "1";
    } else {
        action_url = "https://www.aviasales.ru/search/" + item.airportFrom + dateFromFormatted + item.airportTo + dateToFormatted + "1";
    }
    // ref link
    action_url += "?marker=131525&language=ru";

    return action_url;
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

    let difficult_route_element = $('#difficult_route');
    let dateFromElement = $('#dateFrom');
    let dateToElement = $('#dateTo');

    $('.datepicker').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd"
    });

    difficult_route_element.on('click', toggleDifficultRoute);
    difficult_route_element.trigger('click');

    // const flightPrefix = 'flight_';

    // load values
    chrome.storage.local.get(null, function (items) {
        $('#log').text(JSON.stringify(items));
        $('#maxTabs').val(items.maxTabs);

        dateFromElement.val(items.dateFrom);
        dateFromElement.datepicker('update');

        $('#stayForFrom').val(items.stayForFrom);
        $('#stayForTo').val(items.stayForTo);
        $('#difficult_route').prop("checked", items.difficult_route);

        dateToElement.val(items.dateTo);
        dateToElement.datepicker('update');

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

        flightsArray.forEach(function (value) {
            let flightRaw = document.createElement("div");
            flightRaw.classList.add("flightRaw");
            let flightRawPrice = document.createElement("span");
            flightRawPrice.classList.add("price");

            flightRawPrice.textContent = value.price;

            if (value.price === items.minimalPrice) {
                flightRawPrice.classList.add("minimalValue");
            }

            // время в пути
            if (value.transferLong === null || typeof value.transferLong === "undefined") {
            } else {
                flightRawPrice.textContent += '(' + value.transferLong + ')';
            }

            // пересадки
            if (value.stops && typeof value.stops !== 'undefined') {
                flightRawPrice.textContent += ' Changes: ' + value.stops;
            }

            flightRawPrice.textContent += " ";

            let link = document.createElement("a");
            let hrefURL = createURL(items, value);
            if (hrefURL) {
                link.href = hrefURL;
                link.target = "_blank";
                link.textContent = "[URL]";
                flightRawPrice.appendChild(link);
            }

            // flightRawPrice.textContent = value.price + '(' + value.tabId + ')';
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
            const error = chrome.runtime.lastError;
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
        let i = 0;
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
