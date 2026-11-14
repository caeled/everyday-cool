(function(root){'use strict';
const words=[
['Weather','The state of the air at one place and time: its temperature, wind, and wetness. Weather changes from hour to hour and day to day.'],
['Climate','The usual pattern of weather in a place across many years. Climate describes what to expect in general; weather is what is happening now.'],
['Forecast','A statement of what the weather is expected to do in the future. Forecasts are made with computer models and are never certain.'],
['Model','A computer program that represents the air and oceans with numbers and equations. A model calculates how the weather may change.'],
['Observation','A measurement of the real world, such as a thermometer reading or a satellite picture. Forecasts are checked against observations.'],
['Reanalysis','A reconstruction of past weather. Scientists run one model over old observations so that every past day is described in the same, even way.'],
['Latitude','A measure of how far north or south a place is from the equator, in degrees. The equator is 0 degrees and the poles are 90 degrees.'],
['Longitude','A measure of how far east or west a place is, in degrees, from the zero line that passes through Greenwich, in London.'],
['Equator','The imaginary circle around the middle of the Earth, at 0 degrees latitude. The sun climbs high in the sky there all year.'],
['Hemisphere','One half of the Earth. The equator divides the northern and southern hemispheres, and their seasons fall at opposite times of year.'],
['Season','A part of the year with a pattern of sunlight and weather, such as summer or winter. Seasons happen because Earth\'s axis is tilted.'],
['Tilt','The lean of Earth\'s axis (the line the Earth spins around) compared with its path around the sun. The tilt is about 23.5 degrees, and it is the reason for the seasons.'],
['Solstice','One of the two days each year when the sun reaches its highest or lowest noon position for a place. The solstices bring the longest and shortest days of the year.'],
['Equinox','One of the two days each year when day and night are close to equal in length everywhere on Earth. They fall in March and September.'],
['Day length','The time between sunrise and sunset on a given day. It depends on the latitude of the place and the time of year.'],
['Sunrise','The moment the top edge of the sun appears above the horizon in the morning.'],
['Sunset','The moment the top edge of the sun sinks below the horizon in the evening.'],
['Temperature','A measure of how warm or cold something is. In this workshop it is shown in degrees Celsius or Fahrenheit.'],
['Humidity','A measure of how much water vapor is in the air. Warm air can hold more water vapor than cold air.'],
['Dew point','The temperature the air must cool to for its water vapor to start condensing into liquid water. When air cools to the dew point, dew, fog, or clouds can form.'],
['Condensation','The change of water vapor, a gas, into liquid water. It happens when air cools to its dew point.'],
['Cloud base','The lowest height of a cloud above the ground. In the Cloud maker it is estimated from the temperature and the dew point.'],
['Front','A boundary between two large bodies of air at different temperatures. The weather often changes when a front passes a place.'],
['Pressure','The weight of the air pressing down on a place. Falling pressure often comes before cloudier, wetter weather; rising pressure often comes before calmer weather.'],
['Wind','Moving air. Wind blows from areas of higher pressure toward areas of lower pressure, and it carries heat and moisture with it.'],
['Beaufort scale','A scale that describes wind with a number from 0 to 12 and with what the wind does to things you can see, such as leaves, trees, and roofs.'],
['Precipitation','Water that falls from clouds to the ground: rain, drizzle, snow, sleet, or hail. It is measured as a depth, in millimeters.'],
['Evaporation','The change of liquid water into water vapor. Heat makes evaporation faster.'],
['Ocean current','A flow of water through the ocean, driven by wind and by differences in water temperature and salinity. Currents carry heat around the planet.'],
['Density','How much mass is packed into a given space. Cold or salty water is denser than warm or fresh water, so it tends to sink below it.'],
['Salinity','How much salt is dissolved in water. Ocean water holds about 35 grams of salt in each kilogram of water, on average.'],
['Atmosphere','The layer of gases that surrounds the Earth. Weather happens in the lowest part of it.']
];
function find(term){const t=String(term).toLowerCase();return words.find(w=>w[0].toLowerCase()===t)||null;}
if(typeof module!=='undefined')module.exports={words,find};else{root.WEATHER_WORDS=words;root.findWeatherWord=find;}
})(typeof window==='undefined'?globalThis:window);
