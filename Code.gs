/**
 * ==============================================================================
 * ระบบรับสมัครเรียนออนไลน์ (โควตา) วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
 * ประจำปีการศึกษา 2570
 * สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา กระทรวงศึกษาธิการ
 * 
 * พัฒนาโดย: แผนกวิชาเทคโนโลยีคอมพิวเตอร์ วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
 * Backend: Google Apps Script + Google Sheets + Google Drive
 * ==============================================================================
 */

// ชื่อชีตหลักในฐานข้อมูล
const SHEETS = {
  APPLICANTS: 'Applicants',
  DOCUMENTS: 'Documents',
  STATUS_LOG: 'StatusLog',
  STAFF: 'Staff',
  SETTINGS: 'Settings'
};

// ชื่อโฟลเดอร์หลักใน Google Drive สำหรับเก็บเอกสารแนบ
const DRIVE_FOLDER_NAME = 'รับสมัครโควตา_2570_วท.ท่าหลวงซิเมนต์ไทยอนุสรณ์';

/**
 * บริการหน้าเว็บสำหรับ Google Apps Script Web App
 */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  
  // API endpoints ผ่าน GET
  if (action === 'getSettings') {
    return createJsonResponse(getPublicSettings());
  } else if (action === 'checkStatus') {
    return createJsonResponse(handleCheckStatus(e.parameter.idCard));
  } else if (action === 'init') {
    return createJsonResponse(initDatabase());
  }

  // แสดงผลหน้าเว็บ HTML
  const template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('ระบบรับสมัครเรียนออนไลน์ (โควตา) 2570 | วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * บริการรับคำขอแบบ POST (AJAX / Fetch API)
 */
function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    const action = data.action;

    switch (action) {
      case 'getSettings':
        return createJsonResponse(getPublicSettings());

      case 'submitApplication':
        return createJsonResponse(handleSubmitApplication(data));

      case 'checkStatus':
        return createJsonResponse(handleCheckStatus(data.idCard));

      case 'reuploadDocument':
        return createJsonResponse(handleReuploadDocument(data));

      case 'staffLogin':
        return createJsonResponse(handleStaffLogin(data));

      case 'getApplicants':
        return createJsonResponse(handleGetApplicants(data));

      case 'getDashboardData':
        return createJsonResponse(handleGetDashboardData(data));

      case 'updateStatus':
        return createJsonResponse(handleUpdateStatus(data));

      case 'enrollApplicant':
        return createJsonResponse(handleEnrollApplicant(data));

      case 'updateSettings':
        return createJsonResponse(handleUpdateSettings(data));

      case 'getStaffList':
        return createJsonResponse(handleGetStaffList(data));

      case 'saveStaff':
        return createJsonResponse(handleSaveStaff(data));

      case 'exportData':
        return createJsonResponse(handleExportData(data));

      default:
        return createJsonResponse({ success: false, message: 'ไม่พบคำสั่งที่ระบุ (Invalid Action)' });
    }
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: 'เกิดข้อผิดพลาดในการประมวลผล: ' + err.toString()
    });
  }
}

