# can-we-row
Can we row? Based on water level and weather.

For rowers in Paris, a simple website to check if you can row based on water levels and weather.

Scraping using `cheerio` on [Vigicrues](http://www.vigicrues.gouv.fr) website and using the [Forecast API](https://developer.forecast.io/docs/v2) API.

With a web interface with Angular :
* Set the limit: default 700 m3/s
* Select Day of the week: default Wed and Sat
* Select min temperature : 10°C
* Provide URLs you can copy paste in your bookmarks