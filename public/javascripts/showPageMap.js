mapboxgl.accessToken = 'pk.eyJ1IjoibGFzdDM4MCIsImEiOiJja2gweXllajUwMDB3MnBucDNyZGN4MzM1In0.QWTgoTR0p-mJ08kheHM4ug';
	const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
	center: space.geometry.coordinates, // starting position [lng, lat]
	zoom: 9 // starting zoom
	});

map.addControl(new mapboxgl.NavigationControl(),);

new mapboxgl.Marker().setLngLat(space.geometry.coordinates).setPopup(
	new mapboxgl.Popup({offset: 25}).setHTML(
		`<h3>${space.title}</h3><p>${space.location}</p>`
	)
).addTo(map)