/**
 * ตัวช่วยตอบกลับแบบ JSON พร้อมรองรับ CORS
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ดึงหรือสร้างชีตตามชื่อที่กำหนด
 */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * ฟังก์ชันเริ่มต้นฐานข้อมูล: สร้างชีตทั้ง 5 ตาราง และกำหนดค่าเริ่มต้น
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. ตาราง Applicants
  const appSheet = getOrCreateSheet(ss, SHEETS.APPLICANTS);
  if (appSheet.getLastRow() === 0) {
    const appHeaders = [
      'เลขที่ใบสมัคร', 'ปีการศึกษา', 'วันที่สมัคร', 'ระดับที่สมัคร',
      'คำนำหน้า', 'ชื่อ-สกุล', 'วันเดือนปีเกิด', 'เลขบัตรประชาชน',
      'ชื่อบิดา', 'อายุบิดา', 'อาชีพบิดา',
      'ชื่อมารดา', 'อายุมารดา', 'อาชีพมารดา',
      'บ้านเลขที่', 'หมู่', 'ซอย', 'ถนน', 'ตำบล', 'อำเภอ', 'จังหวัด', 'รหัสไปรษณีย์', 'เบอร์โทรศัพท์',
      'ระดับชั้นกำลังศึกษา', 'โรงเรียนเดิม', 'ที่ตั้งโรงเรียน', 'เกรดเฉลี่ย', 'สาขาเดิม',
      'สาขาอันดับ1', 'สาขาอันดับ2',
      'สถานะ', 'หมายเหตุเจ้าหน้าที่', 'รหัสนักเรียน', 'วันที่มอบตัว', 'เล่มที่/เลขที่ใบเสร็จ', 'ยินยอมPDPA'
    ];
    appSheet.appendRow(appHeaders);
    appSheet.getRange(1, 1, 1, appHeaders.length)
      .setBackground('#1F3A5F')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    appSheet.setFrozenRows(1);
  }

  // 2. ตาราง Documents
  const docSheet = getOrCreateSheet(ss, SHEETS.DOCUMENTS);
  if (docSheet.getLastRow() === 0) {
    const docHeaders = ['เลขที่ใบสมัคร', 'เลขบัตรประชาชน', 'ประเภทเอกสาร', 'ชื่อไฟล์', 'DriveFileId', 'DriveViewUrl', 'วันที่อัปโหลด'];
    docSheet.appendRow(docHeaders);
    docSheet.getRange(1, 1, 1, docHeaders.length)
      .setBackground('#1F3A5F')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    docSheet.setFrozenRows(1);
  }

  // 3. ตาราง StatusLog
  const logSheet = getOrCreateSheet(ss, SHEETS.STATUS_LOG);
  if (logSheet.getLastRow() === 0) {
    const logHeaders = ['วันเวลา', 'เลขที่ใบสมัคร', 'เลขบัตรประชาชน', 'สถานะเดิม', 'สถานะใหม่', 'ผู้ดำเนินการ', 'หมายเหตุ'];
    logSheet.appendRow(logHeaders);
    logSheet.getRange(1, 1, 1, logHeaders.length)
      .setBackground('#1F3A5F')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    logSheet.setFrozenRows(1);
  }

  // 4. ตาราง Staff
  const staffSheet = getOrCreateSheet(ss, SHEETS.STAFF);
  if (staffSheet.getLastRow() === 0) {
    const staffHeaders = ['Username', 'PasswordHash', 'ชื่อ-สกุล', 'ตำแหน่ง/สิทธิ์', 'เบอร์โทรศัพท์', 'สถานะใช้งาน'];
    staffSheet.appendRow(staffHeaders);
    staffSheet.getRange(1, 1, 1, staffHeaders.length)
      .setBackground('#1F3A5F')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    staffSheet.setFrozenRows(1);

    // สร้างบัญชีเริ่มต้น: Admin และ Registrar
    // Default pass: admin2570 และ reg2570
    staffSheet.appendRow(['admin', hashPassword('admin2570'), 'ผู้ดูแลระบบ งานเทคโนโลยีสารสนเทศ', 'ผู้ดูแลระบบ', '036-281295', 'ACTIVE']);
    staffSheet.appendRow(['reg01', hashPassword('reg2570'), 'เจ้าหน้าที่ งานทะเบียนและวัดผล', 'เจ้าหน้าที่ทะเบียน', '036-281295', 'ACTIVE']);
  }

  // 5. ตาราง Settings
  const setSheet = getOrCreateSheet(ss, SHEETS.SETTINGS);
  if (setSheet.getLastRow() === 0) {
    const setHeaders = ['หมวดหมู่ (Key)', 'ค่า (Value)', 'คำอธิบาย'];
    setSheet.appendRow(setHeaders);
    setSheet.getRange(1, 1, 1, setHeaders.length)
      .setBackground('#1F3A5F')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    setSheet.setFrozenRows(1);

    const defaultSettings = [
      ['ADMISSION_STATUS', 'OPEN', 'สถานะรับสมัคร (OPEN/CLOSED)'],
      ['ACADEMIC_YEAR', '2570', 'ปีการศึกษา'],
      ['ADMISSION_START', '2026-11-01', 'วันที่เปิดรับสมัคร'],
      ['ADMISSION_END', '2027-02-28', 'วันที่ปิดรับสมัคร'],
      ['ANNOUNCEMENT_DATE', '2027-03-05', 'วันประกาศผลการคัดเลือก'],
      ['ENROLLMENT_DATE', '2027-03-15', 'วันรายงานตัวและมอบตัว'],
      ['COLLEGE_NAME', 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์', 'ชื่อสถานศึกษา'],
      ['LINE_NOTIFY_TOKEN', '', 'Token สำหรับแจ้งเตือนผ่าน LINE'],
      ['ADMIN_EMAIL', 'admission@tl.ac.th', 'อีเมลสำหรับรับการแจ้งเตือน'],
      ['BRANCHES_VOC', JSON.stringify([
        "เทคโนโลยีสารสนเทศ", "การบัญชี", "เทคโนโลยีธุรกิจดิจิทัล", "การตลาด",
        "ไฟฟ้ากำลัง", "อิเล็กทรอนิกส์", "เทคนิคคอมพิวเตอร์", "เทคนิคการผลิต",
        "ซ่อมบำรุงอุตสาหกรรม", "ยานยนต์", "เมคคาทรอนิกส์"
      ]), 'รายชื่อสาขาวิชาระดับ ปวช.'],
      ['BRANCHES_DIP', JSON.stringify([
        "เทคโนโลยีสารสนเทศ", "การบัญชี", "เทคโนโลยีธุรกิจดิจิทัล", "การตลาด",
        "ไฟฟ้ากำลัง", "อิเล็กทรอนิกส์", "เทคโนโลยีคอมพิวเตอร์", "เทคนิคการผลิต",
        "ซ่อมบำรุงอุตสาหกรรม", "ยานยนต์", "เมคคาทรอนิกส์"
      ]), 'รายชื่อสาขาวิชาระดับ ปวส.'],
      ['HOME_NOTICE', 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ เปิดรับสมัครนักเรียน นักศึกษาใหม่ ประเภทโควตา ประจำปีการศึกษา 2570 สำหรับผู้สำเร็จการศึกษาระดับ ม.3, ปวช. และ ม.6 ที่มีผลการเรียนและความประพฤติดี', 'ข้อความประกาศหน้าแรก']
    ];

    defaultSettings.forEach(row => setSheet.appendRow(row));
  }

  // สร้างโฟลเดอร์ Google Drive หากยังไม่มี
  getOrCreateDriveFolder();

  return { success: true, message: 'ติดตั้งและตั้งค่าฐานข้อมูล Google Sheets เรียบร้อยแล้ว' };
}

/**
 * แฮชรหัสผ่านด้วย SHA-256
 */
function hashPassword(str) {
  if (!str) return '';
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  let txt = '';
  for (let j = 0; j < rawHash.length; j++) {
    let hashVal = rawHash[j];
    if (hashVal < 0) hashVal += 256;
    let byteString = hashVal.toString(16);
    if (byteString.length == 1) byteString = '0' + byteString;
    txt += byteString;
  }
  return txt;
}

/**
 * ดึงหรือสร้างโฟลเดอร์ใน Google Drive สำหรับจัดเก็บไฟล์แนบ
 */
function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

/**
 * ดึงค่าการตั้งค่าทั้งหมด
 */
function getSettingsMap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const setSheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!setSheet) {
    initDatabase();
    return getSettingsMap();
  }
  const data = setSheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    const val = data[i][1];
    map[key] = val;
  }
  return map;
}

