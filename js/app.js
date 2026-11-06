/**
 * ==============================================================================
 * สคริปต์หลักของระบบรับสมัครเรียนออนไลน์ (โควตา) ประจำปีการศึกษา 2570
 * วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา
 * พัฒนาโดย: แผนกวิชาเทคโนโลยีคอมพิวเตอร์
 * ==============================================================================
 */

// URL ของ Google Apps Script Web App ที่ Deploy แล้ว
// ผู้ดูแลระบบสามารถเปลี่ยนค่า URL นี้ หรือกำหนดผ่านหน้าตั้งค่าของระบบได้
let GAS_API_URL = localStorage.getItem('TTC_GAS_API_URL') || '';

// ข้อมูลการตั้งค่าเริ่มต้น (จะอัปเดตจาก Settings ชีต หรือใช้ค่าตั้งต้น 2570)
let systemSettings = {
  admissionStatus: 'OPEN',
  academicYear: '2570',
  startDate: '2026-11-01',
  endDate: '2027-02-28',
  announcementDate: '2027-03-05',
  enrollmentDate: '2027-03-15',
  homeNotice: 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ เปิดรับสมัครนักเรียน นักศึกษาใหม่ ประเภทโควตา ประจำปีการศึกษา 2570 สำหรับผู้สำเร็จการศึกษาระดับ ม.3, ปวช. และ ม.6 ที่มีผลการเรียนและความประพฤติดี',
  branchesVoc: [
    "เทคโนโลยีสารสนเทศ", "การบัญชี", "เทคโนโลยีธุรกิจดิจิทัล", "การตลาด",
    "ไฟฟ้ากำลัง", "อิเล็กทรอนิกส์", "เทคนิคคอมพิวเตอร์", "เทคนิคการผลิต",
    "ซ่อมบำรุงอุตสาหกรรม", "ยานยนต์", "เมคคาทรอนิกส์"
  ],
  branchesDip: [
    "เทคโนโลยีสารสนเทศ", "การบัญชี", "เทคโนโลยีธุรกิจดิจิทัล", "การตลาด",
    "ไฟฟ้ากำลัง", "อิเล็กทรอนิกส์", "เทคโนโลยีคอมพิวเตอร์", "เทคนิคการผลิต",
    "ซ่อมบำรุงอุตสาหกรรม", "ยานยนต์", "เมคคาทรอนิกส์"
  ]
};

// ฐานข้อมูลจำลองในเครื่อง (สำหรับการทดสอบแบบ Standalone ก่อนผูกกับ Google Apps Script)
let localDatabase = {
  applicants: [
    {
      applicationNo: 'Q70-0001',
      academicYear: '2570',
      applyDate: '2026-11-02 09:30:15',
      level: 'ปวช.',
      prefix: 'นาย',
      fullName: 'กิตติศักดิ์ เจริญพร',
      birthDate: '15 พฤษภาคม 2554',
      idCard: '1100201234567',
      fatherName: 'นายประสิทธิ์ เจริญพร',
      fatherAge: '48',
      fatherJob: 'พนักงานโรงงานปูนซิเมนต์',
      motherName: 'นางมาลี เจริญพร',
      motherAge: '45',
      motherJob: 'ค้าขาย',
      address: '124 หมู่ 3 ต.บ้านครัว อ.บ้านหมอ จ.สระบุรี 18270',
      province: 'สระบุรี',
      phone: '0812345678',
      currentClass: 'มัธยมศึกษาปีที่ 3 (ม.3)',
      oldSchool: 'โรงเรียนบ้านหมอ "พัฒนานุกูล"',
      gpax: '3.45',
      branch1: 'เทคโนโลยีสารสนเทศ',
      branch2: 'เทคนิคคอมพิวเตอร์',
      status: 'ผ่านการคัดเลือก',
      remarks: 'คุณสมบัติและเอกสารครบถ้วน',
      studentId: '',
      documents: [
        { type: 'รูปถ่ายหน้าตรงขนาด 1 นิ้ว', name: 'photo_Q700001.jpg', url: 'assets/logo.png' },
        { type: 'เอกสารแสดงผลการเรียน 5 ภาคเรียน', name: 'transcript_Q700001.pdf', url: '#' }
      ]
    },
    {
      applicationNo: 'Q70-0002',
      academicYear: '2570',
      applyDate: '2026-11-03 14:10:00',
      level: 'ปวส. (สายตรง)',
      prefix: 'นางสาว',
      fullName: 'ณิชานันท์ มณีวรรณ',
      birthDate: '22 กันยายน 2551',
      idCard: '1100409876543',
      fatherName: 'นายสมบัติ มณีวรรณ',
      fatherAge: '52',
      fatherJob: 'เกษตรกร',
      motherName: 'นางสุภาพร มณีวรรณ',
      motherAge: '50',
      motherJob: 'เกษตรกร',
      address: '45 หมู่ 7 ต.ท่าหลวง อ.ท่าเรือ จ.พระนครศรีอยุธยา 13130',
      province: 'พระนครศรีอยุธยา',
      phone: '0898765432',
      currentClass: 'ประกาศนียบัตรวิชาชีพปีที่ 3 (ปวช.3)',
      oldSchool: 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
      gpax: '3.78',
      oldMajor: 'การบัญชี',
      branch1: 'การบัญชี',
      branch2: '',
      status: 'มอบตัวแล้ว',
      remarks: 'รายงานตัวและชำระค่าธรรมเนียมแล้ว',
      studentId: '70300001',
      enrollDate: '2026-11-05 11:20:00',
      receiptNo: 'เล่ม 01 เลขที่ 0001',
      documents: [
        { type: 'รูปถ่ายหน้าตรงขนาด 1 นิ้ว', name: 'photo_Q700002.jpg', url: 'assets/logo.png' }
      ]
    },
    {
      applicationNo: 'Q70-0003',
      academicYear: '2570',
      applyDate: '2026-11-04 10:15:20',
      level: 'ปวช.',
      prefix: 'นาย',
      fullName: 'ธนวัฒน์ สุขสวัสดิ์',
      birthDate: '10 มกราคม 2554',
      idCard: '1100505544332',
      fatherName: 'นายวิชัย สุขสวัสดิ์',
      fatherAge: '46',
      fatherJob: 'รับจ้างทั่วไป',
      motherName: 'นางวรรณา สุขสวัสดิ์',
      motherAge: '44',
      motherJob: 'แม่บ้าน',
      address: '89 หมู่ 2 ต.หนองโดน อ.หนองโดน จ.สระบุรี 18190',
      province: 'สระบุรี',
      phone: '0851122334',
      currentClass: 'มัธยมศึกษาปีที่ 3 (ม.3)',
      oldSchool: 'โรงเรียนหนองโดนวิทยา',
      gpax: '2.80',
      branch1: 'ยานยนต์',
      branch2: 'ไฟฟ้ากำลัง',
      status: 'เอกสารไม่ครบ',
      remarks: 'เอกสารผลการเรียน (ปพ.1) ไม่ชัดเจน กรุณาอัปโหลดเอกสารที่มีตราประทับโรงเรียนใหม่',
      studentId: '',
      documents: []
    }
  ]
};

// ตัวแปรเก็บข้อมูลการล็อกอินของเจ้าหน้าที่
let currentStaffUser = null;
let lastSubmittedApplication = null;
let currentCheckedApplicant = null;

// ==============================================================================
// การเริ่มต้นระบบ (Initialization)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initProvincesDropdown();
  loadSystemSettings();
  checkSavedStaffSession();
});

/**
 * เติมข้อมูลจังหวัด 77 จังหวัดลงใน Dropdown
 */
