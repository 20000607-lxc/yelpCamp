// to show the map from mapbox  
// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = maptoken ;
// process.env.MAPBOX_TOKEN can be accessed in every file! 
console.log(campPos.geometry.coordinates)
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campPos.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
.setLngLat(campPos.geometry.coordinates)
.addTo(map);


// add a popup 
const popup = new mapboxgl.Popup({offset:25})
.setLngLat(campPos.geometry.coordinates)
.setHTML(`<h7>Hello from ${campPos.title}!</h7>`)
.addTo(map);

// add a controller 
map.addControl(new mapboxgl.FullscreenControl());
map.addControl(new mapboxgl.NavigationControl());