/**
 * ดึงการตั้งค่าสำหรับหน้าเว็บสาธารณะ (ไม่ส่งข้อมูลลับเช่น Token)
 */
function getPublicSettings() {
  const map = getSettingsMap();
  let branchesVoc = [];
  let branchesDip = [];

  try {
    branchesVoc = JSON.parse(map['BRANCHES_VOC'] || '[]');
  } catch (e) {
    branchesVoc = [];
  }

  try {
    branchesDip = JSON.parse(map['BRANCHES_DIP'] || '[]');
  } catch (e) {
    branchesDip = [];
  }

  return {
    success: true,
    admissionStatus: map['ADMISSION_STATUS'] || 'OPEN',
    academicYear: map['ACADEMIC_YEAR'] || '2570',
    startDate: map['ADMISSION_START'] || '',
    endDate: map['ADMISSION_END'] || '',
    announcementDate: map['ANNOUNCEMENT_DATE'] || '',
    enrollmentDate: map['ENROLLMENT_DATE'] || '',
    collegeName: map['COLLEGE_NAME'] || 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
    homeNotice: map['HOME_NOTICE'] || '',
    branchesVoc: branchesVoc,
    branchesDip: branchesDip
  };
}

/**
 * ตรวจสอบความถูกต้องของเลขประจำตัวประชาชน 13 หลักตามมาตรฐานไทย (Checksum)
 */
