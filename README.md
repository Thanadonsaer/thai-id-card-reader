# เครื่องอ่านบัตรประชาชนไทย

เว็บแอปพลิเคชันสำหรับอ่านข้อมูลบัตรประชาชนไทยโดยใช้ React + Vite และอุปกรณ์ ZW-12027-1

## คุณสมบัติ

- เชื่อมต่อกับอุปกรณ์อ่านบัตร ZW-12027-1 ผ่าน WebUSB API
- อ่านข้อมูลบัตรประชาชนไทยแบบ real-time
- แสดงข้อมูลส่วนตัว ชื่อ ที่อยู่ วันเกิด และข้อมูลอื่นๆ
- UI ที่ใช้งานง่ายและ responsive

## ความต้องการระบบ

- เบราว์เซอร์ที่รองรับ WebUSB API (Chrome 61+, Edge 79+)
- อุปกรณ์อ่านบัตร ZW-12027-1
- บัตรประชาชนไทย

## การติดตั้งและรัน

1. ติดตั้ง dependencies:
```bash
npm install
```

2. รัน development server:
```bash
npm run dev
```

3. เปิดเบราว์เซอร์และไปที่ `http://localhost:3000`

## วิธีใช้งาน

1. เสียบอุปกรณ์ ZW-12027-1 เข้ากับคอมพิวเตอร์
2. คลิกปุ่ม "เชื่อมต่ออุปกรณ์"
3. เลือกอุปกรณ์จากรายการที่ปรากฏ
4. เสียบ บัตรประชาชนลงในเครื่องอ่าน
5. ข้อมูลจะแสดงขึ้นมาอัตโนมัติ

## การตั้งค่าอุปกรณ์

**สำคัญ:** Vendor ID และ Product ID ในโค้ดต้องตรงกับอุปกรณ์ ZW-12027-1 จริง

หาก Vendor/Product ID ไม่ถูกต้อง ให้ตรวจสอบและอัปเดตในไฟล์ `src/ThaiIDCardReader.jsx`:

```javascript
const usbDevice = await navigator.usb.requestDevice({
  filters: [
    { vendorId: 0xXXXX, productId: 0xYYYY } // แทนที่ด้วยค่าจริง
  ]
})
```

## โครงสร้างโปรเจกต์

```
src/
├── App.jsx                 # คอมโพเนนต์หลัก
├── ThaiIDCardReader.jsx    # คอมโพเนนต์อ่านบัตรประชาชน
├── ThaiIDCardReader.css    # สไตล์สำหรับ UI
├── main.jsx               # จุดเริ่มต้นของแอป
└── index.css              # สไตล์หลัก
```

## เทคโนโลยีที่ใช้

- **React 19** - UI Framework
- **Vite** - Build tool และ development server
- **WebUSB API** - เชื่อมต่อกับอุปกรณ์ฮาร์ดแวร์
- **CSS3** - Styling

## การ deploy

สำหรับการใช้งานจริง ต้อง deploy ผ่าน HTTPS เพราะ WebUSB API ทำงานได้เฉพาะ HTTPS เท่านั้น

```bash
npm run build
```

แล้ว deploy ไฟล์ในโฟลเดอร์ `dist` ไปยัง web server ที่รองรับ HTTPS

## ปัญหาที่พบบ่อย

### ไม่พบอุปกรณ์
- ตรวจสอบว่าอุปกรณ์เสียบอยู่และทำงานปกติ
- ตรวจสอบ Vendor ID และ Product ID ในโค้ด

### WebUSB ไม่รองรับ
- ใช้เบราว์เซอร์ Chrome หรือ Edge
- ตรวจสอบว่าเปิดใช้งาน WebUSB ในเบราว์เซอร์แล้ว

### ไม่สามารถอ่านข้อมูล
- ตรวจสอบว่าบัตรประชาชนเสียบถูกทาง
- ลองถอดและเสียบบัตรใหม่

## การ Deploy บน GitHub Pages

### วิธีที่ 1: ใช้ GitHub Actions (แนะนำ)

1. **สร้าง Repository บน GitHub:**
   - ไปที่ https://github.com/new
   - ตั้งชื่อ repository: `thai-id-card-reader`
   - เลือก Public repository

2. **อัปเดตชื่อ Repository ในโค้ด:**
   - แก้ไข `vite.config.js` ให้ `base: '/your-username/thai-id-card-reader/'`
   - แก้ไข `package.json` ให้ `homepage: "https://your-username.github.io/thai-id-card-reader"`

3. **Push โค้ดขึ้น GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/thai-id-card-reader.git
   git push -u origin main
   ```

4. **เปิดใช้งาน GitHub Pages:**
   - ไปที่ Repository Settings > Pages
   - เลือก Source: "GitHub Actions"
   - รอให้ GitHub Actions build และ deploy เสร็จ

### วิธีที่ 2: ใช้ npm deploy

1. **Build และ Deploy:**
   ```bash
   npm run deploy
   ```

2. **เปิดใช้งาน GitHub Pages:**
   - ไปที่ Repository Settings > Pages
   - เลือก Source: "Deploy from a branch"
   - เลือก Branch: `gh-pages` และ Folder: `/ (root)`

## ⚠️ ข้อจำกัดของ GitHub Pages

- **HTTPS Required:** WebUSB API ต้องใช้ HTTPS เท่านั้น
- **User Interaction:** ผู้ใช้ต้อง interact กับหน้าเว็บก่อน
- **Browser Support:** ต้องใช้ Chrome/Edge ที่รองรับ WebUSB

## License

MIT License
