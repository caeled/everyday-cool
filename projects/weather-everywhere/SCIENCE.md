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

## Place search

Place names and coordinates come from Open-Meteo's geocoding service (https://open-meteo.com/en/docs/geocoding-api), a database of named places. A search sends only the typed name, and only when the reader clicks Search; nothing is sent while typing, and there is no autocomplete. Results are shown with region and country so same-name places can be told apart, and a result is never moved or adjusted: choosing one selects exactly the coordinates the database returned. A found place has no teaching temperature profile, and none is invented for it; the Compare room keeps its 16 hand-written example profiles.

## Sun & tilt room

The workshop constant for Earth's axial tilt is 23.44 degrees, shown rounded as 23.5 degrees. Solar declination for day of year N and tilt epsilon: delta = epsilon * sin(2 * pi * (284 + N) / 365). This is the same mid-year approximation the daylight map layer uses, generalized so the tilt can change. Day length uses the sunrise hour angle: cos(H) = -tan(latitude) * tan(delta); day length = 24 * acos(cos H) / pi hours, clamped to 0 (polar night) and 24 (polar day). Sunrise and sunset in the Sun slider are 12 - L/2 and 12 + L/2, where L is the day length: local solar time, with the sun highest at noon. No equation-of-time correction, time zone, atmospheric refraction, horizon elevation, or twilight is included, so displayed times are teaching approximations that can differ from clock sunrise tables by tens of minutes. The tilt control spans 0 to 45 degrees; the move-your-town control keeps Earth's real tilt and varies only latitude. All values are computed locally from these formulas. They describe sunlight geometry, never weather.

## Look back: weather on a past day

Past-day values come from the Open-Meteo archive API (https://archive-api.open-meteo.com/v1/archive), which serves the ERA5 reanalysis produced by the European Centre for Medium-Range Weather Forecasts (ECMWF) and distributed through the Copernicus Climate Data Store. A reanalysis is a single weather model run again over historical observations, so the whole record is described in one consistent way; it is a reconstruction, not a reading from a thermometer at the selected point. Requested daily variables: maximum and minimum temperature (2 m), precipitation total, and maximum wind speed (10 m), in UTC. ERA5 coverage in this service begins in 1940. The archive lags real time by about five days; dates inside that gap return no values and the workshop says so instead of substituting anything. Results are cached only in page memory for the session, keyed by coordinates and date. Requests are sent only when the reader clicks the Look back button.

## Opposite points

The antipode of (latitude, longitude) is (-latitude, longitude + 180 degrees, wrapped into the range -180 to 180). The mirror point is (-latitude, longitude). Land or ocean at a point is decided by an even-odd point-in-polygon test against the bundled Natural Earth polygons described above; coastlines at 1:110m scale are approximate, so a point very near a coast can be classified either way. A point is labeled with a named place only when it lies within 250 km of one of the 16 built-in places, by great-circle (haversine) distance; otherwise it is labeled as land or open ocean with its coordinates. The point is never moved to a nearer city. Current conditions for both points come from the same Open-Meteo forecast endpoint as Look live, fetched only on a click.

## Beaufort scale

Wind descriptions use the Beaufort scale as standardized by the World Meteorological Organization. Bands in km/h, with the land descriptions used in the workshop: 0 calm (under 1), 1 light air (1-5), 2 light breeze (6-11), 3 gentle breeze (12-19), 4 moderate breeze (20-28), 5 fresh breeze (29-38), 6 strong breeze (39-49), 7 near gale (50-61), 8 gale (62-74), 9 strong gale (75-88), 10 storm (89-102), 11 violent storm (103-117), 12 hurricane force (118 and above). The scale itself has no units; the numeric wind speed beside it follows the workshop unit choice (km/h as delivered by the provider; only temperature displays convert).

## Weather words

The glossary definitions are original plain-language explanations written for this workshop (CC BY 4.0, like the other educational content). They aim for a correct first understanding a child can act on, not a technical definition; SCIENCE.md remains the precise reference for the models. No external dictionary text is used.
