/* ====================================================== */
/* APP — Orchestrator chính                                */
/* ====================================================== */

/* ====================================================
 * PWA INSTALL — "Tải App" button
 * ==================================================== */
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

document.addEventListener('DOMContentLoaded', () => {

  const btnInstall = document.getElementById('btn-install-app');

  if (btnInstall) btnInstall.addEventListener('click', async () => {
    if (isInStandaloneMode()) {
      // Đã cài rồi
      showToast('App đã được cài trên màn hình chính!');
      return;
    }

    if (deferredInstallPrompt) {
      // Android / Chrome: hiện popup cài đặt native
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') deferredInstallPrompt = null;
    } else if (isIOS()) {
      // iOS Safari: hướng dẫn thủ công
      document.getElementById('ios-install-modal').classList.remove('hidden');
    } else {
      // Trình duyệt không hỗ trợ install prompt → mở link
      window.open('https://lekhabach.github.io/APP-Do-An/', '_blank');
    }
  });

  const iosModalClose    = document.getElementById('ios-modal-close');
  const iosModalBackdrop = document.getElementById('ios-modal-backdrop');
  const iosModal         = document.getElementById('ios-install-modal');
  if (iosModalClose)    iosModalClose.addEventListener('click',    () => iosModal.classList.add('hidden'));
  if (iosModalBackdrop) iosModalBackdrop.addEventListener('click', () => iosModal.classList.add('hidden'));


  /* ====================================================
   * WELCOME SCREEN
   * ==================================================== */
  const welcomeScreen = document.getElementById('screen-welcome');
  const mainScreen    = document.getElementById('screen-main');
  let   welcomed      = false;

  function showMainScreen() {
    if (welcomed) return;
    welcomed = true;

    welcomeScreen.style.transition = 'opacity 0.4s ease';
    welcomeScreen.style.opacity    = '0';

    setTimeout(() => {
      welcomeScreen.classList.remove('active');
      mainScreen.classList.add('active');

      // Đợi browser render xong layout trước khi init Leaflet
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            initApp();
            // Fix Leaflet tile khi container vừa hiện ra
            setTimeout(() => { if (typeof map !== 'undefined' && map) map.invalidateSize(); }, 300);
          } catch (e) { console.error('initApp error:', e); }
        });
      });
    }, 400);
  }

  document.getElementById('btn-start').addEventListener('click', showMainScreen);
  document.getElementById('btn-start').addEventListener('touchend', (e) => {
    e.preventDefault();
    showMainScreen();
  });

  // Tự chuyển sau 3 giây
  setTimeout(showMainScreen, 3000);


  /* ====================================================
   * KHỞI TẠO APP CHÍNH
   * ==================================================== */
  function initApp() {
    initMap();
    startGPS();
    loadRestaurants();
  }


  /* ====================================================
   * LOAD DANH SÁCH QUÁN ĂN
   * ==================================================== */
  async function loadRestaurants() {
    const listEl = document.getElementById('restaurant-list');

    try {
      const restaurants = await fetchRestaurants();

      if (restaurants.length === 0) {
        listEl.innerHTML = '<div class="loading-state"><p>Chưa có dữ liệu quán ăn</p></div>';
        return;
      }

      // Render danh sách
      listEl.innerHTML = '';
      restaurants.forEach((r) => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
          <div class="card-info">
            <div class="card-name">${esc(r.name)}${r.type ? ` <span class="card-type">${esc(r.type)}</span>` : ''}</div>
            ${r.price   ? `<div class="card-price">💰 ${esc(r.price)}</div>`   : ''}
            ${r.address ? `<div class="card-address">📝 ${esc(r.address)}</div>` : ''}
          </div>
          <div class="card-arrow">›</div>
        `;
        card.addEventListener('click', () => openDetail(r));
        listEl.appendChild(card);
      });

      // Thêm markers lên bản đồ
      addRestaurantMarkers(restaurants, openDetail);

    } catch (err) {
      console.error('Lỗi load dữ liệu:', err);
      listEl.innerHTML = `
        <div class="loading-state">
          <p>Lỗi tải dữ liệu 😕</p>
          <p style="font-size:0.8rem;margin-top:6px">${esc(err.message)}</p>
        </div>`;
    }
  }


  /* ====================================================
   * DETAIL SHEET — Chi tiết quán ăn
   * ==================================================== */
  let currentRestaurant = null;

  function openDetail(restaurant) {
    currentRestaurant = restaurant;

    // Tên
    document.getElementById('detail-name').textContent = restaurant.name;

    // SĐT
    const phoneRow = document.getElementById('detail-phone-row');
    const phoneEl  = document.getElementById('detail-phone');
    if (restaurant.phone) {
      phoneEl.textContent = restaurant.phone;
      phoneEl.href        = `tel:${restaurant.phone.replace(/\D/g, '')}`;
      phoneRow.style.display = 'flex';
    } else {
      phoneRow.style.display = 'none';
    }

    // Giá
    document.getElementById('detail-price').textContent = restaurant.price || 'Chưa có thông tin';

    // Địa chỉ
    const addrRow = document.getElementById('detail-address-row');
    const addrEl  = document.getElementById('detail-address');
    if (restaurant.address) {
      addrEl.textContent     = restaurant.address;
      addrRow.style.display  = 'flex';
    } else {
      addrRow.style.display  = 'none';
    }

    // Bản đồ nhúng Google Maps
    const mapContainer = document.getElementById('detail-map-container');
    const mapIframe    = document.getElementById('detail-map-iframe');
    const embedUrl     = getMapEmbedUrl(restaurant);
    if (embedUrl) {
      mapIframe.src = embedUrl;
      mapContainer.classList.remove('hidden');
    } else {
      mapIframe.src = '';
      mapContainer.classList.add('hidden');
    }

    document.getElementById('detail-sheet').classList.remove('hidden');

    // Pan bản đồ đến quán
    focusRestaurant(restaurant);
  }

  function closeDetail() {
    document.getElementById('detail-sheet').classList.add('hidden');
    currentRestaurant = null;
  }

  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.getElementById('detail-backdrop').addEventListener('click', closeDetail);


  /* ====================================================
   * ROUTING BUTTONS
   * ==================================================== */
  document.getElementById('btn-route-inapp').addEventListener('click', () => {
    if (currentRestaurant) startRouting(currentRestaurant);
  });

  document.getElementById('btn-route-gmaps').addEventListener('click', () => {
    if (currentRestaurant) openGoogleMaps(currentRestaurant);
  });

  document.getElementById('btn-clear-route').addEventListener('click', clearRoute);


  /* ====================================================
   * LOCATE BUTTON
   * ==================================================== */
  document.getElementById('btn-locate').addEventListener('click', locateUser);


  /* ====================================================
   * BOTTOM DRAWER — kéo lên/xuống
   * ==================================================== */
  const drawer        = document.getElementById('restaurant-drawer');
  const handle        = document.getElementById('drawer-handle');
  const btnCollapse   = document.getElementById('btn-collapse-drawer');
  let expanded  = false;
  let collapsed = false;
  let touchY0   = 0;

  function setCollapsed(val) {
    collapsed = val;
    drawer.classList.toggle('collapsed', collapsed);
    btnCollapse.textContent = collapsed ? '▴' : '▾';
    btnCollapse.title       = collapsed ? 'Mở rộng' : 'Thu nhỏ';
    if (collapsed) {
      expanded = false;
      drawer.classList.remove('expanded');
    }
  }

  // Nút thu nhỏ / mở rộng
  btnCollapse.addEventListener('click', (e) => {
    e.stopPropagation(); // không kích hoạt click của handle
    setCollapsed(!collapsed);
  });

  // Click vào handle: nếu đang thu nhỏ → mở lại; ngược lại → toggle expanded
  handle.addEventListener('click', () => {
    if (collapsed) { setCollapsed(false); return; }
    expanded = !expanded;
    drawer.classList.toggle('expanded', expanded);
  });

  // Swipe up/down để mở/đóng
  handle.addEventListener('touchstart', (e) => {
    touchY0 = e.touches[0].clientY;
  }, { passive: true });

  handle.addEventListener('touchend', (e) => {
    const dy = touchY0 - e.changedTouches[0].clientY;
    if (dy > 40) {                       // swipe lên
      if (collapsed) { setCollapsed(false); return; }
      expanded = true;
      drawer.classList.add('expanded');
    } else if (dy < -40 && expanded) {   // swipe xuống → đóng
      expanded = false;
      drawer.classList.remove('expanded');
    } else if (dy < -40 && !expanded) {  // swipe xuống khi đã nhỏ → thu nhỏ
      setCollapsed(true);
    }
  }, { passive: true });


  /* ====================================================
   * HELPER — tạo URL embed Google Maps từ dữ liệu quán
   * ==================================================== */
  function getMapEmbedUrl(restaurant) {
    // Ưu tiên dùng tọa độ lat/lng nếu có
    if (restaurant.hasLocation) {
      return `https://maps.google.com/maps?q=${restaurant.lat},${restaurant.lng}&z=17&output=embed`;
    }

    const url = restaurant.gmapsUrl;
    if (!url) return null;

    // Trích xuất tọa độ từ URL dạng: .../@lat,lng,zoom...
    const atMatch = url.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/);
    if (atMatch) {
      return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=17&output=embed`;
    }

    // Dạng: ?q=lat,lng hoặc &q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/);
    if (qMatch) {
      return `https://maps.google.com/maps?q=${qMatch[1]},${qMatch[2]}&z=17&output=embed`;
    }

    return null;
  }


  /* ====================================================
   * HELPER — escape HTML
   * ==================================================== */
  function esc(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

});