function validateThaiNationalId(id) {
  if (!id || typeof id !== 'string') return false;
  id = id.trim();
  if (id.length !== 13 || !/^\d{13}$/.test(id)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(id.charAt(12), 10);
}

/**
 * ออกเลขที่ใบสมัครอัตโนมัติ เช่น Q70-0001
 */
function generateApplicationNumber(appSheet, academicYear) {
  const yr = String(academicYear || '2570').slice(-2); // 70
  const prefix = 'Q' + yr + '-';
  const lastRow = appSheet.getLastRow();
  
  if (lastRow <= 1) {
    return prefix + '0001';
  }

  const values = appSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let maxSeq = 0;
  values.forEach(row => {
    const code = String(row[0]).trim();
    if (code.startsWith(prefix)) {
      const numPart = parseInt(code.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return prefix + ('0000' + nextSeq).slice(-4);
}

/**
 * ตรวจสอบการสมัครซ้ำด้วยเลขบัตรประชาชนในปีการศึกษาเดียวกัน
 */
function checkDuplicateApplication(appSheet, idCard, academicYear) {
  const lastRow = appSheet.getLastRow();
  if (lastRow <= 1) return false;
  
  const values = appSheet.getRange(2, 1, lastRow - 1, 8).getValues();
  for (let i = 0; i < values.length; i++) {
    const rowYear = String(values[i][1]).trim();
    const rowIdCard = String(values[i][7]).trim();
    if (rowYear === String(academicYear) && rowIdCard === String(idCard).trim()) {
      return values[i][0]; // คืนค่าเลขที่ใบสมัครเดิม
    }
  }
  return false;
}

/**
 * ฟังก์ชันบันทึกการส่งใบสมัครใหม่ (Submit Application)
 */
function handleSubmitApplication(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = getSettingsMap();

  // 1. ตรวจสอบสถานะการเปิดรับสมัคร
  if (settings['ADMISSION_STATUS'] !== 'OPEN') {
    return {
      success: false,
      message: 'ระบบปิดรับสมัครแล้ว หรือยังไม่ถึงช่วงเวลาการเปิดรับสมัคร'
    };
  }

  // 2. ตรวจสอบความถูกต้องของเลขบัตรประชาชน
  const idCard = String(data.idCard || '').trim();
  if (!validateThaiNationalId(idCard)) {
    return {
      success: false,
      message: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักการคำนวณ'
    };
  }

  const academicYear = settings['ACADEMIC_YEAR'] || '2570';
  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);

  // 3. ตรวจสอบการสมัครซ้ำ
  const existingAppNo = checkDuplicateApplication(appSheet, idCard, academicYear);
  if (existingAppNo) {
    return {
      success: false,
      message: 'เลขประจำตัวประชาชนนี้ได้สมัครรับการคัดเลือกแล้ว (เลขที่ใบสมัคร: ' + existingAppNo + ')'
    };
  }

  // 4. ตรวจสอบข้อมูลบังคับ
  if (!data.level || !data.fullName || !data.phone || !data.gpax || !data.branch1) {
    return {
      success: false,
      message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
    };
  }

  // ตรวจสอบเงื่อนไขสาขา ปวช. อันดับ 1 และ 2 ห้ามซ้ำ
  if (data.level === 'ปวช.' && data.branch1 && data.branch2 && data.branch1 === data.branch2) {
    return {
      success: false,
      message: 'สาขาวิชาอันดับที่ 1 และอันดับที่ 2 ต้องไม่ซ้ำกัน'
    };
  }

  // 5. ออกเลขที่ใบสมัคร
  const applicationNo = generateApplicationNumber(appSheet, academicYear);
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  // 6. บันทึกข้อมูลลงชีต Applicants
  const newRow = [
    applicationNo,
    academicYear,
    formattedDate,
    data.level || '',
    data.prefix || '',
    data.fullName || '',
    data.birthDate || '',
    idCard,
    data.fatherName || '',
    data.fatherAge || '',
    data.fatherJob || '',
    data.motherName || '',
    data.motherAge || '',
    data.motherJob || '',
    data.addressNo || '',
    data.moo || '',
    data.soi || '',
    data.road || '',
    data.subdistrict || '',
    data.district || '',
    data.province || '',
    data.zipcode || '',
    data.phone || '',
    data.currentClass || '',
    data.oldSchool || '',
    data.schoolLocation || '',
    parseFloat(data.gpax) || 0.0,
    data.oldMajor || '',
    data.branch1 || '',
    data.branch2 || '',
    'รอตรวจสอบ', // สถานะเริ่มต้น
    '',          // หมายเหตุ
    '',          // รหัสนักเรียน (ออกเมื่อมอบตัว)
    '',          // วันที่มอบตัว
    '',          // ใบเสร็จ
    data.pdpaConsent ? 'ยินยอม' : 'ไม่ยินยอม'
  ];

  appSheet.appendRow(newRow);

  // 7. จัดการอัปโหลดเอกสารแนบไปยัง Google Drive
  const uploadedFiles = [];
  const rootFolder = getOrCreateDriveFolder();
  // สร้างโฟลเดอร์ย่อยเฉพาะของผู้สมัครรายนี้: "Q70-xxxx_ชื่อ-สกุล"
  const applicantFolderName = applicationNo + '_' + (data.fullName || '').replace(/[\/\\:*?"<>|]/g, '_');
  const applicantFolder = rootFolder.createFolder(applicantFolderName);

  const docSheet = ss.getSheetByName(SHEETS.DOCUMENTS);

  // รายการเอกสารที่อาจถูกส่งมา (รูปถ่าย, ปพ.1, บัตรปชช/ทะเบียนบ้าน, เกียรติบัตร)
  const docFields = [
    { key: 'filePhoto', type: 'รูปถ่ายหน้าตรงขนาด 1 นิ้ว' },
    { key: 'fileTranscript', type: 'เอกสารแสดงผลการเรียน 5 ภาคเรียน' },
    { key: 'fileIdCard', type: 'สำเนาบัตรประชาชน/ทะเบียนบ้าน' },
    { key: 'fileCertificate', type: 'สำเนาเกียรติบัตร/ผลงาน' }
  ];

  docFields.forEach(field => {
    if (data[field.key] && data[field.key].base64) {
      try {
        const fileObj = data[field.key];
        const contentType = fileObj.mimeType || 'application/octet-stream';
        const decodedBytes = Utilities.base64Decode(fileObj.base64);
        const ext = getExtensionFromMime(contentType);
        const fileName = applicationNo + '_' + field.type + ext;
        const blob = Utilities.newBlob(decodedBytes, contentType, fileName);
        const file = applicantFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        const fileId = file.getId();
        const fileUrl = file.getUrl();

        // บันทึกลง Documents sheet
        docSheet.appendRow([
          applicationNo,
          idCard,
          field.type,
          fileName,
          fileId,
          fileUrl,
          formattedDate
        ]);

        uploadedFiles.push({
          type: field.type,
          name: fileName,
          url: fileUrl
        });
      } catch (uploadErr) {
        // หากไฟล์เดี่ยวล้มเหลว ให้บันทึกแต่ไม่ขัดขวางกระบวนการหลัก
      }
    }
  });

  // 8. บันทึกประวัติสถานะ (StatusLog)
  const logSheet = ss.getSheetByName(SHEETS.STATUS_LOG);
  logSheet.appendRow([
    formattedDate,
    applicationNo,
    idCard,
    '-',
    'รอตรวจสอบ',
    'ผู้สมัคร (ระบบออนไลน์)',
    'ส่งใบสมัครเรียบร้อยแล้ว'
  ]);

  // 9. แจ้งเตือนไปยังเจ้าหน้าที่ (LINE / Email)
  try {
    const notifyMsg = 'มีผู้สมัครโควตาใหม่ 2570\n' +
      'เลขที่: ' + applicationNo + '\n' +
      'ชื่อ-สกุล: ' + (data.prefix || '') + (data.fullName || '') + '\n' +
      'ระดับ: ' + data.level + '\n' +
      'สาขา: ' + data.branch1 + '\n' +
      'เกรด: ' + data.gpax + '\n' +
      'โรงเรียนเดิม: ' + (data.oldSchool || '-') + '\n' +
      'เบอร์โทร: ' + data.phone;
    sendNotification(settings, notifyMsg);
  } catch (notifyErr) {}

  return {
    success: true,
    message: 'บันทึกข้อมูลการสมัครเรียบร้อยแล้ว',
    applicationNo: applicationNo,
    applicantData: {
      applicationNo: applicationNo,
      academicYear: academicYear,
      date: formattedDate,
      level: data.level,
      prefix: data.prefix,
      fullName: data.fullName,
      idCard: idCard,
      birthDate: data.birthDate,
      fatherName: data.fatherName,
      motherName: data.motherName,
      address: [data.addressNo, data.moo ? 'หมู่ ' + data.moo : '', data.soi ? 'ซอย' + data.soi : '', data.road ? 'ถนน' + data.road : '', 'ตำบล' + data.subdistrict, 'อำเภอ' + data.district, 'จังหวัด' + data.province, data.zipcode].filter(Boolean).join(' '),
      phone: data.phone,
      oldSchool: data.oldSchool,
      gpax: data.gpax,
      branch1: data.branch1,
      branch2: data.branch2 || '',
      status: 'รอตรวจสอบ'
    }
  };
}

/**
 * ฟังก์ชันช่วยแปลง Mime Type เป็นนามสกุลไฟล์
 */
function getExtensionFromMime(mime) {
  if (mime.includes('pdf')) return '.pdf';
  if (mime.includes('png')) return '.png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  return '.dat';
}

/**
 * ฟังก์ชันส่งการแจ้งเตือน (LINE Notify / Email)
 */
function sendNotification(settings, message) {
  const lineToken = settings['LINE_NOTIFY_TOKEN'];
  if (lineToken && lineToken.trim() !== '') {
    try {
      const options = {
        method: 'post',
        headers: { 'Authorization': 'Bearer ' + lineToken },
        payload: { 'message': message },
        muteHttpExceptions: true
      };
      UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options);
    } catch (e) {}
  }

  const adminEmail = settings['ADMIN_EMAIL'];
  if (adminEmail && adminEmail.includes('@')) {
    try {
      MailApp.sendEmail({
        to: adminEmail,
        subject: '[ระบบรับสมัครโควตา 2570] ' + message.split('\n')[0],
        body: message
      });
    } catch (e) {}
  }
}

/**
 * ตรวจสอบสถานะการสมัคร (Check Status)
 */
function handleCheckStatus(idCard) {
  if (!idCard) {
    return { success: false, message: 'กรุณาระบุเลขประจำตัวประชาชน' };
  }
  const cleanId = String(idCard).trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);
  const lastRow = appSheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, message: 'ไม่พบข้อมูลการสมัครในระบบ' };
  }

  const data = appSheet.getDataRange().getValues();
  let found = null;

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][7]).trim();
    if (rowId === cleanId) {
      found = {
        applicationNo: data[i][0],
        academicYear: data[i][1],
        applyDate: data[i][2],
        level: data[i][3],
        prefix: data[i][4],
        fullName: data[i][5],
        // ปิดบังเลขบัตรบางส่วนเพื่อความปลอดภัย
        idCardMasked: cleanId.substring(0, 3) + '-XXXXX-' + cleanId.substring(8, 12) + '-' + cleanId.substring(12),
        idCard: cleanId,
        phone: data[i][22],
        oldSchool: data[i][24],
        gpax: data[i][26],
        branch1: data[i][28],
        branch2: data[i][29],
        status: data[i][30] || 'รอตรวจสอบ',
        remarks: data[i][31] || '',
        studentId: data[i][32] || '',
        enrollDate: data[i][33] || ''
      };
      break;
    }
  }

  if (!found) {
    return { success: false, message: 'ไม่พบข้อมูลการสมัครสำหรับเลขประจำตัวประชาชนนี้' };
  }

  // ดึงรายการเอกสารแนบที่เคยอัปโหลด
  const docSheet = ss.getSheetByName(SHEETS.DOCUMENTS);
  const docData = docSheet.getDataRange().getValues();
  const documents = [];
  for (let j = 1; j < docData.length; j++) {
    if (String(docData[j][0]).trim() === found.applicationNo) {
      documents.push({
        type: docData[j][2],
        name: docData[j][3],
        url: docData[j][5],
        uploadDate: docData[j][6]
      });
    }
  }
  found.documents = documents;

  return { success: true, applicant: found };
}

