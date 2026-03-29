/* ====================================================== */
/* DATA — Google Sheets gviz JSON API                      */
/* Sheet cần set "Anyone with link can view"               */
/* ====================================================== */

const SHEET_ID  = '1UD2iByllU3PAeJ6ZaTCUand10dyom2T1PaTTbrnEdhA';
const GVIZ_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

/**
 * Fetch và parse danh sách quán ăn từ Google Sheets.
 * Tự động nhận diện tên cột (không phân biệt hoa/thường).
 *
 * Tên cột hỗ trợ:
 *   Tên quán : "tên quán" | "ten quan" | "tên" | "name"
 *   SĐT      : "số điện thoại" | "sdt" | "phone" | "điện thoại"
 *   Giá      : "mức giá" | "giá" | "gia" | "price"
 *   Lat      : "lat" | "latitude" | "vĩ độ"
 *   Lng      : "lng" | "lon" | "longitude" | "kinh độ"
 *   Địa chỉ  : "địa chỉ" | "dia chi" | "address"
 */
async function fetchRestaurants() {
  const response = await fetch(GVIZ_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const text = await response.text();

  // Response bị bọc: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
  if (!match) throw new Error('Không parse được dữ liệu Google Sheets');

  const json = JSON.parse(match[1]);
  if (json.status !== 'ok') throw new Error('Sheets API lỗi: ' + json.status);

  const cols = json.table.cols;
  const rows = json.table.rows;

  // Xây dựng map: label (lowercase) → index
  const colIndex = {};
  cols.forEach((col, i) => {
    const label = (col.label || '').toLowerCase().trim();
    if (label) colIndex[label] = i;
  });

  // Tìm index theo danh sách tên có thể có
  function col(...names) {
    for (const name of names) {
      if (colIndex[name] !== undefined) return colIndex[name];
    }
    return -1;
  }

  const iName    = col('tenquan', 'tên quán', 'ten quan', 'tên', 'name');
  const iPhone   = col('tell', 'sdt', 'phone', 'số điện thoại', 'điện thoại');
  const iPrice   = col('price', 'mức giá', 'giá', 'gia');
  const iLat     = col('lat', 'latitude', 'vĩ độ');
  const iLng     = col('lng', 'lon', 'longitude', 'kinh độ');
  const iAddress = col('mota', 'địa chỉ', 'dia chi', 'address');
  const iType    = col('type', 'loại', 'loai', 'danh mục');
  const iGmaps   = col('maps', 'gmaps', 'google maps', 'link maps', 'link bản đồ', 'bản đồ', 'map link');

  const restaurants = [];

  rows.forEach((row, idx) => {
    if (!row.c) return;

    const str = (i) =>
      (i >= 0 && row.c[i] && row.c[i].v != null)
        ? String(row.c[i].v).trim()
        : '';

    const num = (i) =>
      (i >= 0 && row.c[i] && row.c[i].v != null)
        ? parseFloat(row.c[i].v)
        : null;

    const name = str(iName);
    if (!name) return; // bỏ qua dòng trống

    const lat = num(iLat);
    const lng = num(iLng);

    restaurants.push({
      id:          idx,
      name,
      phone:       str(iPhone),
      price:       str(iPrice),
      address:     str(iAddress), // dùng Mota làm mô tả/địa chỉ
      type:        str(iType),
      lat,
      lng,
      hasLocation: lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng),
      gmapsUrl:    str(iGmaps),
    });
  });

  return restaurants;
}