function initProvincesDropdown() {
  const provinceSelect = document.getElementById('province');
  if (!provinceSelect) return;

  if (typeof THAI_PROVINCES !== 'undefined' && Array.isArray(THAI_PROVINCES)) {
    THAI_PROVINCES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      provinceSelect.appendChild(opt);
    });
  }
}

/**
 * โหลดการตั้งค่าจากระบบ (GAS Backend หรือ Local State)
 */
async function loadSystemSettings() {
  if (GAS_API_URL) {
    try {
      const res = await fetch(`${GAS_API_URL}?action=getSettings`);
      const data = await res.json();
      if (data && data.success) {
        systemSettings = { ...systemSettings, ...data };
      }
    } catch (e) {
      console.warn('ไม่สามารถดึงข้อมูล Settings จาก GAS ได้ จึงใช้ค่าเริ่มต้นในระบบ', e);
    }
  }

  applySettingsToUI();
}

/**
 * อัปเดตข้อมูลการตั้งค่าลงบนหน้าจอ UI
 */
function applySettingsToUI() {
  // สถานะเปิด-ปิดรับสมัคร
  const badgeStatus = document.getElementById('badgeAdmissionStatus');
  const textDates = document.getElementById('textAdmissionDates');
  const applyClosedAlert = document.getElementById('applyClosedAlert');
  const applicationForm = document.getElementById('applicationForm');

  if (systemSettings.admissionStatus === 'OPEN') {
    if (badgeStatus) {
      badgeStatus.className = 'status-badge open';
      badgeStatus.textContent = 'กำลังเปิดรับสมัคร';
    }
    if (applyClosedAlert) applyClosedAlert.style.display = 'none';
    if (applicationForm) applicationForm.style.display = 'block';
  } else {
    if (badgeStatus) {
      badgeStatus.className = 'status-badge closed';
      badgeStatus.textContent = 'ปิดรับสมัครแล้ว';
    }
    if (applyClosedAlert) applyClosedAlert.style.display = 'block';
    if (applicationForm) applicationForm.style.display = 'none';
  }

  // กำหนดการและข้อความหน้าแรก
  const homeNotice = document.getElementById('homeNoticeText');
  if (homeNotice && systemSettings.homeNotice) {
    homeNotice.textContent = systemSettings.homeNotice;
  }

  if (textDates) {
    textDates.textContent = `ประจำปีการศึกษา ${systemSettings.academicYear || '2570'}`;
  }

  // แสดงรายชื่อสาขาหน้าแรก
  renderHomeBranchesList();

  // อัปเดตรายชื่อสาขาในแบบฟอร์ม
  populateBranchSelects();
}

/**
 * แสดงรายชื่อสาขาวิชาในหน้าแรก
 */
function renderHomeBranchesList() {
  const vocList = document.getElementById('homeVocBranchesList');
  const dipList = document.getElementById('homeDipBranchesList');

  if (vocList && systemSettings.branchesVoc) {
    vocList.innerHTML = systemSettings.branchesVoc.map(b => `<li>สาขาวิชา${b}</li>`).join('');
  }

  if (dipList && systemSettings.branchesDip) {
    dipList.innerHTML = systemSettings.branchesDip.map(b => `<li>สาขาวิชา${b}</li>`).join('');
  }
}

/**
 * เติมรายชื่อสาขาวิชาลงใน Dropdown ของฟอร์มสมัคร
 */
function populateBranchSelects() {
  const b1Voc = document.getElementById('branch1Voc');
  const b2Voc = document.getElementById('branch2Voc');
  const b1Dip = document.getElementById('branch1Dip');

  if (b1Voc && systemSettings.branchesVoc) {
    b1Voc.innerHTML = '<option value="">-- เลือกสาขาวิชาอันดับที่ 1 --</option>' +
      systemSettings.branchesVoc.map(b => `<option value="${b}">${b}</option>`).join('');
  }

  if (b2Voc && systemSettings.branchesVoc) {
    b2Voc.innerHTML = '<option value="">-- เลือกสาขาวิชาอันดับที่ 2 --</option>' +
      systemSettings.branchesVoc.map(b => `<option value="${b}">${b}</option>`).join('');
  }

  if (b1Dip && systemSettings.branchesDip) {
    b1Dip.innerHTML = '<option value="">-- เลือกสาขาวิชา --</option>' +
      systemSettings.branchesDip.map(b => `<option value="${b}">${b}</option>`).join('');
  }
}

// ==============================================================================
// การสลับแท็บเมนู (Tab Switching)
// ==============================================================================
function switchTab(tabId, clickedBtn) {
  // สลับปุ่ม Active
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  if (clickedBtn) {
    clickedBtn.classList.add('active');
  }

  // สลับเนื้อหา Tab
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // หากเข้าแท็บเจ้าหน้าที่ ให้ตรวจสอบสถานะล็อกอิน
  if (tabId === 'staffTab' && currentStaffUser) {
    refreshApplicantsData();
    refreshDashboardStats();
  }
}

// ==============================================================================
// ฟังก์ชันการตรวจสอบความถูกต้องของฟอร์ม (Validation Functions)
// ==============================================================================

/**
 * ตรวจสอบความถูกต้องของเลขประจำตัวประชาชน 13 หลัก (Thai National ID Checksum)
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

function validateIdCardField(input) {
  const errorEl = document.getElementById('idCardError');
  const val = input.value.trim();

  // กรองให้เหลือแต่ตัวเลข
  input.value = val.replace(/\D/g, '');

  if (input.value.length === 13) {
    if (validateThaiNationalId(input.value)) {
      input.classList.remove('is-invalid');
      if (errorEl) errorEl.classList.remove('visible');
    } else {
      input.classList.add('is-invalid');
      if (errorEl) {
        errorEl.textContent = 'เลขประจำตัวประชาชนไม่ถูกต้องตามหลักการคำนวณ';
        errorEl.classList.add('visible');
      }
    }
  } else {
    input.classList.remove('is-invalid');
    if (errorEl) errorEl.classList.remove('visible');
  }
}

function validatePhoneField(input) {
  const errorEl = document.getElementById('phoneError');
  input.value = input.value.replace(/\D/g, '');
  const val = input.value.trim();

  if (val.length === 10) {
    if (/^0\d{9}$/.test(val)) {
      input.classList.remove('is-invalid');
      if (errorEl) errorEl.classList.remove('visible');
    } else {
      input.classList.add('is-invalid');
      if (errorEl) errorEl.classList.add('visible');
    }
  } else {
    input.classList.remove('is-invalid');
    if (errorEl) errorEl.classList.remove('visible');
  }
}

function validateGpaxField(input) {
  const errorEl = document.getElementById('gpaxError');
  const val = parseFloat(input.value);

  if (!isNaN(val) && (val < 0.0 || val > 4.0)) {
    input.classList.add('is-invalid');
    if (errorEl) errorEl.classList.add('visible');
  } else {
    input.classList.remove('is-invalid');
    if (errorEl) errorEl.classList.remove('visible');
  }
}

function validateBranchNoDuplicate() {
  const b1 = document.getElementById('branch1Voc').value;
  const b2 = document.getElementById('branch2Voc').value;
  const errorEl = document.getElementById('branchDuplicateError');

  if (b1 && b2 && b1 === b2) {
    if (errorEl) errorEl.classList.add('visible');
    return false;
  } else {
    if (errorEl) errorEl.classList.remove('visible');
    return true;
  }
}

/**
 * เมื่อผู้ใช้เลือกระดับชั้นที่ต้องการสมัคร
 */