/**
 * ผู้สมัครอัปโหลดเอกสารแก้ไขเพิ่มเติม (เมื่อสถานะเป็น "เอกสารไม่ครบ")
 */
function handleReuploadDocument(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const idCard = String(data.idCard || '').trim();
  const applicationNo = String(data.applicationNo || '').trim();

  if (!idCard || !applicationNo) {
    return { success: false, message: 'ข้อมูลไม่ถูกต้อง' };
  }

  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);
  const lastRow = appSheet.getLastRow();
  let rowIndex = -1;
  const values = appSheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === applicationNo && String(values[i][7]).trim() === idCard) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, message: 'ไม่พบข้อมูลใบสมัคร' };
  }

  const rootFolder = getOrCreateDriveFolder();
  let targetFolder = rootFolder;
  const subFolders = rootFolder.getFolders();
  while (subFolders.hasNext()) {
    const f = subFolders.next();
    if (f.getName().startsWith(applicationNo)) {
      targetFolder = f;
      break;
    }
  }

  const docSheet = ss.getSheetByName(SHEETS.DOCUMENTS);
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  if (data.file && data.file.base64) {
    const docType = data.fileType || 'เอกสารแก้ไขเพิ่มเติม';
    const contentType = data.file.mimeType || 'application/octet-stream';
    const decodedBytes = Utilities.base64Decode(data.file.base64);
    const ext = getExtensionFromMime(contentType);
    const fileName = applicationNo + '_' + docType + '_แก้ไข_' + ext;
    const blob = Utilities.newBlob(decodedBytes, contentType, fileName);
    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    docSheet.appendRow([
      applicationNo,
      idCard,
      docType + ' (แก้ไขใหม่)',
      fileName,
      file.getId(),
      file.getUrl(),
      formattedDate
    ]);
  }

  // อัปเดตสถานะกลับเป็น "รอตรวจสอบ" พร้อมลบหรือปรับหมายเหตุ
  appSheet.getRange(rowIndex, 31).setValue('รอตรวจสอบ');
  appSheet.getRange(rowIndex, 32).setValue('ผู้สมัครได้อัปโหลดเอกสารแก้ไขเพิ่มเติมแล้ว');

  // บันทึกประวัติ
  const logSheet = ss.getSheetByName(SHEETS.STATUS_LOG);
  logSheet.appendRow([
    formattedDate,
    applicationNo,
    idCard,
    'เอกสารไม่ครบ',
    'รอตรวจสอบ',
    'ผู้สมัคร (แก้ไขเอกสาร)',
    'อัปโหลดเอกสารแก้ไขเพิ่มเติม'
  ]);

  return { success: true, message: 'อัปโหลดเอกสารแก้ไขเรียบร้อยแล้ว สถานะของท่านถูกส่งกลับไปให้เจ้าหน้าที่ตรวจสอบอีกครั้ง' };
}

