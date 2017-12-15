// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      function localRequire(x) {
        return newRequire(localRequire.resolve(x));
      }

      localRequire.resolve = function (x) {
        return modules[name][1][x] || x;
      };

      var module = cache[name] = new newRequire.Module;
      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({1:[function(require,module,exports) {
"use strict";var t=function(){return function(t,e){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return function(t,e){var n=[],r=!0,i=!1,o=void 0;try{for(var a,u=t[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){i=!0,o=t}finally{try{!r&&u.return&&u.return()}finally{if(i)throw o}}return n}(t,e);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),e=function(){return fetch("/data/cities").then(function(t){return t.ok?t.json():[]})},n=function(){return fetch("/data/stations").then(function(t){return t.ok?t.json():[]})},r=function(t,e){var n=e.find(function(e){return e.city===t}).stations[0];return n?"/?city="+t+"&station="+n:"/"},i=function(){var t=new URL(window.location.href);return{city:t.searchParams.get("city"),station:t.searchParams.get("station"),temperature:t.searchParams.get("temperature"),volume:t.searchParams.get("volume")}};Mavo.Functions.changeDateTime=function(t){return t},Mavo.Functions.changeCity=function(t){if(t){var n=i().city;t!==n&&e().then(function(e){window.location.href=r(t,e)})}return t};var o=function(t){return document.querySelector(t)},a=function(e,n){return function(){return Promise.all([fetch("/metrics/temperatures?cities="+e),fetch("/metrics/debits?stations="+n)]).then(function(e){var n=t(e,2),r=n[0],i=n[1];r.ok&&i.ok&&location.reload()}).catch(function(t){})}},u=function(t){return function(){window.location.href="https://github.com/mycaule/can-we-row/issues/1"}},c=function(t,e){o("meta[property='og:url']").content="https://can-we-row.herokuapp.com/"+t+"/"+e,o("meta[property='og:description']").content="Conditions extérieures à "+v.titleCase(t)+" pour l'aviron"},s=function(t,e,n,r){var i=o("select[property='station']"),a=o("select[property='city']");n.forEach(function(e){var n=document.createElement("option");n.text=e.label,n.value=e.city,a.add(n),e.city===t&&e.stations.forEach(function(t){var e=r.find(function(e){return e.station===t}),n=document.createElement("option");n.text=e.label,n.value=e.station,i.add(n)})}),i.value=e,a.value=t},l=function(t,e){return fetch("/latest/temperatures?cities="+t).then(function(n){n.ok&&n.json().then(function(n){if(0===n.filter(function(t){return t}).length)o(".temperature").textContent="Service indisponible",a(t,e)();else{var r=n.find(function(e){return e.city===t});o(".temperature").textContent=r.meas.temperature.toFixed(1)+" °C | "+r.meas.windSpeed.toFixed(1)+" km/h",o(".temperature-time").textContent=moment.unix(r.time/1e3).locale("fr").fromNow(),o("input[property='temperature']").value=r.meas.temperature,o("input[property='icon']").value=r.icon,o("input[property='summary']").value=v.lowerCase(r.summary)+" | Humid. "+(100*r.meas.humidity).toFixed(0)+" % | Press. "+r.meas.pressure.toFixed(0)+" hPa"}})}).catch(function(t){})},f=function(t){return fetch("/latest/debits?stations="+t).then(function(e){e.ok&&e.json().then(function(e){if(0===e.filter(function(t){return t}).length)o(".water-level").textContent="Service indisponible";else{var n=e.find(function(e){return e.station===t});o(".water-level").textContent=n.meas.toFixed(1)+" m³/s",o(".water-level-time").textContent=moment.unix(n.time/1e3).locale("fr").fromNow(),o("input[property='stationLabel']").value=n.label,o("input[property='level']").value=n.meas,o("time[property='datetime']").setAttribute("datetime",moment().format("YYYY-MM-DD"))}})}).catch(function(t){})},m=i(),p=m.city,h=m.station;null===p||null===h?window.location.href="/?city=paris&station=F700000103":(o(".refresh-data").onclick=a(p,h),o(".help-station").onclick=u(h),c(p,h),e().then(function(t){n(h).then(function(e){return s(p,h,t,e)}),l(p,h),f(h)}));
},{}]},{},[1])