function onLevelChange(level) {
  const promptBox = document.getElementById('branchSelectPrompt');
  const vocSection = document.getElementById('branchVocSection');
  const dipSection = document.getElementById('branchDipSection');
  const b1Voc = document.getElementById('branch1Voc');
  const b2Voc = document.getElementById('branch2Voc');
  const b1Dip = document.getElementById('branch1Dip');

  if (promptBox) promptBox.style.display = 'none';

  if (level === 'ปวช.') {
    if (vocSection) vocSection.style.display = 'block';
    if (dipSection) dipSection.style.display = 'none';
    if (b1Voc) b1Voc.required = true;
    if (b2Voc) b2Voc.required = true;
    if (b1Dip) b1Dip.required = false;
  } else {
    // ปวส. ทุกสาย
    if (vocSection) vocSection.style.display = 'none';
    if (dipSection) dipSection.style.display = 'block';
    if (b1Voc) b1Voc.required = false;
    if (b2Voc) b2Voc.required = false;
    if (b1Dip) b1Dip.required = true;
  }
}

/**
 * ตัวช่วยอ่านไฟล์เป็น Base64
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        base64: base64String
      });
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

function handleFileChange(input, previewId) {
  const file = input.files[0];
  if (!file) return;

  // ตรวจสอบขนาดไฟล์ไม่เกิน 5MB (5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('ขนาดไฟล์เกินกำหนด (สูงสุด 5 MB ต่อไฟล์) กรุณาเลือกไฟล์ใหม่');
    input.value = '';
    if (previewId) {
      const previewBox = document.getElementById(previewId);
      if (previewBox) previewBox.style.display = 'none';
    }
    return;
  }

  // แสดงรูปภาพตัวอย่างกรณีเป็นรูปถ่าย
  if (previewId && file.type.startsWith('image/')) {
    const previewBox = document.getElementById(previewId);
    if (previewBox) {
      const img = previewBox.querySelector('img');
      const reader = new FileReader();
      reader.onload = (e) => {
        if (img) img.src = e.target.result;
        previewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }
}

// ==============================================================================
// การส่งใบสมัคร (Submit Application)
// ==============================================================================
async function handleFormSubmit(event) {
  event.preventDefault();

  // 1. ตรวจสอบสถานะการเปิดรับสมัคร
  if (systemSettings.admissionStatus !== 'OPEN') {
    alert('ขณะนี้ระบบปิดรับสมัครออนไลน์แล้ว');
    return;
  }

  // 2. ตรวจสอบเลขประจำตัวประชาชน
  const idCard = document.getElementById('idCard').value.trim();
  if (!validateThaiNationalId(idCard)) {
    alert('เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักการคำนวณ กรุณาตรวจสอบอีกครั้ง');
    document.getElementById('idCard').focus();
    return;
  }

  // 3. ตรวจสอบเบอร์โทรศัพท์
  const phone = document.getElementById('phone').value.trim();
  if (!/^0\d{9}$/.test(phone)) {
    alert('หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0');
    document.getElementById('phone').focus();
    return;
  }

  // 4. ตรวจสอบเกรดเฉลี่ย
  const gpax = parseFloat(document.getElementById('gpax').value);
  if (isNaN(gpax) || gpax < 0.0 || gpax > 4.0) {
    alert('ผลการเรียนเฉลี่ยสะสม (GPAX) ต้องอยู่ระหว่าง 0.00 - 4.00');
    document.getElementById('gpax').focus();
    return;
  }

  // 5. ตรวจสอบระดับชั้นและสาขาวิชา
  const levelRadio = document.querySelector('input[name="level"]:checked');
  if (!levelRadio) {
    alert('กรุณาเลือกระดับการศึกษาที่ต้องการสมัคร');
    return;
  }
  const level = levelRadio.value;

  let branch1 = '';
  let branch2 = '';

  if (level === 'ปวช.') {
    branch1 = document.getElementById('branch1Voc').value;
    branch2 = document.getElementById('branch2Voc').value;

    if (!branch1 || !branch2) {
      alert('กรุณาเลือกสาขาวิชาที่ต้องการสมัครให้ครบทั้ง 2 ลำดับ');
      return;
    }
    if (branch1 === branch2) {
      alert('สาขาวิชาอันดับที่ 1 และอันดับที่ 2 ต้องไม่ซ้ำกัน');
      return;
    }
  } else {
    branch1 = document.getElementById('branch1Dip').value;
    if (!branch1) {
      alert('กรุณาเลือกสาขาวิชาที่ต้องการสมัคร');
      return;
    }
  }

  // 6. ตรวจสอบไฟล์บังคับ
  const photoFile = document.getElementById('filePhoto').files[0];
  const transcriptFile = document.getElementById('fileTranscript').files[0];
  const idCardFile = document.getElementById('fileIdCard').files[0];
  const certFile = document.getElementById('fileCertificate').files[0];

  if (!photoFile || !transcriptFile || !idCardFile) {
    alert('กรุณาอัปโหลดหลักฐานเอกสารที่จำเป็นให้ครบถ้วน (รูปถ่าย 1 นิ้ว, ใบ ปพ.1/รบ., สำเนาบัตรประชาชน/ทะเบียนบ้าน)');
    return;
  }

  // 7. ตรวจสอบการยินยอม PDPA
  const pdpaConsent = document.getElementById('pdpaConsent').checked;
  if (!pdpaConsent) {
    alert('กรุณาทำเครื่องหมายยินยอมการจัดเก็บและประมวลผลข้อมูลส่วนบุคคล (PDPA)');
    return;
  }

  // ยืนยันการส่งข้อมูล
  const confirmMsg = `ยืนยันการส่งใบสมัครคัดเลือกเข้าศึกษาต่อ\n` +
    `ระดับ: ${level}\n` +
    `สาขาวิชา: ${branch1} ${branch2 ? '(อันดับ 2: ' + branch2 + ')' : ''}\n` +
    `ชื่อ-สกุล: ${document.getElementById('prefix').value} ${document.getElementById('fullName').value}\n\n` +
    `ท่านต้องการส่งใบสมัครใช่หรือไม่?`;
  if (!confirm(confirmMsg)) {
    return;
  }

  // แสดงตัวโหลด
  const btnSubmit = document.getElementById('btnSubmitApply');
  const loadingIndicator = document.getElementById('applyLoadingIndicator');
  btnSubmit.disabled = true;
  loadingIndicator.style.display = 'block';

  try {
    // อ่านไฟล์เอกสารเป็น Base64
    const photoBase64 = await readFileAsBase64(photoFile);
    const transcriptBase64 = await readFileAsBase64(transcriptFile);
    const idCardBase64 = await readFileAsBase64(idCardFile);
    const certBase64 = await readFileAsBase64(certFile);

    const payload = {
      action: 'submitApplication',
      level: level,
      prefix: document.getElementById('prefix').value,
      fullName: document.getElementById('fullName').value.trim(),
      birthDate: document.getElementById('birthDate').value.trim(),
      idCard: idCard,
      fatherName: document.getElementById('fatherName').value.trim(),
      fatherAge: document.getElementById('fatherAge').value.trim(),
      fatherJob: document.getElementById('fatherJob').value.trim(),
      motherName: document.getElementById('motherName').value.trim(),
      motherAge: document.getElementById('motherAge').value.trim(),
      motherJob: document.getElementById('motherJob').value.trim(),
      addressNo: document.getElementById('addressNo').value.trim(),
      moo: document.getElementById('moo').value.trim(),
      soi: document.getElementById('soi').value.trim(),
      road: document.getElementById('road').value.trim(),
      subdistrict: document.getElementById('subdistrict').value.trim(),
      district: document.getElementById('district').value.trim(),
      province: document.getElementById('province').value,
      zipcode: document.getElementById('zipcode').value.trim(),
      phone: phone,
      currentClass: document.getElementById('currentClass').value,
      oldSchool: document.getElementById('oldSchool').value.trim(),
      schoolLocation: document.getElementById('schoolLocation').value.trim(),
      gpax: gpax.toFixed(2),
      oldMajor: document.getElementById('oldMajor').value.trim(),
      branch1: branch1,
      branch2: branch2,
      pdpaConsent: pdpaConsent,
      filePhoto: photoBase64,
      fileTranscript: transcriptBase64,
      fileIdCard: idCardBase64,
      fileCertificate: certBase64
    };

    let result;

    if (GAS_API_URL) {
      // ส่งข้อมูลไปยัง Google Apps Script Backend
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      result = await res.json();
    } else {
      // โหมด Standalone จำลองการบันทึกในเครื่อง
      result = simulateLocalSubmitApplication(payload);
    }

    if (result && result.success) {
      lastSubmittedApplication = result.applicantData;
      // เก็บรูปถ่ายแบบ Data URL สำหรับการพิมพ์ใบสมัคร
      if (photoBase64) {
        lastSubmittedApplication.photoDataUrl = `data:${photoBase64.mimeType};base64,${photoBase64.base64}`;
      }

      // แสดงหน้าสำเร็จ
      document.getElementById('applicationForm').style.display = 'none';
      const successBox = document.getElementById('applySuccessContainer');
      successBox.style.display = 'block';
      document.getElementById('successAppNo').textContent = result.applicationNo;
      document.getElementById('successApplicantName').textContent =
        `${payload.prefix} ${payload.fullName} (ระดับ ${payload.level} สาขา ${payload.branch1})`;

      window.scrollTo({ top: successBox.offsetTop - 20, behavior: 'smooth' });
    } else {
      alert(result.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.toString());
  } finally {
    btnSubmit.disabled = false;
    loadingIndicator.style.display = 'none';
  }
}

/**
 * ฟังก์ชันจำลองการส่งใบสมัครเมื่อยังไม่ได้ระบุ GAS URL
 */
