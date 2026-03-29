/* ====================================================== */
/* MAP — Leaflet.js + OpenStreetMap                        */
/* ====================================================== */

let map;
let userMarker;
let userLatLng = null;

/* ---------- Khởi tạo bản đồ ---------- */
function initMap() {
  map = L.map('map', {
    center: [20.8449, 106.6881], // Trung tâm TP Hải Phòng
    zoom: 13,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Chuyển nút zoom sang góc phải để tránh che panel
  map.zoomControl.setPosition('topright');

  return map;
}

/* ---------- GPS — theo dõi vị trí người dùng ---------- */
function startGPS() {
  if (!navigator.geolocation) {
    showToast('Trình duyệt không hỗ trợ GPS');
    return;
  }

  const userIcon = L.divIcon({
    className: '',
    html: '<div class="user-dot"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  navigator.geolocation.watchPosition(
    (pos) => {
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      userLatLng = latlng;

      if (!userMarker) {
        userMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindTooltip('Vị trí của bạn', { permanent: false });
      } else {
        userMarker.setLatLng(latlng);
      }
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        showToast('Cấp quyền GPS để dùng chỉ đường');
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
  );
}

/* ---------- Nút định vị — pan đến vị trí người dùng ---------- */
function locateUser() {
  if (userLatLng) {
    map.setView(userLatLng, 15, { animate: true });
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true }),
    () => showToast('Không thể lấy vị trí của bạn')
  );
}

/* ---------- Icon marker theo loại quán ---------- */
function getMarkerIcon(type) {
  const t = (type || '').toLowerCase();

  let emoji = '🍽';
  let cls   = 'marker-default';

  if (t.includes('cafe') || t.includes('cà phê') || t.includes('ca phe') || t.includes('coffee')) {
    emoji = '☕'; cls = 'marker-cafe';
  } else if (
    t.includes('drink') || t.includes('uống') || t.includes('nước') ||
    t.includes('nuoc')  || t.includes('sinh tố') || t.includes('trà sữa') ||
    t.includes('juice')
  ) {
    emoji = '🧃'; cls = 'marker-drink';
  } else if (
    t.includes('food') || t.includes('ăn') || t.includes('bún') ||
    t.includes('phở')  || t.includes('cơm') || t.includes('com')  ||
    t.includes('bánh') || t.includes('lẩu') || t.includes('quán')
  ) {
    emoji = '🍜'; cls = 'marker-food';
  }

  return L.divIcon({
    className: '',
    html: `<div class="marker-icon ${cls}"><span>${emoji}</span></div>`,
    iconSize:    [36, 36],
    iconAnchor:  [18, 36],
    popupAnchor: [0, -38],
  });
}

/* ---------- Thêm markers lên bản đồ ---------- */
function addRestaurantMarkers(restaurants, onClickCallback) {
  restaurants.forEach((r) => {
    if (!r.hasLocation) return;

    const marker = L.marker([r.lat, r.lng], { icon: getMarkerIcon(r.type) })
      .addTo(map)
      .on('click', () => onClickCallback(r));

    r._marker = marker;
  });
}

/* ---------- Pan + zoom đến quán được chọn ---------- */
function focusRestaurant(restaurant) {
  if (restaurant.hasLocation) {
    map.setView([restaurant.lat, restaurant.lng], 16, { animate: true });
  }
}

/* ---------- Toast thông báo (dùng chung) ---------- */
function showToast(msg) {
  const toast  = document.getElementById('toast');
  const msgEl  = document.getElementById('toast-msg');
  msgEl.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 3000);
}
