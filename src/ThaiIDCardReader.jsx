import { useState, useEffect } from 'react'
import './ThaiIDCardReader.css'

function ThaiIDCardReader() {
  const [isConnected, setIsConnected] = useState(false)
  const [cardData, setCardData] = useState(null)
  const [device, setDevice] = useState(null)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState('')

  // ตรวจสอบและจัดการ service ที่ขัดแย้ง
  const checkConflictingServices = async () => {
    try {
      setError('')
      setIsReading(true)

      // ตรวจสอบ PC/SC service (Windows)
      const pcscStatus = await checkPCSCService()

      if (pcscStatus.running) {
        setError('⚠️ พบ PC/SC Service ทำงานอยู่:\n\n' +
          'PC/SC Service อาจขัดแย้งกับ WebUSB\n\n' +
          '🔧 วิธีแก้ไข:\n' +
          '1. เปิด Services (services.msc)\n' +
          '2. หา "Smart Card"\n' +
          '3. หยุด service ชั่วคราว\n' +
          '4. ลองเชื่อมต่ออุปกรณ์ใหม่\n\n' +
          'หรือใช้คำสั่งใน Command Prompt:\n' +
          'net stop "Smart Card"')
      } else {
        setError('✅ ไม่พบ PC/SC Service ที่ทำงานอยู่\n\n' +
          'หากยังมีปัญหา ให้ลอง:\n' +
          '• รีสตาร์ทคอมพิวเตอร์\n' +
          '• ตรวจสอบ driver ของอุปกรณ์\n' +
          '• ลองใช้ USB port อื่น')
      }

    } catch (err) {
      console.error('Error checking services:', err)
      setError('ไม่สามารถตรวจสอบ service ได้: ' + err.message)
    } finally {
      setIsReading(false)
    }
  }

  // ตรวจสอบ PC/SC service
  const checkPCSCService = async () => {
    // ในสภาพแวดล้อมจริง อาจต้องใช้ API อื่นในการตรวจสอบ
    // ณ ตอนนี้ให้ return ค่าเริ่มต้น
    return { running: false, message: 'ไม่สามารถตรวจสอบได้' }
  }

  // ตรวจสอบอุปกรณ์ที่เชื่อมต่ออยู่
  const checkConnectedDevices = async () => {
    try {
      const devices = await navigator.usb.getDevices()
      console.log('Connected USB devices:', devices)

      if (devices.length === 0) {
        setError('ไม่พบอุปกรณ์ USB ที่เชื่อมต่ออยู่\n\n' +
          'กรุณา:\n' +
          '• เสียบอุปกรณ์ ZW-12027-1 เข้ากับคอมพิวเตอร์\n' +
          '• ตรวจสอบสายเชื่อมต่อ\n' +
          '• ตรวจสอบว่าอุปกรณ์ได้รับพลังงาน')
      } else {
        setError(`พบ ${devices.length} อุปกรณ์ USB ที่เชื่อมต่ออยู่\n` +
          'กรุณาคลิก "เชื่อมต่ออุปกรณ์" เพื่อเลือกอุปกรณ์ที่ต้องการใช้')
      }
    } catch (err) {
      console.error('Error checking devices:', err)
      setError('ไม่สามารถตรวจสอบอุปกรณ์ได้: ' + err.message)
    }
  }

  // เชื่อมต่อกับอุปกรณ์ ZW-12027-1
  const connectDevice = async () => {
    try {
      setError('')
      setIsReading(true)

      // ตรวจสอบว่ามีอุปกรณ์ที่เชื่อมต่ออยู่แล้วหรือไม่
      if (device && device.opened) {
        setError('อุปกรณ์ได้เชื่อมต่ออยู่แล้ว กรุณาตัดการเชื่อมต่อก่อน')
        return
      }

      // ขอสิทธิ์เข้าถึงอุปกรณ์ USB
      const usbDevice = await navigator.usb.requestDevice({
        filters: [] // ลบ filters ออกเพื่อให้เลือกอุปกรณ์ได้ทุกตัว
      })

      // ตรวจสอบว่าอุปกรณ์ถูกใช้งานโดยโปรแกรมอื่นหรือไม่
      if (usbDevice.opened) {
        setError('อุปกรณ์ถูกใช้งานโดยโปรแกรมอื่น กรุณาปิดโปรแกรมนั้นก่อน')
        return
      }

      // พยายามเปิดอุปกรณ์
      try {
        await usbDevice.open()
      } catch (openError) {
        console.error('Error opening device:', openError)

        if (openError.name === 'SecurityError') {
          // ตรวจสอบว่าเป็น localhost หรือ GitHub Pages
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          const isGitHubPages = window.location.hostname.includes('github.io')

          let errorMessage = 'ไม่สามารถเปิดอุปกรณ์ได้ - การเข้าถึงถูกปฏิเสธ:\n\n'

          if (isGitHubPages) {
            errorMessage += '🌐 ปัญหา GitHub Pages:\n' +
              '• WebUSB อาจไม่ทำงานบน GitHub Pages\n' +
              '• Browser บล็อกการเข้าถึง USB บน third-party domains\n' +
              '• SSL certificate อาจยังไม่พร้อม\n\n' +
              '✅ วิธีแก้ไข:\n' +
              '1. คลิก "เปิดในเครื่อง" ด้านล่าง\n' +
              '2. หรือรัน: npm run dev\n' +
              '3. เปิด http://localhost:3000\n\n'
          }

          errorMessage += '🚨 สาเหตุอื่นๆ:\n' +
            '• อุปกรณ์ถูกใช้งานโดยโปรแกรมอื่น (PC/SC)\n' +
            '• ไม่มีสิทธิ์ในการเข้าถึงอุปกรณ์\n' +
            '• Driver ของอุปกรณ์ขัดแย้ง\n\n' +
            '🔧 วิธีแก้ไขเพิ่มเติม:\n' +
            '1. ปิดโปรแกรมที่อาจใช้ USB\n' +
            '2. ถอดและเสียบอุปกรณ์ใหม่\n' +
            '3. รีสตาร์ทเบราว์เซอร์\n' +
            '4. ใช้ Chrome แทน Edge\n' +
            '5. รัน Browser as Administrator'

          setError(errorMessage)
          return
        }
        throw openError
      }

      // ตรวจสอบ configurations ที่มีอยู่
      if (usbDevice.configuration === null) {
        await usbDevice.selectConfiguration(1)
      }

      await usbDevice.claimInterface(0)

      setDevice(usbDevice)
      setIsConnected(true)

      // แสดงข้อมูลอุปกรณ์
      const info = {
        vendorId: usbDevice.vendorId,
        productId: usbDevice.productId,
        productName: usbDevice.productName,
        manufacturerName: usbDevice.manufacturerName
      }
      setDeviceInfo(info)
      console.log('Connected device:', info)

      // อ่านข้อมูลจากบัตร
      await readCardData(usbDevice)

    } catch (err) {
      console.error('Error connecting to device:', err)

      let errorMessage = 'ไม่สามารถเชื่อมต่อกับอุปกรณ์ได้'

      if (err.name === 'SecurityError') {
        errorMessage = 'การเข้าถึงอุปกรณ์ถูกปฏิเสธ:\n\n' +
          '🔧 วิธีแก้ไข:\n' +
          '1. ตรวจสอบว่าอุปกรณ์ไม่ได้ถูกใช้งานโดยโปรแกรมอื่น\n' +
          '2. ปิดโปรแกรมที่อาจใช้ USB (เช่น PC/SC, smart card readers)\n' +
          '3. รีสตาร์ทเบราว์เซอร์และลองใหม่\n' +
          '4. ตรวจสอบสิทธิ์ของเบราว์เซอร์ในการเข้าถึง USB\n' +
          '5. ลองใช้เบราว์เซอร์ Chrome หรือ Edge เวอร์ชันล่าสุด'
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'ผู้ใช้ปฏิเสธการเข้าถึงอุปกรณ์:\n\n' +
          'กรุณาคลิก "อนุญาต" เมื่อเบราว์เซอร์ถามถึงการเข้าถึงอุปกรณ์'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'ไม่พบอุปกรณ์ที่เลือก:\n\n' +
          'กรุณาตรวจสอบ:\n' +
          '• อุปกรณ์เสียบเข้ากับคอมพิวเตอร์แล้ว\n' +
          '• สายเชื่อมต่อไม่ชำรุด\n' +
          '• อุปกรณ์ได้รับพลังงานเพียงพอ'
      } else if (err.message) {
        errorMessage += ': ' + err.message
      }

      setError(errorMessage)
    } finally {
      setIsReading(false)
    }
  }

  // อ่านข้อมูลจากบัตรประชาชน
  const readCardData = async (usbDevice) => {
    try {
      // ส่งคำสั่ง APDU สำหรับอ่านข้อมูลบัตรประชาชนไทย
      const selectFileCommand = new Uint8Array([
        0x00, 0xA4, 0x04, 0x00, 0x08, // SELECT FILE
        0xA0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01 // AID สำหรับบัตรประชาชนไทย
      ])

      await usbDevice.transferOut(1, selectFileCommand)

      // อ่านข้อมูลส่วนตัว
      const readPersonalDataCommand = new Uint8Array([
        0x00, 0xB0, 0x00, 0x00, 0x00 // READ BINARY
      ])

      const result = await usbDevice.transferIn(1, 256)
      const data = new Uint8Array(result.data.buffer)

      // แปลงข้อมูลเป็น string และ parse
      const thaiText = new TextDecoder('tis-620').decode(data)
      const parsedData = parseThaiIDData(thaiText)

      setCardData(parsedData)

    } catch (err) {
      console.error('Error reading card data:', err)
      setError('ไม่สามารถอ่านข้อมูลบัตรได้: ' + err.message)
    }
  }

  // แปลงข้อมูลบัตรประชาชนไทย
  const parseThaiIDData = (rawData) => {
    // ตัวอย่างการ parse ข้อมูล (ต้องปรับตาม format จริง)
    const lines = rawData.split('\n')
    return {
      citizenId: lines[0]?.trim() || '',
      thaiName: lines[1]?.trim() || '',
      englishName: lines[2]?.trim() || '',
      birthDate: lines[3]?.trim() || '',
      address: lines[4]?.trim() || '',
      issueDate: lines[5]?.trim() || '',
      expireDate: lines[6]?.trim() || ''
    }
  }

  // บันทึกข้อมูลเป็นไฟล์ JSON
  const saveDataAsJSON = () => {
    if (!cardData) return

    const dataToSave = {
      ...cardData,
      deviceInfo,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thai-id-data-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ตัดการเชื่อมต่อ
  const disconnectDevice = async () => {
    if (device) {
      try {
        await device.close()
        setDevice(null)
        setIsConnected(false)
        setCardData(null)
        setDeviceInfo(null)
        setError('')
      } catch (err) {
        console.error('Error disconnecting:', err)
        setError('เกิดข้อผิดพลาดในการตัดการเชื่อมต่อ: ' + err.message)
      }
    }
  }

  // รีเซ็ตอุปกรณ์
  const resetDevice = async () => {
    if (device) {
      try {
        setError('')
        setIsReading(true)

        // รีเซ็ตอุปกรณ์
        await device.reset()

        // ปิดและเปิดอุปกรณ์ใหม่
        await device.close()
        await device.open()
        await device.selectConfiguration(1)
        await device.claimInterface(0)

        setError('รีเซ็ตอุปกรณ์สำเร็จ กรุณาอ่านข้อมูลบัตรใหม่')

      } catch (err) {
        console.error('Error resetting device:', err)
        setError('ไม่สามารถรีเซ็ตอุปกรณ์ได้: ' + err.message)
      } finally {
        setIsReading(false)
      }
    } else {
      setError('ไม่มีอุปกรณ์ที่เชื่อมต่ออยู่')
    }
  }

  return (
    <div className="thai-id-reader">
      <h1>เครื่องอ่านบัตรประชาชนไทย</h1>
      <h2>อุปกรณ์: ZW-12027-1</h2>

      <div className="connection-status">
        <p>สถานะ: {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}</p>
        {!isConnected ? (
          <div className="connection-controls">
            <button
              onClick={connectDevice}
              disabled={isReading || !navigator.usb}
              className="connect-btn"
            >
              {isReading ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่ออุปกรณ์'}
            </button>
            <button
              onClick={checkConnectedDevices}
              disabled={isReading || !navigator.usb}
              className="check-btn"
            >
              ตรวจสอบอุปกรณ์
            </button>
            <button
              onClick={checkConflictingServices}
              disabled={isReading || !navigator.usb}
              className="service-btn"
            >
              ตรวจสอบ Service
            </button>
          </div>
        ) : (
          <div className="connected-controls">
            <button onClick={disconnectDevice} className="disconnect-btn">
              ตัดการเชื่อมต่อ
            </button>
            <button onClick={resetDevice} disabled={isReading} className="reset-btn">
              {isReading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตอุปกรณ์'}
            </button>
          </div>
        )}
      </div>

      {deviceInfo && (
        <div className="device-info">
          <h3>ข้อมูลอุปกรณ์</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Vendor ID:</label>
              <span>0x{deviceInfo.vendorId?.toString(16).toUpperCase()}</span>
            </div>
            <div className="data-item">
              <label>Product ID:</label>
              <span>0x{deviceInfo.productId?.toString(16).toUpperCase()}</span>
            </div>
            <div className="data-item">
              <label>ชื่ออุปกรณ์:</label>
              <span>{deviceInfo.productName || 'ไม่ระบุ'}</span>
            </div>
            <div className="data-item">
              <label>ผู้ผลิต:</label>
              <span>{deviceInfo.manufacturerName || 'ไม่ระบุ'}</span>
            </div>
          </div>
          <p className="device-note">
            <strong>หมายเหตุ:</strong> จด Vendor ID และ Product ID ไว้เพื่อปรับแต่งโค้ดให้ทำงานกับอุปกรณ์นี้โดยตรง
          </p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>⚠️ ข้อผิดพลาด</h4>
          <p>{error}</p>
        </div>
      )}

      {cardData && (
        <div className="card-data">
          <div className="card-header">
            <h3>ข้อมูลบัตรประชาชน</h3>
            <button onClick={saveDataAsJSON} className="save-btn">
              บันทึกข้อมูล
            </button>
          </div>
          <div className="data-grid">
            <div className="data-item">
              <label>เลขบัตรประชาชน:</label>
              <span>{cardData.citizenId}</span>
            </div>
            <div className="data-item">
              <label>ชื่อภาษาไทย:</label>
              <span>{cardData.thaiName}</span>
            </div>
            <div className="data-item">
              <label>ชื่อภาษาอังกฤษ:</label>
              <span>{cardData.englishName}</span>
            </div>
            <div className="data-item">
              <label>วันเกิด:</label>
              <span>{cardData.birthDate}</span>
            </div>
            <div className="data-item">
              <label>ที่อยู่:</label>
              <span>{cardData.address}</span>
            </div>
            <div className="data-item">
              <label>วันที่ออกบัตร:</label>
              <span>{cardData.issueDate}</span>
            </div>
            <div className="data-item">
              <label>วันที่หมดอายุ:</label>
              <span>{cardData.expireDate}</span>
            </div>
          </div>
        </div>
      )}

      <div className="instructions">
        <h4>วิธีใช้งาน:</h4>
        <ol>
          <li>เสียบบุปกรณ์ ZW-12027-1 เข้ากับคอมพิวเตอร์</li>
          <li>คลิกปุ่ม "เชื่อมต่ออุปกรณ์"</li>
          <li>เลือกอุปกรณ์จากรายการที่ปรากฏและอนุญาตการเข้าถึง</li>
          <li>เสียบบัตรประชาชนลงในเครื่องอ่าน</li>
          <li>ข้อมูลจะแสดงขึ้นมาอัตโนมัติ</li>
        </ol>
        <h4>แก้ไขปัญหา:</h4>
        <ul>
          <li><strong>Access denied:</strong> ตรวจสอบว่าอุปกรณ์ไม่ได้ถูกใช้งานโดยโปรแกรมอื่น</li>
          <li><strong>อุปกรณ์ไม่ตอบสนอง:</strong> ลองใช้ปุ่ม "รีเซ็ตอุปกรณ์"</li>
          <li><strong>ไม่พบอุปกรณ์:</strong> ตรวจสอบสายเชื่อมต่อและรีสตาร์ทอุปกรณ์</li>
          <li><strong>เบราว์เซอร์ไม่รองรับ:</strong> ใช้ Chrome หรือ Edge เวอร์ชันล่าสุด</li>
          <li><strong>PC/SC Service:</strong> ลองปิด Smart Card Service ใน Windows Services</li>
        </ul>
        <div className="troubleshooting-commands">
          <h5>คำสั่งสำหรับแก้ไขปัญหา (Windows):</h5>
          <div className="command-list">
            <code>net stop "Smart Card"</code> - หยุด PC/SC Service<br/>
            <code>services.msc</code> - เปิด Windows Services<br/>
            <code>devmgmt.msc</code> - เปิด Device Manager
          </div>
        </div>
        <p><strong>หมายเหตุ:</strong> ต้องใช้เบราว์เซอร์ที่รองรับ WebUSB API (Chrome 61+, Edge 79+) และทำงานบน HTTPS หรือ localhost</p>
      </div>
    </div>
  )
}

export default ThaiIDCardReader
