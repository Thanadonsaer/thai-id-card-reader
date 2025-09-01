# เครื่องอ่านบัตรประชาชนไทย

เว็บแอปพลิเคชันสำหรับอ่านข้อมูลบัตรประชาชนไทยโดยใช้ React + Vite และอุปกรณ์ ZW-12027-1

## คุณสมบัติ

- เชื่อมต่อกับอุปกรณ์อ่านบัตร ZW-12027-1 ## ⚠️ ปัญหาที่พบบน GitHub Pages

### **SecurityError: Access denied**

นี่เป็นปัญหาปกติสำหรับ WebUSB API บน GitHub Pages เพราะ:

1. **HTTPS Certificate:** GitHub Pages ใช้ HTTPS แต่อาจต้องรอ certificate โหลดเสร็จ
2. **Browser Security:** บาง browser จะ block WebUSB บน third-party domains
3. **User Interaction:** ต้องมี interaction จากผู้ใช้ก่อนถึงจะใช้ WebUSB ได้

### **วิธีแก้ไข:**

#### **วิธีที่ 1: รอและลองใหม่**
1. รอ 10-30 วินาทีให้ certificate โหลดเสร็จ
2. คลิก "รีเฟรชหน้าเว็บ" ในแอป
3. ลองเชื่อมต่ออุปกรณ์อีกครั้ง

#### **วิธีที่ 2: ใช้ในเครื่อง (แนะนำ)**
```bash
# รันในเครื่อง
npm run dev

# แล้วเปิด http://localhost:3000
```
คลิก "เปิดในเครื่อง" ในแอปเพื่อเปิด localhost

#### **วิธีที่ 3: ใช้ Browser ที่รองรับ**
- **Google Chrome** เวอร์ชันล่าสุด
- **Microsoft Edge** เวอร์ชันล่าสุด
- เปิด Developer Tools (F12) และตรวจสอบ Console

#### **วิธีที่ 4: ตรวจสอบ Browser Settings**
1. ไปที่ `chrome://flags/#enable-webusb`
2. เปิดใช้งาน "Enable WebUSB API"
3. รีสตาร์ท browser

### **สาเหตุของปัญหา:**

- **GitHub Pages Limitations:** เป็น static hosting มีข้อจำกัดด้าน security
- **WebUSB Requirements:** ต้องใช้ HTTPS และ user interaction
- **Browser Policies:** บาง browser จำกัด WebUSB บน external domains

### **ทางแก้ที่แนะนำ:**

**รันในเครื่องก่อน:** `npm run dev` แล้วเปิด `http://localhost:3000`

สำหรับ production จริงๆ ควร deploy บน web server ที่มี HTTPS และ SSL certificate ที่น่าเชื่อถือ

## 🔧 การแก้ไขปัญหา Permission

หากเจอ error "Permission denied":

1. **ตรวจสอบ Repository Settings:**
   - ไปที่ Repository Settings > Actions > General
   - เลือก "Read and write permissions" สำหรับ GITHUB_TOKEN

2. **หรือใช้ Personal Access Token:**
   - สร้าง Personal Access Token ใน GitHub Settings > Developer settings
   - เพิ่มเป็น secret ใน Repository Settings > Secrets and variables > Actions
   - ชื่อ secret: `ACCESS_TOKEN`
   - อัปเดต workflow ให้ใช้ `secrets.ACCESS_TOKEN` แทน `secrets.GITHUB_TOKEN`

3. **ตรวจสอบ Branch Protection:**
   - หากมี branch protection rules ให้ตรวจสอบว่า GitHub Actions สามารถ push ได้

## 📊 สถานะ Deployment

หลังจาก push โค้ดแล้ว:
- ไปที่ Repository > Actions เพื่อดูสถานะ build
- ไปที่ Repository > Settings > Pages เพื่อดูสถานะ deployment
- URL ของแอป: `https://Thanadonsaer.github.io/thai-id-card-reader/`SB API
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

### วิธีที่ 1: ใช้ GitHub Actions (แนะนำ - อัตโนมัติ)

1. **สร้าง Repository บน GitHub:**
   - ไปที่ https://github.com/new
   - ตั้งชื่อ repository: `thai-id-card-reader`
   - เลือก Public repository

2. **Push โค้ดขึ้น GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Thai ID Card Reader"
   git branch -M main
   git remote add origin https://github.com/Thanadonsaer/thai-id-card-reader.git
   git push -u origin main
   ```

3. **เปิดใช้งาน GitHub Pages:**
   - ไปที่ Repository Settings > Pages
   - เลือก Source: "GitHub Actions"
   - รอให้ระบบ build และ deploy เสร็จโดยอัตโนมัติ

### วิธีที่ 2: ใช้ npm deploy (แบบ manual)

หากต้องการ deploy ด้วยตนเอง:

```bash
# Build โปรเจกต์
npm run build

# Deploy ขึ้น GitHub Pages
npm run deploy
```

หลังจากนั้นไปเปิดใช้งาน GitHub Pages ใน Settings > Pages โดยเลือก:
- Source: "Deploy from a branch"
- Branch: `gh-pages`
- Folder: `/ (root)`

### วิธีที่ 3: Deploy แบบดั้งเดิม

หากมีปัญหากับวิธีอื่น:

```bash
# Build โปรเจกต์
npm run build

# Copy ไฟล์ในโฟลเดอร์ dist ไปยัง branch gh-pages
# หรือ upload ไฟล์ใน dist ขึ้น GitHub Pages ด้วยตนเอง
```

### วิธีที่ 2: ใช้ npm deploy

1. **Build และ Deploy:**
   ```bash
   npm run deploy
   ```

2. **เปิดใช้งาน GitHub Pages:**
   - ไปที่ Repository Settings > Pages
   - เลือก Source: "Deploy from a branch"
   - เลือก Branch: `gh-pages` และ Folder: `/ (root)`

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