/**
 * ตรวจสอบสิทธิ์และเข้าสู่ระบบเจ้าหน้าที่ (Staff Login)
 */
function handleStaffLogin(data) {
  const username = String(data.username || '').trim();
  const password = String(data.password || '').trim();

  if (!username || !password) {
    return { success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const staffSheet = ss.getSheetByName(SHEETS.STAFF);
  if (!staffSheet) {
    initDatabase();
    return handleStaffLogin(data);
  }

  const hash = hashPassword(password);
  const rows = staffSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const u = String(rows[i][0]).trim();
    const p = String(rows[i][1]).trim();
    const name = rows[i][2];
    const role = rows[i][3];
    const status = rows[i][5];

    if (u.toLowerCase() === username.toLowerCase() && p === hash) {
      if (status !== 'ACTIVE') {
        return { success: false, message: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน' };
      }

      // สร้าง Simple Token (Base64 ของ username + timestamp)
      const token = Utilities.base64Encode(username + ':' + new Date().getTime());
      return {
        success: true,
        user: {
          username: u,
          name: name,
          role: role,
          token: token
        }
      };
    }
  }

  return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
}

/**
 * ดึงรายการผู้สมัครทั้งหมด สำหรับระบบเจ้าหน้าที่
 */
function handleGetApplicants(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);
  const lastRow = appSheet.getLastRow();

  if (lastRow <= 1) {
    return { success: true, applicants: [] };
  }

  const rows = appSheet.getDataRange().getValues();
  const docSheet = ss.getSheetByName(SHEETS.DOCUMENTS);
  const docRows = docSheet.getDataRange().getValues();

  // สร้าง Map ของเอกสารแยกตาม applicationNo
  const docMap = {};
  for (let d = 1; d < docRows.length; d++) {
    const appNo = String(docRows[d][0]).trim();
    if (!docMap[appNo]) docMap[appNo] = [];
    docMap[appNo].push({
      type: docRows[d][2],
      name: docRows[d][3],
      url: docRows[d][5]
    });
  }

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const appNo = String(rows[i][0]).trim();
    list.push({
      applicationNo: appNo,
      academicYear: rows[i][1],
      applyDate: rows[i][2],
      level: rows[i][3],
      prefix: rows[i][4],
      fullName: rows[i][5],
      birthDate: rows[i][6],
      idCard: rows[i][7],
      fatherName: rows[i][8],
      motherName: rows[i][11],
      address: [rows[i][14], rows[i][15] ? 'หมู่ ' + rows[i][15] : '', 'ตำบล' + rows[i][18], 'อำเภอ' + rows[i][19], 'จังหวัด' + rows[i][20], rows[i][21]].filter(Boolean).join(' '),
      province: rows[i][20],
      phone: rows[i][22],
      currentClass: rows[i][23],
      oldSchool: rows[i][24],
      gpax: rows[i][26],
      oldMajor: rows[i][27],
      branch1: rows[i][28],
      branch2: rows[i][29],
      status: rows[i][30] || 'รอตรวจสอบ',
      remarks: rows[i][31] || '',
      studentId: rows[i][32] || '',
      enrollDate: rows[i][33] || '',
      receiptNo: rows[i][34] || '',
      documents: docMap[appNo] || []
    });
  }

  return { success: true, applicants: list };
}

