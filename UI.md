# Kế hoạch UI — Bách Review Đồ Ăn

## Phong cách thiết kế
- **Retro** — gợi nhớ Hải Phòng xưa, typography cổ điển, texture giấy cũ, viền vintage
- **Đậm chất Hải Phòng** — màu sắc lấy cảm hứng từ hoa phượng đỏ, cảng biển, sóng Bạch Đằng
- **Logo thành phố** — sử dụng logo chính thức Hải Phòng (2024): hoa phượng đỏ + sóng biển + cầu Tân Vũ

---

## Bảng màu (Color Palette)

| Vai trò | Màu | Hex |
|---|---|---|
| Primary | Đỏ phượng | `#C0392B` |
| Primary Dark | Đỏ đậm | `#922B21` |
| Secondary | Vàng cổ | `#D4AC0D` |
| Background | Kem giấy cũ | `#F5F0E8` |
| Surface | Trắng ngà | `#FAF7F2` |
| Text chính | Nâu đậm | `#2C1810` |
| Text phụ | Nâu nhạt | `#7D6555` |
| Accent | Xanh cảng biển | `#1A5276` |

---

## Typography

| Loại | Font | Ghi chú |
|---|---|---|
| Tiêu đề lớn | **Playfair Display** hoặc **Libre Baskerville** | Serif cổ điển, retro |
| Tiêu đề nhỏ | **Merriweather** | Dễ đọc, có chân |
| Body text | **Lora** | Serif nhẹ |
| Số/giá tiền | **Courier Prime** | Monospace retro |

> Tất cả font lấy từ Google Fonts — miễn phí

---

## Các màn hình chính

---

### Màn hình 1 — Welcome Screen

**Mục đích:** Giới thiệu app, tạo ấn tượng đầu tiên

**Layout:**
```
┌─────────────────────────┐
│   [texture giấy cũ]     │
│                         │
│   [Logo Hải Phòng]      │
│   (hoa phượng + sóng)   │
│                         │
│  ✦ BÁCH REVIEW ✦        │
│     ĐỒ ĂN HẢI PHÒNG    │
│                         │
│  ─────────────────────  │
│  "Khám phá ẩm thực      │
│   thành phố hoa phượng" │
│                         │
│   [ BẮT ĐẦU KHÁM PHÁ ] │
│                         │
│  ───── ✦ ─────          │
└─────────────────────────┘
```

**Chi tiết:**
- [ ] Background: màu kem `#F5F0E8` + texture noise giấy cũ (CSS hoặc SVG pattern)
- [ ] Logo Hải Phòng chính thức ở giữa, kích thước ~120px
- [ ] Tên app font Playfair Display, chữ hoa, màu đỏ `#C0392B`
- [ ] Tagline font Lora, in nghiêng, màu nâu
- [ ] Nút "Bắt đầu khám phá": viền retro, nền đỏ, góc bo nhẹ
- [ ] Hiệu ứng fade-in khi load
- [ ] Sau 3s hoặc khi nhấn nút → chuyển sang màn hình Map

---

### Màn hình 2 — Màn hình chính (Map + Danh sách)

**Layout (mobile):**
```
┌─────────────────────────┐
│ [≡]  Bách Review  [🔍]  │  ← Header retro
├─────────────────────────┤
│                         │
│       [BẢN ĐỒ]         │  ← Leaflet map (60% chiều cao)
│   📍markers quán ăn     │
│   🔵 vị trí tôi        │
│                         │
├─────────────────────────┤
│ ── DANH SÁCH QUÁN ──   │  ← Panel kéo lên/xuống
│ [Card quán 1]           │
│ [Card quán 2]           │
│ [Card quán 3]           │
│ ...                     │
└─────────────────────────┘
```

**Chi tiết:**
- [ ] Header: nền đỏ `#C0392B`, chữ trắng, font Playfair Display
- [ ] Bản đồ chiếm ~55-60% màn hình
- [ ] Panel danh sách có thể kéo lên full-screen (drawer)
- [ ] Marker quán: icon hoa phượng đỏ custom

---

### Màn hình 3 — Card / Popup quán ăn

**Layout:**
```
┌─────────────────────────┐
│ ╔═══════════════════╗   │
│ ║  [Ảnh quán ăn]   ║   │
│ ║                   ║   │
│ ╠═══════════════════╣   │
│ ║ 🍜 Tên Quán       ║   │
│ ║ 📞 0123.456.789   ║   │
│ ║ 💰 50k - 100k     ║   │
│ ║ 📍 Quận Lê Chân   ║   │
│ ╠═══════════════════╣   │
│ ║ [Chỉ đường trong] ║   │
│ ║ [Mở Google Maps ] ║   │
│ ╚═══════════════════╝   │
└─────────────────────────┘
```

**Chi tiết:**
- [ ] Card có viền retro kiểu "khung ảnh cũ", nền kem
- [ ] Tên quán: Playfair Display, màu đỏ
- [ ] SĐT có thể nhấn gọi trực tiếp (`tel:`)
- [ ] Nút **"Chỉ đường"**: nền đỏ `#C0392B`, icon mũi tên
- [ ] Nút **"Mở Google Maps"**: nền xanh cảng `#1A5276`, icon Google Maps

---

### Màn hình 4 — Chỉ đường trong app

**Layout:**
```
┌─────────────────────────┐
│ [←] Đường đến: Tên Quán │  ← Header
├─────────────────────────┤
│                         │
│    [BẢN ĐỒ FULL]       │
│    route được vẽ        │
│    🔵─────────────📍    │
│                         │
├─────────────────────────┤
│  📏 2.3 km  ⏱ ~8 phút  │
│  [ Xóa chỉ đường ]      │
└─────────────────────────┘
```

**Chi tiết:**
- [ ] Bản đồ chiếm toàn màn hình
- [ ] Route polyline màu đỏ `#C0392B`
- [ ] Panel dưới hiển thị quãng đường + thời gian ước tính
- [ ] Nút quay lại header

---

## Assets cần chuẩn bị

| Asset | Mô tả | Nguồn |
|---|---|---|
| Logo Hải Phòng | SVG chính thức 2024 | [haitrieu.com](https://haitrieu.com/blogs/logo-bieu-trung-tinh-thanh-viet-nam/) |
| Icon marker | Hoa phượng đỏ SVG | Tự thiết kế hoặc Flaticon |
| Texture giấy | CSS noise pattern | CSS thuần hoặc SVG filter |
| Favicon | Logo Hải Phòng 32x32 | Crop từ logo chính |

---

## Checklist UI

- [ ] Tạo file `css/style.css` với biến màu CSS custom properties
- [ ] Tạo `css/retro.css` cho texture, viền, font retro
- [ ] Thiết kế Welcome Screen
- [ ] Thiết kế Header + layout chính
- [ ] Thiết kế Card quán ăn
- [ ] Thiết kế 2 nút chỉ đường
- [ ] Thiết kế màn hình chỉ đường
- [ ] Custom marker Leaflet (hoa phượng)
- [ ] Test giao diện trên mobile (375px, 390px, 414px)
- [ ] Đảm bảo contrast màu đạt chuẩn WCAG AA
