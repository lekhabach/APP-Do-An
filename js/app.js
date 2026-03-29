/* ====================================================== */
/* APP — Orchestrator chính                                */
/* ====================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ====================================================
   * WELCOME SCREEN
   * ==================================================== */
  const welcomeScreen = document.getElementById('screen-welcome');
  const mainScreen    = document.getElementById('screen-main');
  let   welcomed      = false;

  function showMainScreen() {
    if (welcomed) return;
    welcomed = true;

    welcomeScreen.style.transition = 'opacity 0.5s ease';
    welcomeScreen.style.opacity    = '0';

    setTimeout(() => {
      welcomeScreen.classList.remove('active');
      mainScreen.classList.add('active');
      initApp();
    }, 500);
  }

  document.getElementById('btn-start').addEventListener('click', showMainScreen);

  // Tự chuyển sau 4 giây
  setTimeout(showMainScreen, 4000);


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