function simulateLocalSubmitApplication(data) {
  // ตรวจสอบการสมัครซ้ำ
  const dup = localDatabase.applicants.find(a => a.idCard === data.idCard && a.academicYear === '2570');
  if (dup) {
    return {
      success: false,
      message: `เลขประจำตัวประชาชนนี้ได้สมัครรับการคัดเลือกแล้ว (เลขที่ใบสมัคร: ${dup.applicationNo})`
    };
  }

  const nextSeq = localDatabase.applicants.length + 1;
  const appNo = 'Q70-' + ('0000' + nextSeq).slice(-4);
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH') + ' ' + now.toLocaleTimeString('th-TH');

  const newApplicant = {
    applicationNo: appNo,
    academicYear: '2570',
    applyDate: dateStr,
    level: data.level,
    prefix: data.prefix,
    fullName: data.fullName,
    birthDate: data.birthDate,
    idCard: data.idCard,
    fatherName: data.fatherName,
    fatherAge: data.fatherAge,
    fatherJob: data.fatherJob,
    motherName: data.motherName,
    motherAge: data.motherAge,
    motherJob: data.motherJob,
    address: [data.addressNo, data.moo ? 'หมู่ ' + data.moo : '', data.soi ? 'ซอย' + data.soi : '', data.road ? 'ถนน' + data.road : '', 'ต.' + data.subdistrict, 'อ.' + data.district, 'จ.' + data.province, data.zipcode].filter(Boolean).join(' '),
    province: data.province,
    phone: data.phone,
    currentClass: data.currentClass,
    oldSchool: data.oldSchool,
    gpax: data.gpax,
    oldMajor: data.oldMajor,
    branch1: data.branch1,
    branch2: data.branch2,
    status: 'รอตรวจสอบ',
    remarks: '',
    studentId: '',
    documents: [
      { type: 'รูปถ่ายหน้าตรงขนาด 1 นิ้ว', name: data.filePhoto.name, url: '#' },
      { type: 'เอกสารแสดงผลการเรียน 5 ภาคเรียน', name: data.fileTranscript.name, url: '#' },
      { type: 'สำเนาบัตรประชาชน/ทะเบียนบ้าน', name: data.fileIdCard.name, url: '#' }
    ]
  };

  localDatabase.applicants.unshift(newApplicant);

  return {
    success: true,
    applicationNo: appNo,
    applicantData: newApplicant
  };
}

