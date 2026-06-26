let map = L.map("map").setView([51.505, -0.09], 13);

// Normal map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

async function geocodeLocation(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.length === 0) {
    alert("Location not found");
    return null;
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}

async function showLocation(place) {
  const coords = await geocodeLocation(place);

  if (!coords) return;

  // Move map
  map.setView([coords.lat, coords.lng], 14);

  // Add marker
  L.marker([coords.lat, coords.lng])
    .addTo(map)
    .bindPopup(
      `
<div style="font-family:sans-serif; text-align:center;">
  <h1 style="font-size:23px; margin-bottom:6px;">${title}</h1>
<hr style="border: none; border-top: 2px solid #000;">
  <strong style="font-size:15px;">📍 ${place}</strong><br>
  <span style="font-size:13px; color:#666;">
    Exact location will be shared after booking
  </span>
</div>
`,
    )
    .openPopup();

  let circle = L.circle([coords.lat, coords.lng], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 250,
  }).addTo(map);
}

showLocation(listingLocation);