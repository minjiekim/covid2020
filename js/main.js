mapboxgl.accessToken =
    'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: 4, // starting zoom
    center: [-100, 38] // starting center
});

// map 1
map.on('load', () => {
    map.addSource('covid-rate', {
        type: 'geojson',
        data: 'assets\\us-covid-2020-rates.json'
    });

    map.addLayer({
        'id': 'covid-rates-layer',
        'type': 'fill',
        'source': 'covid-rate',
        'paint': {
            'fill-color': [
                'step', ['get', 'rates'],
                '#FFEDA0', // stop_output_0
                20, // stop_input_0
                '#FED976', // stop_output_1
                40, // stop_input_1
                '#FD8D3C', // stop_output_2
                60, // stop_input_2
                '#FC4E2A', // stop_output_3
                80, // stop_input_3
                '#BD0026', // stop_output_4
                100, // stop_input_4
                '#E31A1C', // stop_output_5
            ],
            'fill-outline-color': '#BBBBBB',
            'fill-opacity': 0.7,
        }
    });

    const layers = [
        '0-19',
        '20-39',
        '40-59',
        '60-79',
        '80-99',
        '100 and more'
    ];
    const colors = [
        '#FFEDA070',
        '#FED97670',
        '#FD8D3C70',
        '#FC4E2A70',
        '#BD002670',
        '#E31A1C70'
    ];

    const legend = document.getElementById('legend');
    legend.innerHTML = "<b>Covid Rates<br>(% of cases/1000 residents.)</b><br><br>";

    layers.forEach((layer, i) => {
        const color = colors[i];
        const item = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;

        const value = document.createElement('span');
        value.innerHTML = `${layer}`;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    });

    map.on('mousemove', ({
        point
    }) => {
        const county = map.queryRenderedFeatures(point, {
            layers: ['covid-rates-layer']
        });
        document.getElementById('text-description').innerHTML = county.length ?
            `<h3>${county[0].properties.county}</h3><p><strong><em>${county[0].properties.rates}</strong> % of covid cases per 1000 residents</em></p>` :
            `<p>Hover over a county!</p>`;
    });
});

// map 2
const grades = [5000, 20000, 30000, 50000],
    colors = ['rgb(208,209,230)', 'rgb(103,169,207)', 'rgb(1,108,89)', 'rgb(35,139,69)'],
    radii = [3, 6, 9, 12];

//load data to the map as new layers.
//map.on('load', function loadingData() {
map.on('load', () => { //simplifying the function statement: arrow with brackets to define a function

    // when loading a geojson, there are two steps
    // add a source of the data and then add the layer out of the source
    map.addSource('covid-counts', {
        type: 'geojson',
        data: 'assets\\us-covid-2020-counts.json'
    });

    map.addLayer({
            'id': 'covid-counts-points',
            'type': 'circle',
            'source': 'covid-counts',
            'minzoom': 4,
            'paint': {
                // increase the radii of the circle as the zoom level and dbh value increases
                'circle-radius': {
                    'property': 'cases',
                    'stops': [
                        [{
                            zoom: 5,
                            value: grades[0]
                        }, radii[0]],
                        [{
                            zoom: 5,
                            value: grades[1]
                        }, radii[1]],
                        [{
                            zoom: 5,
                            value: grades[2]
                        }, radii[2]],
                        [{
                            zoom: 5,
                            value: grades[3]
                        }, radii[3]],
                    ]
                },
                'circle-color': {
                    'property': 'cases',
                    'stops': [
                        [grades[0], colors[0]],
                        [grades[1], colors[1]],
                        [grades[2], colors[2]],
                        [grades[2], colors[2]]
                    ]
                },
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': 0.6
            }
        },
        'waterway-label'
    );

    // click on tree to view magnitude in a popup
    map.on('click', 'covid-counts-points', (event) => {
        new mapboxgl.Popup()
            .setLngLat(event.features[0].geometry.coordinates)
            .setHTML(`<p>County: ${event.features[0].properties.county}</p><br> <strong>Cases:</strong> ${event.features[0].properties.cases}`)
            .addTo(map);
    });
});

// create legend
const legend = document.getElementById('legend');

//set up legend grades and labels
var labels = ['<strong> Covid Cases</strong>'],
    vbreak;
//iterate through grades and create a scaled circle and label for each
for (var i = 0; i < grades.length; i++) {
    vbreak = grades[i];
    // you need to manually adjust the radius of each dot on the legend
    // in order to make sure the legend can be properly referred to the dot on the map.
    dot_radii = 2 * radii[i];
    labels.push(
        '<p class="break"><i class="dot" style="background:' + colors[i] + '; width: ' + dot_radii +
        'px; height: ' +
        dot_radii + 'px; "></i> <span class="dot-label" style="top: ' + dot_radii / 2 + 'px;">' + vbreak +
        '</span></p>');

}
// add the data source
const source =
    '<p style="text-align: left; font-size: 9pt">Source: <a href="https://github.com/nytimes/covid-19-data/blob/43d32dde2f87bd4dafbb7d23f5d9e878124018b8/live/us-counties.csv">NY Times</a></p>';
// combine all the html codes.
legend.innerHTML = labels.join('') + source;