function resetApplyForm() {
  document.getElementById('applicationForm').reset();
  document.getElementById('applicationForm').style.display = 'block';
  document.getElementById('applySuccessContainer').style.display = 'none';
  document.getElementById('branchVocSection').style.display = 'none';
  document.getElementById('branchDipSection').style.display = 'none';
  document.getElementById('branchSelectPrompt').style.display = 'block';
  document.getElementById('photoPreviewBox').style.display = 'none';
  lastSubmittedApplication = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==============================================================================
// การพิมพ์ใบสมัคร A4 ตามมาตรฐานแบบฟอร์มกระดาษจริง
// ==============================================================================
function printApplication(data) {
  if (!data) return;

  document.getElementById('pAppNo').textContent = data.applicationNo || '-';
  document.getElementById('pLevel').textContent = data.level || '-';
  document.getElementById('pDate').textContent = data.applyDate || data.date || '-';
  document.getElementById('pFullName').textContent = `${data.prefix || ''} ${data.fullName || ''}`;
  document.getElementById('pBirthDate').textContent = data.birthDate || '-';
  document.getElementById('pIdCard').textContent = data.idCard || '-';
  document.getElementById('pPhone').textContent = data.phone || '-';

  document.getElementById('pFatherName').textContent = data.fatherName || '-';
  document.getElementById('pFatherAge').textContent = data.fatherAge || '-';
  document.getElementById('pFatherJob').textContent = data.fatherJob || '-';

  document.getElementById('pMotherName').textContent = data.motherName || '-';
  document.getElementById('pMotherAge').textContent = data.motherAge || '-';
  document.getElementById('pMotherJob').textContent = data.motherJob || '-';

  document.getElementById('pAddress').textContent = data.address || '-';
  document.getElementById('pCurrentClass').textContent = data.currentClass || '-';
  document.getElementById('pOldSchool').textContent = data.oldSchool || '-';
  document.getElementById('pGpax').textContent = data.gpax || '-';
  document.getElementById('pOldMajor').textContent = data.oldMajor || '-';

  document.getElementById('pBranch1').textContent = data.branch1 || '-';
  if (data.branch2) {
    document.getElementById('pBranch2Label').style.display = 'inline';
    document.getElementById('pBranch2').style.display = 'inline-block';
    document.getElementById('pBranch2').textContent = data.branch2;
  } else {
    document.getElementById('pBranch2Label').style.display = 'none';
    document.getElementById('pBranch2').style.display = 'none';
  }

  // ลงชื่อผู้สมัคร
  document.getElementById('pSigName').textContent = `${data.prefix || ''} ${data.fullName || ''}`;

  // แสดงรูปถ่ายหากมี Data URL
  const photoBox = document.getElementById('printPhotoBox');
  if (data.photoDataUrl) {
    photoBox.innerHTML = `<img src="${data.photoDataUrl}" alt="รูปถ่ายผู้สมัคร">`;
  } else {
    photoBox.innerHTML = `<span style="padding: 10px;">รูปถ่ายหน้าตรง<br>ขนาด ๑ นิ้ว<br>ถ่ายไม่เกิน ๖ เดือน</span>`;
  }

  // เรียกคำสั่งพิมพ์ของเบราว์เซอร์
  window.print();
}

function printApplicationFromLastSubmit() {
  if (lastSubmittedApplication) {
    printApplication(lastSubmittedApplication);
  }
}

function printApplicationFromStatus() {
  if (currentCheckedApplicant) {
    printApplication(currentCheckedApplicant);
  }
}

// ==============================================================================
// การตรวจสอบสถานะการสมัคร (Check Status)
// ==============================================================================
async function handleCheckStatusSubmit(event) {
  event.preventDefault();
  const idCard = document.getElementById('searchIdCard').value.trim();

  if (!idCard) {
    alert('กรุณาระบุเลขประจำตัวประชาชน 13 หลัก');
    return;
  }

  const loading = document.getElementById('statusResultLoading');
  const resultBox = document.getElementById('statusResultContainer');
  loading.style.display = 'block';
  resultBox.style.display = 'none';

  try {
    let result;

    if (GAS_API_URL) {
      const res = await fetch(`${GAS_API_URL}?action=checkStatus&idCard=${encodeURIComponent(idCard)}`);
      result = await res.json();
    } else {
      // ค้นหาใน Local State
      const found = localDatabase.applicants.find(a => a.idCard === idCard);
      if (found) {
        result = {
          success: true,
          applicant: {
            ...found,
            idCardMasked: idCard.substring(0, 3) + '-XXXXX-' + idCard.substring(8, 12) + '-' + idCard.substring(12)
          }
        };
      } else {
        result = { success: false, message: 'ไม่พบข้อมูลการสมัครสำหรับเลขประจำตัวประชาชนนี้' };
      }
    }

    if (result && result.success && result.applicant) {
      currentCheckedApplicant = result.applicant;
      renderStatusResult(result.applicant);
      resultBox.style.display = 'block';
    } else {
      alert(result.message || 'ไม่พบข้อมูลการสมัครในระบบ');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการตรวจสอบสถานะ: ' + err.toString());
  } finally {
    loading.style.display = 'none';
  }
}

/**
 * แสดงผลข้อมูลสถานะผู้สมัคร
 */
function renderStatusResult(app) {
  document.getElementById('resAppNo').textContent = app.applicationNo || '-';
  document.getElementById('resFullName').textContent = `${app.prefix || ''} ${app.fullName || ''}`;
  document.getElementById('resIdCardMasked').textContent = app.idCardMasked || app.idCard || '-';
  document.getElementById('resLevel').textContent = app.level || '-';
  document.getElementById('resBranches').textContent = app.branch2 ? `${app.branch1} (อันดับ 2: ${app.branch2})` : app.branch1;
  document.getElementById('resApplyDate').textContent = app.applyDate || '-';
  document.getElementById('resStatusDesc').textContent = app.status || 'รอตรวจสอบ';
  document.getElementById('resRemarks').textContent = app.remarks || 'ไม่มีข้อความแจ้งเพิ่มเติม';

  // ป้ายสถานะ
  const badge = document.getElementById('resStatusBadge');
  badge.className = 'status-badge';
  if (app.status === 'รอตรวจสอบ') {
    badge.classList.add('pending');
  } else if (app.status === 'เอกสารไม่ครบ') {
    badge.classList.add('failed');
  } else if (app.status === 'ผ่านการคัดเลือก') {
    badge.classList.add('passed');
  } else if (app.status === 'มอบตัวแล้ว') {
    badge.classList.add('enrolled');
  } else {
    badge.classList.add('failed');
  }
  badge.textContent = app.status;

  // ส่วนแสดงรหัสนักเรียนหากมอบตัวแล้ว
  const studentIdRow = document.getElementById('resStudentIdRow');
  if (app.status === 'มอบตัวแล้ว' && app.studentId) {
    studentIdRow.style.display = 'table-row';
    document.getElementById('resStudentIdVal').textContent = app.studentId;
  } else {
    studentIdRow.style.display = 'none';
  }

  // ส่วนอัปโหลดเอกสารแก้ไขเพิ่มเติม กรณีสถานะเป็น "เอกสารไม่ครบ"
  const reuploadSec = document.getElementById('reuploadSection');
  if (app.status === 'เอกสารไม่ครบ') {
    reuploadSec.style.display = 'block';
  } else {
    reuploadSec.style.display = 'none';
  }
}

/**
 * จัดการส่งเอกสารแก้ไขเพิ่มเติม
 */
async function handleReuploadSubmit(event) {
  event.preventDefault();
  if (!currentCheckedApplicant) return;

  const docType = document.getElementById('reuploadDocType').value;
  const fileInput = document.getElementById('reuploadFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('กรุณาเลือกไฟล์เอกสารใหม่');
    return;
  }

  const btn = document.getElementById('btnSubmitReupload');
  btn.disabled = true;
  btn.textContent = 'กำลังอัปโหลดเอกสาร...';

  try {
    const fileBase64 = await readFileAsBase64(file);
    const payload = {
      action: 'reuploadDocument',
      applicationNo: currentCheckedApplicant.applicationNo,
      idCard: currentCheckedApplicant.idCard,
      fileType: docType,
      file: fileBase64
    };

    let result;
    if (GAS_API_URL) {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      result = await res.json();
    } else {
      // อัปเดตใน Local State
      currentCheckedApplicant.status = 'รอตรวจสอบ';
      currentCheckedApplicant.remarks = 'ผู้สมัครได้อัปโหลดเอกสารแก้ไขเพิ่มเติมแล้ว';
      const item = localDatabase.applicants.find(a => a.applicationNo === currentCheckedApplicant.applicationNo);
      if (item) {
        item.status = 'รอตรวจสอบ';
        item.remarks = 'ผู้สมัครได้อัปโหลดเอกสารแก้ไขเพิ่มเติมแล้ว';
      }
      result = { success: true, message: 'อัปโหลดเอกสารแก้ไขเรียบร้อยแล้ว สถานะของท่านถูกส่งกลับไปให้เจ้าหน้าที่ตรวจสอบอีกครั้ง' };
    }

    if (result && result.success) {
      alert(result.message);
      renderStatusResult(currentCheckedApplicant);
      fileInput.value = '';
    } else {
      alert(result.message || 'เกิดข้อผิดพลาดในการอัปโหลดเอกสาร');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.toString());
  } finally {
    btn.disabled = false;
    btn.textContent = 'ส่งเอกสารแก้ไขให้เจ้าหน้าที่ตรวจสอบ';
  }
}

// ==============================================================================
// ส่วนของเจ้าหน้าที่ (Staff Management Portal)
// ==============================================================================

/**
 * ตรวจสอบ Session เจ้าหน้าที่ที่บันทึกไว้ใน Browser
 */
function checkSavedStaffSession() {
  const saved = localStorage.getItem('TTC_STAFF_USER');
  if (saved) {
    try {
      currentStaffUser = JSON.parse(saved);
      showStaffDashboard();
    } catch (e) {
      currentStaffUser = null;
    }
  }
}

/**
 * เข้าสู่ระบบเจ้าหน้าที่
 */
async function handleStaffLoginSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('staffUsername').value.trim();
  const password = document.getElementById('staffPassword').value.trim();
  const errBox = document.getElementById('loginErrorMsg');
  errBox.classList.remove('visible');

  const btnLogin = document.getElementById('btnStaffLogin');
  btnLogin.disabled = true;
  btnLogin.textContent = 'กำลังตรวจสอบ...';

  try {
    let result;

    if (GAS_API_URL) {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'staffLogin',
          username: username,
          password: password
        })
      });
      result = await res.json();
    } else {
      // ตรวจสอบกับบัญชีเริ่มต้นในโหมด Standalone
      // ผู้ดูแลระบบ: admin / admin2570
      // เจ้าหน้าที่ทะเบียน: reg01 / reg2570
      if (username.toLowerCase() === 'admin' && password === 'admin2570') {
        result = {
          success: true,
          user: {
            username: 'admin',
            name: 'ผู้ดูแลระบบ งานเทคโนโลยีสารสนเทศ',
            role: 'ผู้ดูแลระบบ',
            token: 'mock-admin-token'
          }
        };
      } else if (username.toLowerCase() === 'reg01' && password === 'reg2570') {
        result = {
          success: true,
          user: {
            username: 'reg01',
            name: 'เจ้าหน้าที่ งานทะเบียนและวัดผล',
            role: 'เจ้าหน้าที่ทะเบียน',
            token: 'mock-reg-token'
          }
        };
      } else {
        result = { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ทดสอบ: admin/admin2570 หรือ reg01/reg2570)' };
      }
    }

    if (result && result.success && result.user) {
      currentStaffUser = result.user;
      localStorage.setItem('TTC_STAFF_USER', JSON.stringify(result.user));
      showStaffDashboard();
    } else {
      errBox.textContent = result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      errBox.classList.add('visible');
    }
  } catch (err) {
    errBox.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.toString();
    errBox.classList.add('visible');
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = 'เข้าสู่ระบบ';
  }
}