/**
 * สรุปสถิติสำหรับ Dashboard เจ้าหน้าที่
 */
function handleGetDashboardData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);
  const lastRow = appSheet.getLastRow();

  if (lastRow <= 1) {
    return {
      success: true,
      stats: {
        total: 0,
        pending: 0,
        incomplete: 0,
        passed: 0,
        failed: 0,
        enrolled: 0,
        byLevel: {},
        byBranch: {},
        bySchool: {},
        byProvince: {}
      }
    };
  }

  const rows = appSheet.getDataRange().getValues();
  let pending = 0, incomplete = 0, passed = 0, failed = 0, enrolled = 0;
  const byLevel = {};
  const byBranch = {};
  const bySchool = {};
  const byProvince = {};

  for (let i = 1; i < rows.length; i++) {
    const level = rows[i][3] || 'ไม่ระบุ';
    const province = rows[i][20] || 'ไม่ระบุ';
    const school = rows[i][24] || 'ไม่ระบุ';
    const branch1 = rows[i][28] || 'ไม่ระบุ';
    const status = rows[i][30] || 'รอตรวจสอบ';

    // นับตามสถานะ
    if (status === 'รอตรวจสอบ') pending++;
    else if (status === 'เอกสารไม่ครบ') incomplete++;
    else if (status === 'ผ่านการคัดเลือก') passed++;
    else if (status === 'ไม่ผ่าน') failed++;
    else if (status === 'มอบตัวแล้ว') enrolled++;

    // สถิติตามระดับ
    byLevel[level] = (byLevel[level] || 0) + 1;

    // สถิติตามสาขาอันดับ 1
    byBranch[branch1] = (byBranch[branch1] || 0) + 1;

    // สถิติตามโรงเรียนเดิม
    if (school && school !== '-') {
      bySchool[school] = (bySchool[school] || 0) + 1;
    }

    // สถิติตามจังหวัด
    if (province && province !== '-') {
      byProvince[province] = (byProvince[province] || 0) + 1;
    }
  }

  return {
    success: true,
    stats: {
      total: rows.length - 1,
      pending: pending,
      incomplete: incomplete,
      passed: passed,
      failed: failed,
      enrolled: enrolled,
      byLevel: byLevel,
      byBranch: byBranch,
      bySchool: bySchool,
      byProvince: byProvince
    }
  };
}

/**
 * ปรับปรุงสถานะผู้สมัคร พร้อมบันทึกประวัติ (Audit Log)
 */
function handleUpdateStatus(data) {
  const applicationNo = String(data.applicationNo || '').trim();
  const newStatus = String(data.newStatus || '').trim();
  const remarks = String(data.remarks || '').trim();
  const staffName = String(data.staffName || 'เจ้าหน้าที่').trim();

  if (!applicationNo || !newStatus) {
    return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);
  const rows = appSheet.getDataRange().getValues();
  let rowIndex = -1;
  let oldStatus = '';
  let idCard = '';
  let fullName = '';
  let phone = '';

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === applicationNo) {
      rowIndex = i + 1;
      oldStatus = rows[i][30] || 'รอตรวจสอบ';
      fullName = (rows[i][4] || '') + (rows[i][5] || '');
      idCard = rows[i][7];
      phone = rows[i][22];
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, message: 'ไม่พบเลขที่ใบสมัครที่ระบุ' };
  }

  // อัปเดตใน Applicants
  appSheet.getRange(rowIndex, 31).setValue(newStatus);
  appSheet.getRange(rowIndex, 32).setValue(remarks);

  // บันทึกลง StatusLog
  const logSheet = ss.getSheetByName(SHEETS.STATUS_LOG);
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  logSheet.appendRow([
    formattedDate,
    applicationNo,
    idCard,
    oldStatus,
    newStatus,
    staffName,
    remarks
  ]);

  // แจ้งเตือนผู้สมัครหรือเจ้าหน้าที่เมื่อสถานะเปลี่ยน
  try {
    const settings = getSettingsMap();
    const notifyMsg = 'อัปเดตสถานะใบสมัคร: ' + applicationNo + '\n' +
      'ชื่อ-สกุล: ' + fullName + '\n' +
      'สถานะเดิม: ' + oldStatus + '\n' +
      'สถานะใหม่: ' + newStatus + '\n' +
      'หมายเหตุ: ' + (remarks || '-') + '\n' +
      'ผู้ดำเนินการ: ' + staffName;
    sendNotification(settings, notifyMsg);
  } catch (e) {}

  return { success: true, message: 'อัปเดตสถานะเป็น "' + newStatus + '" เรียบร้อยแล้ว' };
}

