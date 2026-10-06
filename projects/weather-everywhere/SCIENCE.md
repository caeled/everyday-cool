# Science, sources, and honest limits

## The important distinction

**Teaching examples** are explicitly labeled. **Live model forecasts** are identified as model output, not weather-station measurements. No data here is a validated weather or climate prediction from our own code.

## World map and seasons

Land polygons: Natural Earth 1:110m, `ne_110m_land.geojson`, retrieved October 5, 2026 from https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson and bundled as a JavaScript array for local-file use. Geographic projection: equirectangular, longitude x / latitude y. Poles are distorted; this is not an equal-area map. Natural Earth terms: https://www.naturalearthdata.com/about/terms-of-use/ (public domain).

Temperature profiles are original rounded pedagogical examples. They are sinusoidal (`base + amplitude * cos(season angle)`), centered on July in the north and January in the south. They have no statistical reference period and must not be quoted as measured climatological averages. Some real climates have more complicated seasons, and temperatures can lag the sunlight peak.

The temperature-colored map is an invented latitude/month formula, not an interpolated forecast or climate dataset. The daylight layer shows only approximate daily light duration by latitude, not a real-time day/night terminator. Daylight uses a mid-month solar-declination approximation and the sunrise hour angle; excludes refraction, horizon elevation and twilight. Polar day/night clamp to 24/0 hours.

Antarctica teaching context: https://www.bas.ac.uk/about/where-we-work/antarctica/ and https://legacy.bas.ac.uk/about_antarctica/geography/weather/temperatures.php. Coastal summer can be near freezing; higher interior regions are much colder. No record-temperature claims are included.

## Ripple lab

Density approximation: `rho = 1027 - 0.2 * (T - 10) + 0.78 * (S - 35)` kg/m³. This is a simple linear teaching approximation, not TEOS-10. Temperature is °C and salinity is represented as grams per kilogram.

Cold minus warm density determines a bounded sinking-tendency proxy. Circulation index = 0.15 + 0.65 * sinking proxy + 0.2 * absolute wind/10. Heat influence = circulation index * positive warm/cold temperature contrast / 18. An invented coastal target = 3 * heat influence; the response relaxes 12% toward the difference from the default scenario each step. Moisture index = exp(0.06*(warmT-22)) * positive wind / 10. Negative wind points away from the illustrated coast and makes this one-direction moisture index zero. Its arrow reverses direction.

None of these indices is calibrated to real circulation, precipitation, time, or a named place. The lab demonstrates pathways and interactions. Salinity influences density and a model heat pathway rather than directly generating rain. No real-world sensitivity or climate threshold can be inferred.

NOAA background: https://www.noaa.gov/jetstream/ocean/circulations and https://oceanexplorer.noaa.gov/ocean-fact/currents/. Wind and density differences influence circulation; oceans move heat and interact with the atmosphere.

## Cloud maker

Magnus dew-point approximation uses a = 17.625 and b = 243.04°C. Approximate lifting condensation level: 125 meters per °C temperature/dew-point difference. Dry parcel cooling: 9.8°C/km; illustrative constant saturated rate: 6°C/km. The actual saturated rate varies with temperature and pressure. Cloud appearance is an illustration, not predicted cloud geometry, rainfall, or a full mountain rain-shadow model. NOAA: https://www.noaa.gov/jetstream/clouds/how-clouds-form and https://www.noaa.gov/jetstream/upperair/skew-t-log-p-diagrams.

## Live forecasts

Open-Meteo: https://open-meteo.com/en/docs and https://open-meteo.com/en/pricing. Current conditions are model-derived; the seven-day daily values are model forecasts. Browser requests use latitude/longitude, Celsius, km/h, millimeters, UTC, and the free non-commercial forecast endpoint. Open-Meteo attribution is provided beside the data. Data licensing: https://open-meteo.com/en/terms. The API can return grid-cell coordinates/elevation differing from the selected exact point, especially important in mountains and polar regions.

NWS official forecasts and radar are external links, not silently mixed into Open-Meteo data. API reference for future expansion: https://www.weather.gov/documentation/services-web-api. NASA Worldview and Earth Nullschool are links to external interfaces; their imagery/model layers need internet and retain their own terms.

Selection checked October 5, 2026. External services can change. There are no analytics, accounts, embedded ads, or automatic location permissions in this workshop.