function handleStaffLogout() {
  if (confirm('ต้องการออกจากระบบเจ้าหน้าที่หรือไม่?')) {
    currentStaffUser = null;
    localStorage.removeItem('TTC_STAFF_USER');
    document.getElementById('staffLoginBox').style.display = 'block';
    document.getElementById('staffDashboardContainer').style.display = 'none';
  }
}

function showStaffDashboard() {
  document.getElementById('staffLoginBox').style.display = 'none';
  document.getElementById('staffDashboardContainer').style.display = 'block';

  document.getElementById('staffLoggedInName').textContent = currentStaffUser.name;
  document.getElementById('staffLoggedInRole').textContent = currentStaffUser.role;

  // แสดงแท็บตั้งค่าเฉพาะ "ผู้ดูแลระบบ"
  const adminBtn = document.getElementById('btnAdminSettingsTab');
  if (adminBtn) {
    adminBtn.style.display = (currentStaffUser.role === 'ผู้ดูแลระบบ') ? 'inline-block' : 'none';
  }

  switchStaffSubTab('applicants');
  refreshApplicantsData();
  refreshDashboardStats();
}

function switchStaffSubTab(subTab) {
  const tabs = {
    applicants: document.getElementById('staffSubTabApplicants'),
    dashboard: document.getElementById('staffSubTabDashboard'),
    settings: document.getElementById('staffSubTabSettings')
  };

  Object.keys(tabs).forEach(k => {
    if (tabs[k]) tabs[k].style.display = (k === subTab) ? 'block' : 'none';
  });

  if (subTab === 'settings') {
    loadSettingsIntoForm();
  } else if (subTab === 'dashboard') {
    refreshDashboardStats();
  }
}

// ==============================================================================
// การจัดการตารางผู้สมัครสำหรับเจ้าหน้าที่
// ==============================================================================
let cachedApplicantsList = [];

async function refreshApplicantsData() {
  const tbody = document.getElementById('applicantsTableBody');
  tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px; color: var(--text-muted);">กำลังโหลดข้อมูลผู้สมัคร...</td></tr>`;

  try {
    let list = [];
    if (GAS_API_URL) {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getApplicants' })
      });
      const data = await res.json();
      if (data && data.success) {
        list = data.applicants || [];
      }
    } else {
      list = localDatabase.applicants;
    }

    cachedApplicantsList = list;
    applyApplicantFilters();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px; color: var(--danger-color);">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
  }
}

function applyApplicantFilters() {
  const search = document.getElementById('filterSearch').value.toLowerCase().trim();
  const level = document.getElementById('filterLevel').value;
  const status = document.getElementById('filterStatus').value;

  const filtered = cachedApplicantsList.filter(item => {
    const matchSearch = !search ||
      (item.applicationNo && item.applicationNo.toLowerCase().includes(search)) ||
      (item.fullName && item.fullName.toLowerCase().includes(search)) ||
      (item.idCard && item.idCard.includes(search));

    const matchLevel = !level || item.level === level;
    const matchStatus = !status || item.status === status;

    return matchSearch && matchLevel && matchStatus;
  });

  renderApplicantsTable(filtered);
}

