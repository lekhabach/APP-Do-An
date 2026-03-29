# Kế hoạch phát triển: Bách Review Đồ Ăn

## Tổng quan
Ứng dụng web HTML5 (chạy trên Android & iOS) hiển thị bản đồ Hải Phòng, danh sách quán ăn kèm chỉ đường GPS.

---

## Các bước thực hiện

### Bước 1 — Chuẩn bị dữ liệu quán ăn
- [ ] Truy cập Google Spreadsheet tại [Link.txt](Link.txt) để xem cấu trúc dữ liệu
- [ ] Xác định các cột cần thiết: Tên quán, Số điện thoại, Mức giá, Tọa độ (lat/lng), (tùy chọn: ảnh, mô tả)
- [ ] Đảm bảo Google Sheets được set **"Anyone with link can view"**
- [ ] Lấy dữ liệu qua **Google Sheets gviz JSON API** (không cần API key):
  `https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json`

### Bước 2 — Thiết lập cấu trúc dự án
- [ ] Tạo file `index.html` chính
- [ ] Tạo thư mục `css/`, `js/`, `assets/`
- [ ] Tích hợp **Leaflet.js** (miễn phí, nhẹ ~42KB, không cần API key)
- [ ] Dùng tile map **OpenStreetMap** (miễn phí, đủ chi tiết cho Hải Phòng)
- [ ] Tích hợp plugin **Leaflet Routing Machine** để hỗ trợ chỉ đường trong app

### Bước 3 — Xây dựng giao diện bản đồ
- [ ] Tích hợp Leaflet.js / Google Maps
- [ ] Khởi tạo bản đồ trung tâm tại TP Hải Phòng (lat: 20.8449, lng: 106.6881)
- [ ] Cài đặt zoom mặc định phù hợp để bao phủ nội thành

### Bước 4 — Hiển thị vị trí người dùng (GPS)
- [ ] Sử dụng `navigator.geolocation.watchPosition()` để theo dõi vị trí thời gian thực
- [ ] Hiển thị marker "Bạn đang ở đây" trên bản đồ
- [ ] Xử lý trường hợp người dùng từ chối cấp quyền GPS

### Bước 5 — Load và hiển thị danh sách quán ăn
- [ ] Fetch dữ liệu từ Google Sheets qua gviz JSON API
- [ ] Parse response (strip wrapper `/*O_o*/google.visualization.Query.setResponse(...)` rồi `JSON.parse`)
- [ ] Đặt marker cho từng quán ăn trên bản đồ
- [ ] Xây dựng danh sách quán ăn dạng sidebar/panel

### Bước 6 — Popup thông tin quán ăn
- [ ] Khi click marker hoặc item trong danh sách: hiển thị popup/card gồm:
  - Tên quán
  - Số điện thoại (có thể gọi trực tiếp qua `tel:`)
  - Mức giá
- [ ] 2 nút trong popup: **"Chỉ đường"** (trong app) và **"Mở Google Maps"** (deep link)

### Bước 7 — Chức năng chỉ đường
- [ ] Lấy tọa độ người dùng hiện tại + tọa độ quán được chọn
- [ ] **Option 1 — Chỉ đường trong app (Leaflet Routing Machine + OSRM):**
  - Tích hợp plugin `leaflet-routing-machine`
  - Gọi OSRM public API để tính route: `https://router.project-osrm.org/route/v1/driving/`
  - Vẽ polyline tuyến đường lên bản đồ
  - Hiển thị thông tin quãng đường + thời gian ước tính
  - Nút "Xóa chỉ đường" để clear route
- [ ] **Option 2 — Mở Google Maps (deep link):**
  - Nút mở Google Maps app native trên điện thoại
  - Deep link: `https://maps.google.com/?saddr={userLat},{userLng}&daddr={quanLat},{quanLng}`
  - Tự động fallback sang web nếu không có app Google Maps

### Bước 8 — Tối ưu mobile (Android & iOS)
- [ ] Thêm meta viewport responsive
- [ ] Thêm `manifest.json` và `service worker` để hỗ trợ PWA (cài như app native)
- [ ] Kiểm tra touch events, scroll, zoom trên thiết bị thật
- [ ] Tối ưu performance: lazy load ảnh, cache dữ liệu

### Bước 9 — Kiểm thử
- [ ] Test trên trình duyệt Chrome DevTools (chế độ mobile)
- [ ] Test thực tế trên Android và iOS
- [ ] Test GPS, chỉ đường, load dữ liệu

### Bước 10 — Triển khai (GitHub Pages)
- [ ] Tạo tài khoản GitHub tại github.com (nếu chưa có)
- [ ] Tạo repository mới: `bach-review-do-an` (Public)
- [ ] Upload toàn bộ file dự án lên repo (kéo thả hoặc dùng Git)
- [ ] Vào **Settings → Pages** → Source: **Deploy from a branch** → branch **main** → Save
- [ ] Truy cập app tại `https://{username}.github.io/bach-review-do-an/`
- [ ] Kiểm tra GPS hoạt động trên HTTPS (tự động có sẵn với GitHub Pages)

---

## Công nghệ đề xuất
| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Bản đồ | Leaflet.js + OpenStreetMap |
| Dữ liệu | Google Sheets gviz JSON API (không cần API key) |
| Chỉ đường | Leaflet Routing Machine / deep link Google Maps |
| GPS | Web Geolocation API |
| Hosting | GitHub Pages / Netlify |

---

## Lưu ý
- HTTPS là **bắt buộc** để Geolocation API hoạt động trên mobile
- Dữ liệu Google Sheets chỉ cần set **"Anyone with link can view"** — không cần publish hay API key