/**
 * ออกรหัสนักเรียน/นักศึกษาอัตโนมัติ และบันทึกข้อมูลการมอบตัว
 */
function handleEnrollApplicant(data) {
  const applicationNo = String(data.applicationNo || '').trim();
  const receiptNo = String(data.receiptNo || '').trim();
  const staffName = String(data.staffName || 'เจ้าหน้าที่').trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);
  const rows = appSheet.getDataRange().getValues();
  let rowIndex = -1;
  let level = '';
  let idCard = '';
  let fullName = '';

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === applicationNo) {
      rowIndex = i + 1;
      level = rows[i][3];
      idCard = rows[i][7];
      fullName = (rows[i][4] || '') + (rows[i][5] || '');
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, message: 'ไม่พบใบสมัคร' };
  }

  // สร้างรหัสนักเรียนอัตโนมัติ เช่น 7020xxxx (ปวช.) หรือ 7030xxxx (ปวส.)
  const settings = getSettingsMap();
  const yr = String(settings['ACADEMIC_YEAR'] || '2570').slice(-2); // 70
  const levelCode = level.includes('ปวช') ? '20' : '30';
  const prefix = yr + levelCode;

  // หาเลขลำดับล่าสุดที่มอบตัวแล้ว
  let maxSeq = 0;
  for (let j = 1; j < rows.length; j++) {
    const sId = String(rows[j][32] || '').trim();
    if (sId.startsWith(prefix)) {
      const num = parseInt(sId.substring(prefix.length), 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const newStudentId = prefix + ('0000' + (maxSeq + 1)).slice(-4);
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  // บันทึกสถานะ "มอบตัวแล้ว", รหัสนักเรียน, วันที่มอบตัว, เลขที่ใบเสร็จ
  appSheet.getRange(rowIndex, 31).setValue('มอบตัวแล้ว');
  appSheet.getRange(rowIndex, 32).setValue('ดำเนินการมอบตัวเรียบร้อยแล้ว');
  appSheet.getRange(rowIndex, 33).setValue(newStudentId);
  appSheet.getRange(rowIndex, 34).setValue(formattedDate);
  appSheet.getRange(rowIndex, 35).setValue(receiptNo);

  // บันทึกลง StatusLog
  const logSheet = ss.getSheetByName(SHEETS.STATUS_LOG);
  logSheet.appendRow([
    formattedDate,
    applicationNo,
    idCard,
    'ผ่านการคัดเลือก',
    'มอบตัวแล้ว',
    staffName,
    'ออกรหัสนักเรียน: ' + newStudentId + ' / ใบเสร็จ: ' + (receiptNo || '-')
  ]);

  return {
    success: true,
    message: 'บันทึกการมอบตัวสำเร็จ',
    studentId: newStudentId,
    enrollDate: formattedDate
  };
}

/**
 * บันทึกการตั้งค่าระบบ (เปิด/ปิดรับสมัคร, วันที่, รายชื่อสาขา)
 */
function handleUpdateSettings(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const setSheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!setSheet) {
    initDatabase();
  }

  const rows = setSheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    map[String(rows[i][0]).trim()] = i + 1;
  }

  const updates = [
    { key: 'ADMISSION_STATUS', val: data.admissionStatus },
    { key: 'ACADEMIC_YEAR', val: data.academicYear },
    { key: 'ADMISSION_START', val: data.startDate },
    { key: 'ADMISSION_END', val: data.endDate },
    { key: 'ANNOUNCEMENT_DATE', val: data.announcementDate },
    { key: 'ENROLLMENT_DATE', val: data.enrollmentDate },
    { key: 'HOME_NOTICE', val: data.homeNotice },
    { key: 'LINE_NOTIFY_TOKEN', val: data.lineToken },
    { key: 'ADMIN_EMAIL', val: data.adminEmail }
  ];

  if (data.branchesVoc) {
    updates.push({ key: 'BRANCHES_VOC', val: JSON.stringify(data.branchesVoc) });
  }
  if (data.branchesDip) {
    updates.push({ key: 'BRANCHES_DIP', val: JSON.stringify(data.branchesDip) });
  }

  updates.forEach(u => {
    if (u.val !== undefined) {
      if (map[u.key]) {
        setSheet.getRange(map[u.key], 2).setValue(u.val);
      } else {
        setSheet.appendRow([u.key, u.val, '']);
      }
    }
  });

  return { success: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' };
}

/**
 * ส่งออกข้อมูลผู้สมัครในรูปแบบสำหรับงานทะเบียน
 */
function handleExportData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const appSheet = ss.getSheetByName(SHEETS.APPLICANTS);
  const rows = appSheet.getDataRange().getValues();

  if (rows.length <= 1) {
    return { success: true, data: [] };
  }

  const headers = rows[0];
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const item = {};
    for (let c = 0; c < headers.length; c++) {
      item[headers[c]] = rows[i][c];
    }
    list.push(item);
  }

  return { success: true, count: list.length, data: list };
}
