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
const e=echarts.init(document.getElementById("graph3")),t=()=>fetch("/data/cities").then(e=>e.ok?e.json():[]),o=()=>fetch("/data/stations").then(e=>e.ok?e.json():[]),r=(e,t)=>{const o=t.find(t=>t.city===e).stations[0];return o?`/?city=${e}&station=${o}`:"/"},n=()=>{const e=new URL(window.location.href);return{city:e.searchParams.get("city"),station:e.searchParams.get("station"),temperature:e.searchParams.get("temperature"),volume:e.searchParams.get("volume")}};document.addEventListener("mv-change",e=>{if("propertychange"===e.action&&(e.property,"city"===e.property)){const{city:o}=n();e.value!==o&&t().then(t=>{window.location.href=r(e.value,t)})}});const a=e=>document.querySelector(e),i=(e,t)=>()=>Promise.all([fetch(`/metrics/temperatures?cities=${e}`),fetch(`/metrics/debits?stations=${t}`)]).then(([e,t])=>{e.ok&&t.ok&&location.reload()}).catch(e=>{}),s=e=>()=>{window.location.href="https://github.com/mycaule/can-we-row/issues/1"},c=(e,t)=>{a("meta[property='og:url']").content=`https://can-we-row.herokuapp.com/${e}/${t}`,a("meta[property='og:description']").content=`Conditions extérieures à ${v.titleCase(e)} pour l'aviron`},l=(e,t,o,r)=>{const n=a("select[property='station']"),i=a("select[property='city']");o.forEach(t=>{const o=document.createElement("option");o.text=t.label,o.value=t.city,i.add(o),t.city===e&&t.stations.forEach(e=>{const t=r.find(t=>t.station===e),o=document.createElement("option");o.text=t.label,o.value=t.station,n.add(o)})}),n.value=t,i.value=e},m=(e,t)=>fetch(`/latest/temperatures?cities=${e}`).then(o=>{o.ok&&o.json().then(o=>{if(0===o.filter(e=>e).length)a(".temperature").textContent="Service indisponible",i(e,t)();else{const t=o.find(t=>t.city===e);a(".temperature").textContent=`${t.meas.temperature.toFixed(1)} °C | ${t.meas.windSpeed.toFixed(1)} km/h`,a(".temperature-time").textContent=moment.unix(t.time/1e3).locale("fr").fromNow(),a("meta[property='temperature']").content=t.meas.temperature,a("meta[property='icon']").content=t.icon,a("meta[property='summary']").content=`${v.lowerCase(t.summary)} | Humid. ${(100*t.meas.humidity).toFixed(0)} % | Press. ${t.meas.pressure.toFixed(0)} hPa`}})}).catch(e=>{}),d=e=>{const t=moment.unix(e[0].time/1e3).format("YYYY-MM-DD"),o=moment.unix(e.slice(-1)[0].time/1e3).format("YYYY-MM-DD");return[e.reduce((e,t)=>{const o=moment.unix(t.time/1e3);return e.push([o.format("YYYY-MM-DD"),t.meas]),e},[]),t,o]},p=(t,o)=>{const[r,n,a]=d(t),i={backgroundColor:"#404a59",title:{top:30,text:"Données du mois dernier",subtext:"Source: vigicrues.com",left:"center",textStyle:{color:"#fff"}},tooltip:{trigger:"item"},legend:{top:"30",left:"100",data:["Danger"],textStyle:{color:"#fff"}},calendar:[{top:100,left:"center",range:[moment(n).startOf("month").format("2017-MM-DD"),moment(a).endOf("month").format("2017-MM-DD")],splitLine:{show:!0,lineStyle:{color:"#000",width:4,type:"solid"}},yearLabel:{formatter:"{start}",textStyle:{color:"#fff"}},itemStyle:{normal:{color:"#323c48",borderWidth:1,borderColor:"#111"}}}],series:[{name:"Autres",type:"scatter",coordinateSystem:"calendar",data:r,symbolSize:e=>e[1]/50,itemStyle:{normal:{color:"#ddb926"}}},{name:"Autres",type:"scatter",coordinateSystem:"calendar",calendarIndex:1,data:r,symbolSize:e=>e[1]/50,itemStyle:{normal:{color:"#ddb926"}}},{name:"Danger",type:"effectScatter",coordinateSystem:"calendar",calendarIndex:1,data:r.filter(e=>e[1]>o),symbolSize:e=>e[1]/50,showEffectOn:"render",rippleEffect:{brushType:"stroke"},hoverAnimation:!0,itemStyle:{normal:{color:"#f4e925",shadowBlur:10,shadowColor:"#333"}},zlevel:1},{name:"Danger",type:"effectScatter",coordinateSystem:"calendar",data:r.filter(e=>e[1]>o),symbolSize:e=>e[1]/50,showEffectOn:"render",rippleEffect:{brushType:"stroke"},hoverAnimation:!0,itemStyle:{normal:{color:"#f4e925",shadowBlur:10,shadowColor:"#333"}},zlevel:1}]};e.setOption(i,!0)},f=e=>fetch(`/latest/debits?stations=${e}`).then(t=>{t.ok&&t.json().then(t=>{if(0===t.filter(e=>e).length)a(".water-level").textContent="Service indisponible";else{const o=t.find(t=>t.station===e);a(".water-level").textContent=`${o.meas.toFixed(1)} m³/s`,a(".water-level-time").textContent=moment.unix(o.time/1e3).locale("fr").fromNow(),a("meta[property='stationLabel']").content=o.label,a("meta[property='level']").content=o.meas,a("time[property='datetime']").setAttribute("datetime",moment().format("YYYY-MM-DD"));const r=a("input[property='levelMax']").value;p(o.historic,r)}})}).catch(e=>{}),{city:u,station:h}=n();null===u||null===h?window.location.href="/?city=paris&station=F700000103":(a(".refresh-data").onclick=i(u,h),a(".help-station").onclick=s(),c(u,h),t().then(e=>{o().then(t=>l(u,h,e,t)),m(u,h),f(h)}));
},{}]},{},[1])