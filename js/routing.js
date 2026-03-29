/* ====================================================== */
/* ROUTING — Leaflet Routing Machine (OSRM) + Google Maps */
/* ====================================================== */

let routingControl = null;

/* ---------- Option 1: Chỉ đường trong app ---------- */
function startRouting(restaurant) {
  if (!userLatLng) {
    showToast('Chưa lấy được vị trí GPS của bạn');
    return;
  }
  if (!restaurant.hasLocation) {
    showToast('Quán này chưa có tọa độ trên bản đồ');
    return;
  }

  clearRoute(); // Xóa route cũ nếu có

  routingControl = L.Routing.control({
    waypoints: [
      userLatLng,
      L.latLng(restaurant.lat, restaurant.lng),
    ],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'driving',
    }),
    routeWhileDragging: false,
    showAlternatives:   false,
    addWaypoints:       false,
    fitSelectedRoutes:  true,
    lineOptions: {
      styles: [
        { color: '#C0392B', weight: 5, opacity: 0.9 },
      ],
      extendToWaypoints:    true,
      missingRouteTolerance: 0,
    },
    createMarker: () => null, // dùng marker của chúng ta, không tạo thêm
  }).addTo(map);

  routingControl.on('routesfound', (e) => {
    const summary = e.routes[0].summary;
    const km  = (summary.totalDistance / 1000).toFixed(1);
    const min = Math.ceil(summary.totalTime / 60);

    document.getElementById('routing-distance').textContent = `${km} km`;
    document.getElementById('routing-time').textContent     = `~${min} phút`;
    document.getElementById('routing-dest').textContent     = restaurant.name;
    document.getElementById('routing-panel').classList.remove('hidden');
  });

  routingControl.on('routingerror', () => {
    showToast('Không tìm được đường — thử dùng Google Maps');
    clearRoute();
  });

  // Đóng detail sheet, thu drawer
  document.getElementById('detail-sheet').classList.add('hidden');
  document.getElementById('restaurant-drawer').classList.remove('expanded');
}

/* ---------- Xóa route ---------- */
function clearRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  document.getElementById('routing-panel').classList.add('hidden');
  document.getElementById('routing-distance').textContent = '-- km';
  document.getElementById('routing-time').textContent     = '-- phút';
  document.getElementById('routing-dest').textContent     = '';
}

/* ---------- Option 2: Mở Google Maps ---------- */
function openGoogleMaps(restaurant) {
  if (!restaurant.hasLocation) {
    showToast('Quán này chưa có tọa độ');
    return;
  }

  const dest = `${restaurant.lat},${restaurant.lng}`;
  let url;

  if (userLatLng) {
    const src = `${userLatLng.lat},${userLatLng.lng}`;
    url = `https://maps.google.com/?saddr=${src}&daddr=${dest}`;
  } else {
    // Nếu chưa có GPS, chỉ hiển thị vị trí quán
    url = `https://maps.google.com/?q=${dest}`;
  }

  window.open(url, '_blank');
}