function renderApplicantsTable(list) {
  const tbody = document.getElementById('applicantsTableBody');
  const counter = document.getElementById('tableCounterText');

  if (counter) counter.textContent = `แสดง ${list.length} รายการ`;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px; color: var(--text-muted);">ไม่พบข้อมูลผู้สมัครที่ตรงตามเงื่อนไข</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => {
    let badgeClass = 'pending';
    if (item.status === 'ผ่านการคัดเลือก') badgeClass = 'passed';
    else if (item.status === 'มอบตัวแล้ว') badgeClass = 'enrolled';
    else if (item.status === 'เอกสารไม่ครบ' || item.status === 'ไม่ผ่าน') badgeClass = 'failed';

    const docsCount = item.documents ? item.documents.length : 0;
    const branchesText = item.branch2 ? `${item.branch1}<br><span style="font-size: 12px; color: var(--text-muted);">(อันดับ 2: ${item.branch2})</span>` : item.branch1;

    return `
      <tr>
        <td><strong>${item.applicationNo}</strong></td>
        <td>${item.applyDate ? item.applyDate.split(' ')[0] : '-'}</td>
        <td>${item.level}</td>
        <td>${item.prefix || ''} ${item.fullName}</td>
        <td>${item.idCard}</td>
        <td>${item.gpax}</td>
        <td>${branchesText}</td>
        <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewApplicantDetail('${item.applicationNo}')">
            เอกสาร (${docsCount})
          </button>
        </td>
        <td>
          <div style="display: flex; gap: 4px;">
            <button class="btn btn-primary btn-sm" onclick="viewApplicantDetail('${item.applicationNo}')">
              ตรวจสอบ
            </button>
            ${item.status === 'ผ่านการคัดเลือก' ? `
              <button class="btn btn-success btn-sm" onclick="openEnrollModal('${item.applicationNo}', '${item.prefix || ''} ${item.fullName}')">
                มอบตัว
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ==============================================================================
// Modal ดูรายละเอียดและปรับปรุงสถานะผู้สมัคร
// ==============================================================================
let activeModalApplicant = null;

function viewApplicantDetail(appNo) {
  const applicant = cachedApplicantsList.find(a => a.applicationNo === appNo);
  if (!applicant) return;

  activeModalApplicant = applicant;
  document.getElementById('modalApplicantTitle').textContent = `ใบสมัครเลขที่: ${applicant.applicationNo} (${applicant.level})`;

  const modalBody = document.getElementById('modalApplicantBody');
  const modalFooter = document.getElementById('modalApplicantFooter');

  const docsHtml = (applicant.documents && applicant.documents.length > 0)
    ? applicant.documents.map(d => `
        <li style="margin-bottom: 6px;">
          <strong>${d.type}:</strong> 
          <a href="${d.url}" target="_blank" rel="noopener" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">
            เปิดดูไฟล์ [${d.name}]
          </a>
        </li>
      `).join('')
    : '<li style="color: var(--text-muted);">ไม่มีรายการเอกสารแนบ</li>';

  modalBody.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
      <div>
        <h4 style="color: var(--primary-color); border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 8px;">ข้อมูลส่วนตัวผู้สมัคร</h4>
        <div style="font-size: 13.5px; line-height: 1.6;">
          <strong>ชื่อ-สกุล:</strong> ${applicant.prefix || ''} ${applicant.fullName}<br>
          <strong>วันเดือนปีเกิด:</strong> ${applicant.birthDate || '-'}<br>
          <strong>เลขประจำตัวประชาชน:</strong> ${applicant.idCard}<br>
          <strong>เบอร์โทรศัพท์:</strong> ${applicant.phone}<br>
          <strong>ที่อยู่:</strong> ${applicant.address || '-'}<br>
          <strong>บิดา:</strong> ${applicant.fatherName || '-'} (อาชีพ: ${applicant.fatherJob || '-'}/อายุ: ${applicant.fatherAge || '-'})<br>
          <strong>มารดา:</strong> ${applicant.motherName || '-'} (อาชีพ: ${applicant.motherJob || '-'}/อายุ: ${applicant.motherAge || '-'})
        </div>
      </div>

      <div>
        <h4 style="color: var(--primary-color); border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 8px;">ข้อมูลการศึกษาและสาขาที่สมัคร</h4>
        <div style="font-size: 13.5px; line-height: 1.6;">
          <strong>ระดับชั้นที่สมัคร:</strong> ${applicant.level}<br>
          <strong>สาขาอันดับที่ 1:</strong> ${applicant.branch1}<br>
          ${applicant.branch2 ? `<strong>สาขาอันดับที่ 2:</strong> ${applicant.branch2}<br>` : ''}
          <strong>โรงเรียนเดิม:</strong> ${applicant.oldSchool || '-'}<br>
          <strong>ระดับชั้นเดิม:</strong> ${applicant.currentClass || '-'}<br>
          <strong>เกรดเฉลี่ยสะสม (GPAX):</strong> <span style="font-size: 15px; font-weight: 700; color: var(--primary-color);">${applicant.gpax}</span><br>
          <strong>สถานะปัจจุบัน:</strong> <span class="status-badge ${applicant.status === 'ผ่านการคัดเลือก' ? 'passed' : (applicant.status === 'มอบตัวแล้ว' ? 'enrolled' : 'pending')}">${applicant.status}</span><br>
          ${applicant.studentId ? `<strong>รหัสนักเรียน:</strong> <span style="font-weight: 700; color: var(--primary-color);">${applicant.studentId}</span><br>` : ''}
        </div>
      </div>
    </div>

    <div style="background-color: #F8FAFC; border: 1px solid var(--border-light); padding: 14px; border-radius: var(--radius); margin-bottom: 16px;">
      <h4 style="color: var(--primary-color); margin-bottom: 8px;">เอกสารหลักฐานที่แนบมา</h4>
      <ul class="doc-list" style="margin-bottom: 0;">
        ${docsHtml}
      </ul>
    </div>

    <!-- ฟอร์มปรับเปลี่ยนสถานะ -->
    <div style="border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius); background-color: #FFFFFF;">
      <h4 style="color: var(--primary-color); margin-bottom: 10px;">ปรับเปลี่ยนสถานะและบันทึกหมายเหตุ</h4>
      <div class="form-grid">
        <div class="col-4">
          <div class="form-group">
            <label class="form-label" for="modalChangeStatus">เลือกสถานะใหม่ <span class="req">*</span></label>
            <select id="modalChangeStatus" class="form-control">
              <option value="รอตรวจสอบ" ${applicant.status === 'รอตรวจสอบ' ? 'selected' : ''}>รอตรวจสอบ</option>
              <option value="เอกสารไม่ครบ" ${applicant.status === 'เอกสารไม่ครบ' ? 'selected' : ''}>เอกสารไม่ครบ (ส่งกลับให้แก้ไข)</option>
              <option value="ผ่านการคัดเลือก" ${applicant.status === 'ผ่านการคัดเลือก' ? 'selected' : ''}>ผ่านการคัดเลือก</option>
              <option value="ไม่ผ่าน" ${applicant.status === 'ไม่ผ่าน' ? 'selected' : ''}>ไม่ผ่านการคัดเลือก</option>
            </select>
          </div>
        </div>
        <div class="col-8">
          <div class="form-group">
            <label class="form-label" for="modalRemarks">หมายเหตุจากเจ้าหน้าที่ (แสดงให้ผู้สมัครเห็น)</label>
            <input type="text" id="modalRemarks" class="form-control" value="${applicant.remarks || ''}" placeholder="เช่น เอกสารใบ ปพ.1 ไม่ชัดเจน หรือ นัดสัมภาษณ์เพิ่มเติม">
          </div>
        </div>
      </div>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="printApplication(activeModalApplicant)">พิมพ์ใบสมัคร</button>
    <button class="btn btn-secondary" onclick="closeApplicantModal()">ปิด</button>
    <button class="btn btn-primary" onclick="submitStatusUpdate()">บันทึกการปรับสถานะ</button>
  `;

  document.getElementById('applicantDetailModal').classList.add('active');
}

function closeApplicantModal() {
  document.getElementById('applicantDetailModal').classList.remove('active');
  activeModalApplicant = null;
}

async function submitStatusUpdate() {
  if (!activeModalApplicant) return;

  const newStatus = document.getElementById('modalChangeStatus').value;
  const remarks = document.getElementById('modalRemarks').value.trim();

  try {
    let result;
    if (GAS_API_URL) {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateStatus',
          applicationNo: activeModalApplicant.applicationNo,
          newStatus: newStatus,
          remarks: remarks,
          staffName: currentStaffUser ? currentStaffUser.name : 'เจ้าหน้าที่'
        })
      });
      result = await res.json();
    } else {
      activeModalApplicant.status = newStatus;
      activeModalApplicant.remarks = remarks;
      result = { success: true, message: `อัปเดตสถานะเป็น "${newStatus}" เรียบร้อยแล้ว` };
    }

    if (result && result.success) {
      alert(result.message);
      closeApplicantModal();
      refreshApplicantsData();
      refreshDashboardStats();
    } else {
      alert(result.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.toString());
  }
}

// ==============================================================================
// ส่วนการมอบตัว (Enrollment Modal & Auto Student ID)
// ==============================================================================
function openEnrollModal(appNo, name) {
  document.getElementById('enrollAppNo').value = appNo;
  document.getElementById('enrollApplicantName').textContent = `${name} (${appNo})`;
  document.getElementById('enrollReceiptNo').value = '';
  document.getElementById('enrollModal').classList.add('active');
}

function closeEnrollModal() {
  document.getElementById('enrollModal').classList.remove('active');
}

async function handleEnrollSubmit(event) {
  event.preventDefault();
  const appNo = document.getElementById('enrollAppNo').value;
  const receiptNo = document.getElementById('enrollReceiptNo').value.trim();

  try {
    let result;
    if (GAS_API_URL) {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'enrollApplicant',
          applicationNo: appNo,
          receiptNo: receiptNo,
          staffName: currentStaffUser ? currentStaffUser.name : 'เจ้าหน้าที่'
        })
      });
      result = await res.json();
    } else {
      const app = cachedApplicantsList.find(a => a.applicationNo === appNo);
      const yr = '70';
      const levelCode = app && app.level.includes('ปวช') ? '20' : '30';
      const studentId = yr + levelCode + '000' + (cachedApplicantsList.filter(a => a.studentId).length + 1);

      if (app) {
        app.status = 'มอบตัวแล้ว';
        app.studentId = studentId;
        app.enrollDate = new Date().toLocaleString('th-TH');
        app.receiptNo = receiptNo;
      }
      result = {
        success: true,
        message: 'บันทึกการมอบตัวสำเร็จ',
        studentId: studentId
      };
    }

    if (result && result.success) {
      alert(`บันทึกการมอบตัวเรียบร้อยแล้ว\nรหัสประจำตัวนักเรียน/นักศึกษา: ${result.studentId}`);
      closeEnrollModal();
      refreshApplicantsData();
      refreshDashboardStats();
    } else {
      alert(result.message || 'เกิดข้อผิดพลาดในการมอบตัว');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.toString());
  }
}

// ==============================================================================
// แดชบอร์ดสรุปข้อมูล (Dashboard Analytics - Single Navy Hue Flat Bars)
// ==============================================================================
async function refreshDashboardStats() {
  try {
    let stats;
    if (GAS_API_URL) {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getDashboardData' })
      });
      const data = await res.json();
      if (data && data.success) {
        stats = data.stats;
      }
    } else {
      // คำนวณสถิติจาก Cached List
      const total = cachedApplicantsList.length;
      let pending = 0, incomplete = 0, passed = 0, failed = 0, enrolled = 0;
      const byLevel = {}, byBranch = {}, bySchool = {}, byProvince = {};

      cachedApplicantsList.forEach(a => {
        if (a.status === 'รอตรวจสอบ') pending++;
        else if (a.status === 'เอกสารไม่ครบ') incomplete++;
        else if (a.status === 'ผ่านการคัดเลือก') passed++;
        else if (a.status === 'ไม่ผ่าน') failed++;
        else if (a.status === 'มอบตัวแล้ว') enrolled++;

        byLevel[a.level] = (byLevel[a.level] || 0) + 1;
        if (a.branch1) byBranch[a.branch1] = (byBranch[a.branch1] || 0) + 1;
        if (a.oldSchool) bySchool[a.oldSchool] = (bySchool[a.oldSchool] || 0) + 1;
        if (a.province) byProvince[a.province] = (byProvince[a.province] || 0) + 1;
      });

      stats = { total, pending, incomplete, passed, failed, enrolled, byLevel, byBranch, bySchool, byProvince };
    }

    if (stats) {
      document.getElementById('statTotal').textContent = stats.total || 0;
      document.getElementById('statPending').textContent = stats.pending || 0;
      document.getElementById('statIncomplete').textContent = stats.incomplete || 0;
      document.getElementById('statPassed').textContent = stats.passed || 0;
      document.getElementById('statEnrolled').textContent = stats.enrolled || 0;

      renderFlatBarChart('chartLevelContainer', stats.byLevel, stats.total);
      renderFlatBarChart('chartBranchContainer', stats.byBranch, stats.total);
      renderFlatBarChart('chartSchoolContainer', stats.bySchool, stats.total, 5);
      renderFlatBarChart('chartProvinceContainer', stats.byProvince, stats.total, 5);
    }
  } catch (e) {
    console.error('เกิดข้อผิดพลาดในการโหลด Dashboard Stats', e);
  }
}

/**
 * ฟังก์ชันวาดแท่งกราฟสถิติแบบ Flat เรียบ ใช้โทนสีน้ำเงินเข้มทางการ
 */
function renderFlatBarChart(containerId, dataMap, total, topLimit = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!dataMap || Object.keys(dataMap).length === 0 || !total) {
    container.innerHTML = '<div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 10px;">ยังไม่มีข้อมูล</div>';
    return;
  }

  let entries = Object.entries(dataMap);
  entries.sort((a, b) => b[1] - a[1]);
  if (topLimit > 0) {
    entries = entries.slice(0, topLimit);
  }

  container.innerHTML = entries.map(([label, count]) => {
    const pct = Math.round((count / total) * 100);
    return `
      <div class="chart-bar-container">
        <div class="chart-bar-label">
          <span>${label}</span>
          <strong>${count} คน (${pct}%)</strong>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ==============================================================================
// การส่งออกข้อมูลเป็น CSV/Excel ตามมาตรฐานงานทะเบียน
// ==============================================================================
function exportApplicantsData() {
  if (!cachedApplicantsList || cachedApplicantsList.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก');
    return;
  }

  const headers = [
    'เลขที่ใบสมัคร', 'ปีการศึกษา', 'วันที่สมัคร', 'ระดับที่สมัคร',
    'คำนำหน้า', 'ชื่อ-สกุล', 'วันเดือนปีเกิด', 'เลขประจำตัวประชาชน',
    'ชื่อบิดา', 'อาชีพบิดา', 'ชื่อมารดา', 'อาชีพมารดา',
    'ที่อยู่', 'จังหวัด', 'เบอร์โทรศัพท์', 'ระดับชั้นเดิม', 'โรงเรียนเดิม',
    'เกรดเฉลี่ยสะสม', 'สาขาอันดับ1', 'สาขาอันดับ2', 'สถานะ', 'หมายเหตุ', 'รหัสนักเรียน'
  ];

  const rows = cachedApplicantsList.map(a => [
    `"${a.applicationNo || ''}"`,
    `"${a.academicYear || '2570'}"`,
    `"${a.applyDate || ''}"`,
    `"${a.level || ''}"`,
    `"${a.prefix || ''}"`,
    `"${a.fullName || ''}"`,
    `"${a.birthDate || ''}"`,
    `"${a.idCard || ''}"`,
    `"${a.fatherName || ''}"`,
    `"${a.fatherJob || ''}"`,
    `"${a.motherName || ''}"`,
    `"${a.motherJob || ''}"`,
    `"${(a.address || '').replace(/"/g, '""')}"`,
    `"${a.province || ''}"`,
    `"${a.phone || ''}"`,
    `"${a.currentClass || ''}"`,
    `"${(a.oldSchool || '').replace(/"/g, '""')}"`,
    `"${a.gpax || ''}"`,
    `"${a.branch1 || ''}"`,
    `"${a.branch2 || ''}"`,
    `"${a.status || ''}"`,
    `"${(a.remarks || '').replace(/"/g, '""')}"`,
    `"${a.studentId || ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `รายชื่อผู้สมัครโควตา2570_วท.ท่าหลวง_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==============================================================================
// การตั้งค่าระบบ (Settings Management - Admin)
// ==============================================================================
function loadSettingsIntoForm() {
  document.getElementById('setAdmissionStatus').value = systemSettings.admissionStatus || 'OPEN';
  document.getElementById('setAcademicYear').value = systemSettings.academicYear || '2570';
  document.getElementById('setStartDate').value = systemSettings.startDate || '';
  document.getElementById('setEndDate').value = systemSettings.endDate || '';
  document.getElementById('setAnnounceDate').value = systemSettings.announcementDate || '';
  document.getElementById('setEnrollDate').value = systemSettings.enrollmentDate || '';
  document.getElementById('setHomeNotice').value = systemSettings.homeNotice || '';
  document.getElementById('setBranchesVoc').value = (systemSettings.branchesVoc || []).join(', ');
  document.getElementById('setBranchesDip').value = (systemSettings.branchesDip || []).join(', ');
}

async function handleSaveSettings(event) {
  event.preventDefault();

  const vocArr = document.getElementById('setBranchesVoc').value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const dipArr = document.getElementById('setBranchesDip').value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const updated = {
    action: 'updateSettings',
    admissionStatus: document.getElementById('setAdmissionStatus').value,
    academicYear: document.getElementById('setAcademicYear').value.trim(),
    startDate: document.getElementById('setStartDate').value,
    endDate: document.getElementById('setEndDate').value,
    announcementDate: document.getElementById('setAnnounceDate').value,
    enrollmentDate: document.getElementById('setEnrollDate').value,
    homeNotice: document.getElementById('setHomeNotice').value.trim(),
    lineToken: document.getElementById('setLineToken').value.trim(),
    adminEmail: document.getElementById('setAdminEmail').value.trim(),
    branchesVoc: vocArr,
    branchesDip: dipArr
  };

  const btn = document.getElementById('btnSaveSettings');
  btn.disabled = true;
  btn.textContent = 'กำลังบันทึก...';

  try {
    let result;
    if (GAS_API_URL) {
      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(updated)
      });
      result = await res.json();
    } else {
      systemSettings = { ...systemSettings, ...updated };
      result = { success: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' };
    }

    if (result && result.success) {
      alert(result.message);
      systemSettings = { ...systemSettings, ...updated };
      applySettingsToUI();
    } else {
      alert(result.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.toString());
  } finally {
    btn.disabled = false;
    btn.textContent = 'บันทึกการตั้งค่าทั้งหมด';
  }
}
