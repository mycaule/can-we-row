'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* global moment, Mavo, v */

var getCitiesRef = function getCitiesRef() {
  return fetch('/data/cities').then(function (res) {
    if (res.ok) {
      return res.json();
    }
    return [];
  });
};

var getStationsRef = function getStationsRef() {
  return fetch('/data/stations').then(function (res) {
    if (res.ok) {
      return res.json();
    }
    return [];
  });
};

var linkTo = function linkTo(city, citiesRef) {
  var station = citiesRef.find(function (elt) {
    return elt.city === city;
  }).stations[0];
  return station ? '/?city=' + city + '&station=' + station : '/';
};

var searchParams = function searchParams() {
  var url = new URL(window.location.href);
  return {
    city: url.searchParams.get('city'),
    station: url.searchParams.get('station'),
    temperature: url.searchParams.get('temperature'),
    volume: url.searchParams.get('volume')
  };
};

Mavo.Functions.changeDateTime = function (newDateTime) {
  if (newDateTime) {
    console.log('--changeDateTime');
    console.log(newDateTime);
  }
  return newDateTime;
};

Mavo.Functions.changeCity = function (newCity) {
  if (newCity) {
    console.log('--changeCity');

    var _searchParams = searchParams(),
        _city = _searchParams.city;

    if (newCity !== _city) {
      getCitiesRef().then(function (cities) {
        window.location.href = linkTo(newCity, cities);
      });
    }
  }

  return newCity;
};

var $ = function $(s) {
  return document.querySelector(s);
};

var reloadMetrics = function reloadMetrics(city, station) {
  return function () {
    return Promise.all([fetch('/metrics/temperatures?cities=' + city), fetch('/metrics/debits?stations=' + station)]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          res1 = _ref2[0],
          res2 = _ref2[1];

      if (res1.ok && res2.ok) {
        location.reload();

        // FIX Mavo.Expressions.update()
      }
    }).catch(function (err) {
      console.log(err);
    });
  };
};

var provideHelp = function provideHelp(station) {
  return function () {
    console.log(station);
    window.location.href = 'https://github.com/mycaule/can-we-row/issues/1';
  };
};

var setOpenGraphHeaders = function setOpenGraphHeaders(city, station) {
  $('meta[property=\'og:url\']').content = 'https://can-we-row.herokuapp.com/' + city + '/' + station;
  $('meta[property=\'og:description\']').content = 'Conditions ext\xE9rieures \xE0 ' + v.titleCase(city) + ' pour l\'aviron';
};

var initHTMLFields = function initHTMLFields(city, station, citiesRef, stationsRef) {
  var stations = $('select[property=\'station\']');
  var cities = $('select[property=\'city\']');

  citiesRef.forEach(function (elt) {
    var opt1 = document.createElement('option');
    opt1.text = elt.label;
    opt1.value = elt.city;
    cities.add(opt1);

    if (elt.city === city) {
      elt.stations.forEach(function (sta) {
        var match = stationsRef.find(function (elt) {
          return elt.station === sta;
        });
        var opt2 = document.createElement('option');
        opt2.text = match.label;
        opt2.value = match.station;
        stations.add(opt2);
      });
    }
  });

  stations.value = station;
  cities.value = city;
};

var fillWeatherReport = function fillWeatherReport(city, station) {
  return fetch('/latest/temperatures?cities=' + city).then(function (res) {
    if (res.ok) {
      res.json().then(function (data) {
        if (data.filter(function (n) {
          return n;
        }).length === 0) {
          $('.temperature').textContent = 'Service indisponible';
          reloadMetrics(city, station)();
        } else {
          var curr = data.find(function (elt) {
            return elt.city === city;
          });
          $('.temperature').textContent = curr.meas.temperature.toFixed(1) + ' \xB0C | ' + curr.meas.windSpeed.toFixed(1) + ' km/h';

          $('.temperature-time').textContent = moment.unix(curr.time / 1000).locale('fr').fromNow();

          $('input[property=\'temperature\']').value = curr.meas.temperature;
          $('input[property=\'icon\']').value = curr.icon;
          $('input[property=\'summary\']').value = v.lowerCase(curr.summary) + ' | Humid. ' + (curr.meas.humidity * 100).toFixed(0) + ' % | Press. ' + curr.meas.pressure.toFixed(0) + ' hPa';
          console.log(curr);
        }
      });
    }
  }).catch(function (err) {
    console.log(err);
  });
};

var fillWaterReport = function fillWaterReport(station) {
  return fetch('/latest/debits?stations=' + station).then(function (res) {
    if (res.ok) {
      res.json().then(function (data) {
        if (data.filter(function (n) {
          return n;
        }).length === 0) {
          $('.water-level').textContent = 'Service indisponible';
        } else {
          var curr = data.find(function (elt) {
            return elt.station === station;
          });
          $('.water-level').textContent = curr.meas.toFixed(1) + ' m\xB3/s';
          $('.water-level-time').textContent = moment.unix(curr.time / 1000).locale('fr').fromNow();
          $('input[property=\'stationLabel\']').value = curr.label;
          $('input[property=\'level\']').value = curr.meas;
          $('time[property=\'datetime\']').setAttribute('datetime', moment().format('YYYY-MM-DD'));
          console.log(curr);
        }
      });
    }
  }).catch(function (err) {
    console.log(err);
  });
};

var _searchParams2 = searchParams(),
    city = _searchParams2.city,
    station = _searchParams2.station;

if (city === null || station === null) {
  window.location.href = '/?city=paris&station=F700000103';
} else {
  $('.refresh-data').onclick = reloadMetrics(city, station);
  $('.help-station').onclick = provideHelp(station);

  setOpenGraphHeaders(city, station);

  getCitiesRef().then(function (cities) {
    getStationsRef(station).then(function (stations) {
      return initHTMLFields(city, station, cities, stations);
    });
    fillWeatherReport(city, station);
    fillWaterReport(station);
  });
}

