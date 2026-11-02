/* Shared mock data — single source of truth. Today = 02/11/2026.
   Consistent with docs/04-design-brief.md §5 and QA rulings in docs/03-qa-report.md.
   Structure: master data (categories, materials, vendors, users, contracts) + documents (docs: PR/TND/PO/GRN/CT/INV/NCR)
   + workflow (approvals, notifications) + analytics (kpi, otif, spend). All transactional records carry Material IDs. */
window.DATA = {
  today: '02/11/2026',

  categories: [
    { code: 'CON', name: 'Construction', vi: 'Xây dựng', range: [24000, 29999], next: 24331 },
    { code: 'EQP', name: 'Equipment', vi: 'Thiết bị', range: [31000, 39999], next: 31521 },
    { code: 'SRV', name: 'Services', vi: 'Dịch vụ', range: [52000, 59999], next: 52211 },
    { code: 'LOG', name: 'Logistics', vi: 'Logistics', range: [61000, 69999], next: 61046 }
  ],

  /* Universe counters for the Material ID master (only a sample of records is loaded) */
  materialStats: { total: 1284, active: 1236, pending: 9, singleSource: 37 },

  users: [
    { email: 'minhanh.nguyen@gmail.com', name: 'Nguyễn Minh Anh', title: 'Procurement Lead', roles: ['procurement', 'admin'], status: 'Active', consent: '05/01/2026', twoStep: true },
    { email: 'quochuy.le@gmail.com', name: 'Lê Quốc Huy', title: 'Buyer – Equipment', roles: ['procurement'], status: 'Active', consent: '06/01/2026' },
    { email: 'baongoc.tran@gmail.com', name: 'Trần Bảo Ngọc', title: 'Buyer – Services & Logistics', roles: ['procurement'], status: 'Active', consent: '06/01/2026' },
    { email: 'hoangnam.do@gmail.com', name: 'Đỗ Hoàng Nam', title: 'Finance Director (approver)', roles: ['procurement'], status: 'Active', consent: '08/01/2026', twoStep: true },
    { email: 'thutrang.pham@gmail.com', name: 'Phạm Thu Trang', title: 'System Admin', roles: ['admin'], status: 'Active', consent: '02/01/2026', twoStep: true },
    { email: 'sales.minhphat@gmail.com', name: 'Võ Thị Lan', title: 'Supplier user · V-1001', roles: ['supplier'], vendor: 'V-1001', status: 'Active', consent: '12/01/2026' },
    { email: 'daiphong.equip@gmail.com', name: 'Phạm Văn Đức', title: 'Supplier user · V-1003', roles: ['supplier'], vendor: 'V-1003', status: 'Active', consent: '15/01/2026' },
    { email: 'kho.phumy@gmail.com', name: 'Huỳnh Gia Bảo', title: 'Supplier user · V-1007', roles: ['supplier'], vendor: 'V-1007', status: 'Invited', invited: '30/10/2026', inviteCode: 'PL-INV-7Q4K' }
  ],

  materials: [
    { id: 'CON-24015', cat: 'CON', group: 'Thép xây dựng', name: 'Thép cây D16 CB400-V', en: 'Rebar D16 CB400-V', uom: 'tấn', alt: [['cây (11,7 m)', '1 tấn = 54 cây'], ['kg', '1 tấn = 1.000 kg']], status: 'Active', hs: '7214.20', lead: 7, moq: '5 tấn',
      spec: [['Diameter', '16 mm'], ['Grade', 'CB400-V'], ['Standard', 'TCVN 1651-2:2018'], ['Length', '11,7 m']],
      vat: 10, vat8: false, vatConfirmed: 'Đỗ Hoàng Nam · 12/01/2026', last: 15200000, lastPo: 'PO-2026-0877', lastVendor: 'V-1001', avg90: 16050000, avg12: 16170000,
      series: [16400000, 16500000, 16540000, 16500000, 16550000, 16300000, 16200000, 16100000, 16000000, 15950000, 15800000, 15200000],
      vendors: [['V-1001', 'Preferred', 15200000, 7, 95.8], ['V-1002', 'Approved', 16450000, 10, 91.2], ['V-1011', 'Approved', 16300000, 9, 89.1], ['V-1008', 'Blocked', 16600000, 12, 84.0, 'ISO 9001 expired 15/10/2026']],
      contracts: ['CT-2026-008'], certs: [['CO/CQ per lot', 'At GRN'], ['Hợp quy QCVN 7:2019/BKHCN', 'Valid on PO date'], ['ISO 9001', 'At tender and PO date']],
      otif: [27, 29], spendYtd: 9.82, owner: 'Nguyễn Minh Anh', created: '14/03/2024' },
    { id: 'CON-24020', cat: 'CON', group: 'Thép xây dựng', name: 'Thép cây D20 CB400-V', en: 'Rebar D20 CB400-V', uom: 'tấn', alt: [['cây (11,7 m)', '1 tấn = 35 cây']], status: 'Active', hs: '7214.20', lead: 7, moq: '5 tấn',
      spec: [['Diameter', '20 mm'], ['Grade', 'CB400-V'], ['Standard', 'TCVN 1651-2:2018']],
      vat: 10, vat8: false, vatConfirmed: 'Đỗ Hoàng Nam · 12/01/2026', last: 15350000, lastPo: 'PO-2026-0866', lastVendor: 'V-1001', avg90: 15620000, avg12: 15900000,
      vendors: [['V-1001', 'Preferred', 15350000, 7, 95.8], ['V-1008', 'Probation', 15900000, 12, 84.0]],
      contracts: ['CT-2026-008'], certs: [['CO/CQ per lot', 'At GRN'], ['Hợp quy QCVN 7:2019/BKHCN', 'Valid on PO date']], otif: [14, 15], spendYtd: 5.4, owner: 'Nguyễn Minh Anh', created: '14/03/2024' },
    { id: 'CON-24102', cat: 'CON', group: 'Xi măng', name: 'Xi măng PCB40', en: 'Portland cement PCB40', uom: 'tấn', alt: [['bao 50 kg', '1 tấn = 20 bao']], status: 'Active', hs: '2523.29', lead: 3, moq: '10 tấn',
      spec: [['Type', 'PCB40'], ['Standard', 'TCVN 6260:2020'], ['Packing', 'Bao 50 kg / xá']],
      vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 12/01/2026', last: 1680000, lastPo: 'PO-2026-0861', lastVendor: 'V-1002', avg90: 1579000, avg12: 1605000,
      vendors: [['V-1002', 'Preferred', 1680000, 3, 91.2], ['V-1001', 'Approved', 1640000, 4, 95.8]],
      contracts: [], certs: [['CO/CQ per lot', 'At GRN'], ['Hợp quy QCVN 16:2023/BXD', 'Valid on PO date']], otif: [21, 24], spendYtd: 6.1, owner: 'Nguyễn Minh Anh', created: '20/03/2024' },
    { id: 'CON-24325', cat: 'CON', group: 'Bê tông', name: 'Bê tông thương phẩm M250', en: 'Ready-mix concrete M250', uom: 'm³', alt: [], status: 'Active', hs: '3824.50', lead: 2, moq: '10 m³',
      spec: [['Grade', 'M250'], ['Slump', '12 ± 2 cm']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 12/01/2026', last: 1150000, lastPo: 'PO-2026-0844', lastVendor: 'V-1009', avg90: 1140000, avg12: 1135000,
      vendors: [['V-1009', 'Preferred', 1150000, 2, 92.4], ['V-1002', 'Approved', 1175000, 2, 91.2]], contracts: [], certs: [['Phiếu kết quả nén mẫu', 'At GRN']], otif: [18, 19], spendYtd: 1.9, owner: 'Nguyễn Minh Anh', created: '02/04/2024' },
    { id: 'CON-24330', cat: 'CON', group: 'Bê tông', name: 'Bê tông thương phẩm M300', en: 'Ready-mix concrete M300', uom: 'm³', alt: [], status: 'Active', hs: '3824.50', lead: 2, moq: '10 m³',
      spec: [['Grade', 'M300'], ['Slump', '12 ± 2 cm'], ['Max aggregate', '20 mm']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 12/01/2026', last: 1320000, lastPo: 'PO-2026-0848', lastVendor: 'V-1009', avg90: 1305000, avg12: 1290000,
      vendors: [['V-1009', 'Preferred', 1320000, 2, 92.4], ['V-1002', 'Approved', 1345000, 2, 91.2], ['V-1010', 'Approved', 1360000, 3, 90.0]], contracts: [], certs: [['Phiếu kết quả nén mẫu', 'At GRN'], ['ISO 9001', 'At tender and PO date']], otif: [22, 24], spendYtd: 4.6, owner: 'Nguyễn Minh Anh', created: '02/04/2024' },
    { id: 'EQP-31007', cat: 'EQP', group: 'Máy phát điện', name: 'Máy phát điện 500kVA', en: 'Diesel generator 500 kVA', uom: 'bộ', alt: [], status: 'Active', hs: '8502.13', lead: 60, moq: '1 bộ',
      spec: [['Power', '500 kVA standby'], ['Voltage', '400 V / 3 pha'], ['Enclosure', 'Cách âm']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 1610000000, lastPo: 'PO-2026-0702', lastVendor: 'V-1003', avg90: 1610000000, avg12: 1595000000,
      vendors: [['V-1003', 'Preferred', 1610000000, 60, 89.5]], contracts: ['CT-2026-014'], certs: [['CO/CQ per unit', 'At GRN'], ['ISO 9001', 'At tender and PO date']], otif: [3, 3], spendYtd: 3.2, owner: 'Lê Quốc Huy', created: '11/05/2024' },
    { id: 'EQP-31244', cat: 'EQP', group: 'Bơm', name: 'Bơm ly tâm 75kW', en: 'Centrifugal pump 75 kW', uom: 'cái', alt: [], status: 'Active', hs: '8413.70', lead: 45, moq: '1 cái',
      spec: [['Power', '75 kW'], ['Flow', '320 m³/h'], ['Head', '55 m']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 182000000, lastPo: 'PO-2026-0855', lastVendor: 'V-1003', avg90: 173000000, avg12: 171500000,
      vendors: [['V-1003', 'Preferred', 182000000, 45, 89.5], ['V-1004', 'Approved', 178500000, 50, 88.0]], contracts: [], certs: [['CO/CQ per unit', 'At GRN']], otif: [7, 8], spendYtd: 2.2, owner: 'Lê Quốc Huy', created: '11/05/2024' },
    { id: 'EQP-31310', cat: 'EQP', group: 'Máy nén khí', name: 'Máy nén khí trục vít 37kW', en: 'Screw air compressor 37 kW', uom: 'cái', alt: [], status: 'Active', hs: '8414.80', lead: 40, moq: '1 cái',
      spec: [['Power', '37 kW'], ['Pressure', '8 bar']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 265000000, lastPo: 'PO-2026-0790', lastVendor: 'V-1003', avg90: 262000000, avg12: 259000000,
      vendors: [['V-1003', 'Preferred', 265000000, 40, 89.5], ['V-1004', 'Approved', 271000000, 45, 88.0]], contracts: [], certs: [['CO/CQ per unit', 'At GRN']], otif: [4, 4], spendYtd: 1.06, owner: 'Lê Quốc Huy', created: '20/06/2024' },
    { id: 'EQP-31402', cat: 'EQP', group: 'Tủ điện', name: 'Tủ điện phân phối MSB', en: 'Main switchboard (MSB)', uom: 'bộ', alt: [], status: 'Active', hs: '8537.10', lead: 30, moq: '1 bộ',
      spec: [['Rated current', '2.500 A'], ['IP', 'IP42']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 196000000, lastPo: 'PO-2026-0781', lastVendor: 'V-1004', avg90: 195000000, avg12: 194000000,
      vendors: [['V-1004', 'Preferred', 196000000, 30, 88.0], ['V-1003', 'Approved', 199000000, 35, 89.5]], contracts: [], certs: [['CO/CQ per unit', 'At GRN'], ['Test report IEC 61439', 'At GRN']], otif: [5, 6], spendYtd: 0.98, owner: 'Lê Quốc Huy', created: '20/06/2024' },
    { id: 'EQP-31455', cat: 'EQP', group: 'Biến tần', name: 'Biến tần 55kW', en: 'Variable frequency drive 55 kW', uom: 'cái', alt: [], status: 'Active', hs: '8504.40', lead: 21, moq: '1 cái',
      spec: [['Power', '55 kW'], ['Input', '380–480 V']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 74500000, lastPo: 'PO-2026-0772', lastVendor: 'V-1004', avg90: 74000000, avg12: 73200000,
      vendors: [['V-1004', 'Preferred', 74500000, 21, 88.0]], contracts: [], certs: [['CO/CQ per unit', 'At GRN']], otif: [6, 6], spendYtd: 0.45, owner: 'Lê Quốc Huy', created: '02/07/2024' },
    { id: 'EQP-31501', cat: 'EQP', group: 'Thông gió', name: 'Quạt hút công nghiệp', en: 'Industrial exhaust fan', uom: 'cái', alt: [], status: 'Active', hs: '8414.59', lead: 14, moq: '2 cái',
      spec: [['Diameter', '1.380 mm'], ['Power', '1,1 kW']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 6800000, lastPo: 'PO-2026-0760', lastVendor: 'V-1004', avg90: 6750000, avg12: 6700000,
      vendors: [['V-1004', 'Preferred', 6800000, 14, 88.0], ['V-1003', 'Approved', 7100000, 14, 89.5]], contracts: [], certs: [], otif: [9, 10], spendYtd: 0.14, owner: 'Lê Quốc Huy', created: '02/07/2024' },
    { id: 'EQP-31520', cat: 'EQP', group: 'Bơm', name: 'Bơm chìm nước thải 15kW', en: 'Submersible sewage pump 15 kW', uom: 'cái', alt: [], status: 'Pending approval', step: 'Step 2 of 3', hs: '8413.70', lead: 30, moq: '1 cái',
      spec: [['Power', '15 kW'], ['Flow', '120 m³/h']], vat: 8, vat8: true, vatConfirmed: null, last: null, lastPo: null, avg90: null, avg12: null,
      vendors: [], contracts: [], certs: [['CO/CQ per unit', 'At GRN']], otif: [0, 0], spendYtd: 0, owner: 'Lê Quốc Huy', created: '30/10/2026' },
    { id: 'SRV-52003', cat: 'SRV', group: 'Bảo trì', name: 'Bảo trì hệ thống HVAC', en: 'HVAC maintenance', uom: 'tháng', alt: [], status: 'Active', hs: '—', lead: 0, moq: '12 tháng',
      spec: [['Scope', 'Văn phòng HCM + nhà máy Bình Dương'], ['Response SLA', '4 giờ']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 48000000, lastPo: 'PO-2026-0870', lastVendor: 'V-1005', avg90: 48000000, avg12: 47500000,
      vendors: [['V-1005', 'Preferred', 48000000, 0, 96.0]], contracts: ['CT-2026-011'], certs: [['ISO 9001', 'At tender and PO date']], otif: [10, 10], spendYtd: 0.48, owner: 'Trần Bảo Ngọc', created: '05/01/2025' },
    { id: 'SRV-52118', cat: 'SRV', group: 'Vệ sinh', name: 'Dịch vụ vệ sinh công nghiệp', en: 'Industrial cleaning service', uom: 'tháng', alt: [], status: 'Active', hs: '—', lead: 0, moq: '6 tháng',
      spec: [['Area', '12.000 m²'], ['Shifts', '2 ca/ngày']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 62000000, lastPo: 'PO-2026-0831', lastVendor: 'V-1005', avg90: 61500000, avg12: 60800000,
      vendors: [['V-1005', 'Preferred', 62000000, 0, 96.0], ['V-1004', 'Approved', 64000000, 0, 88.0]], contracts: [], certs: [], otif: [10, 10], spendYtd: 0.62, owner: 'Trần Bảo Ngọc', created: '05/01/2025' },
    { id: 'SRV-52210', cat: 'SRV', group: 'Dịch vụ thi công', name: 'Dịch vụ bơm bê tông', en: 'Concrete pumping service', uom: 'ca', alt: [], status: 'Active', hs: '—', lead: 1, moq: '1 ca',
      spec: [['Boom', '37 m'], ['Shift', '8 giờ']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 6500000, lastPo: 'PO-2026-0848', lastVendor: 'V-1009', avg90: 6450000, avg12: 6400000,
      vendors: [['V-1009', 'Preferred', 6500000, 1, 92.4], ['V-1010', 'Approved', 6700000, 1, 90.0]], contracts: [], certs: [], otif: [12, 12], spendYtd: 0.31, owner: 'Trần Bảo Ngọc', created: '18/02/2025' },
    { id: 'LOG-61012', cat: 'LOG', group: 'Vận chuyển', name: 'Vận chuyển container 40ft HCM–HN', en: 'Container 40ft trucking HCM–HN', uom: 'chuyến', alt: [], status: 'Active', hs: '—', lead: 3, moq: '1 chuyến',
      spec: [['Route', 'TP.HCM → Hà Nội'], ['Container', '40ft HC']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 18500000, lastPo: 'PO-2026-0874', lastVendor: 'V-1006', avg90: 16990000, avg12: 16700000,
      vendors: [['V-1006', 'Preferred', 18500000, 3, 86.7]], contracts: ['CT-2025-019'], certs: [], otif: [39, 45], spendYtd: 4.1, owner: 'Trần Bảo Ngọc', created: '10/01/2024' },
    { id: 'LOG-61013', cat: 'LOG', group: 'Vận chuyển', name: 'Vận chuyển cont 40 feet HCM - Hà Nội', en: 'Duplicate of LOG-61012', uom: 'chuyến', alt: [], status: 'Blocked', hs: '—', lead: 3, moq: '1 chuyến',
      spec: [['Blocked reason', 'Duplicate of LOG-61012 — number not reused']], vat: 8, vat8: true, vatConfirmed: null, last: null, lastPo: null, avg90: null, avg12: null,
      vendors: [], contracts: [], certs: [], otif: [0, 0], spendYtd: 0, owner: 'Trần Bảo Ngọc', created: '27/10/2026' },
    { id: 'LOG-61045', cat: 'LOG', group: 'Kho bãi', name: 'Thuê kho bãi', en: 'Warehouse rental', uom: 'm²/tháng', alt: [], status: 'Active', hs: '—', lead: 0, moq: '500 m²',
      spec: [['Location', 'KCN Phú Mỹ, Bà Rịa – Vũng Tàu'], ['Type', 'Kho khô']], vat: 8, vat8: true, vatConfirmed: 'Đỗ Hoàng Nam · 15/01/2026', last: 105000, lastPo: 'PO-2026-0812', lastVendor: 'V-1006', avg90: 104000, avg12: 102000,
      vendors: [['V-1006', 'Approved', 105000, 0, 86.7]], contracts: [], certs: [], otif: [10, 10], spendYtd: 1.26, owner: 'Trần Bảo Ngọc', created: '10/01/2024' }
  ],

  vendors: [
    { id: 'V-1001', name: 'Công ty TNHH Thép Minh Phát', cat: 'Construction', status: 'Preferred', score: 4.32, grade: 'A', otif: 95.8, email: 'sales.minhphat@gmail.com', contact: 'Võ Thị Lan', mst: '0315 284 671', risk: 'Low', city: 'TP.HCM' },
    { id: 'V-1002', name: 'CTCP VLXD An Khang', cat: 'Construction', status: 'Approved', score: 3.98, grade: 'B', otif: 91.2, email: 'kinhdoanh.ankhang@gmail.com', contact: 'Ngô Văn Tài', mst: '0313 902 118', risk: 'Low', city: 'Đồng Nai' },
    { id: 'V-1003', name: 'Công ty TNHH Thiết bị Công nghiệp Đại Phong', cat: 'Equipment', status: 'Preferred', score: 4.05, grade: 'B', otif: 89.5, email: 'daiphong.equip@gmail.com', contact: 'Phạm Văn Đức', mst: '0312 456 789', risk: 'Medium', city: 'Bình Dương' },
    { id: 'V-1004', name: 'CTCP Cơ điện Trường Sơn', cat: 'Equipment / Services', status: 'Approved', score: 3.82, grade: 'B', otif: 88.0, email: 'truongson.me@gmail.com', contact: 'Đặng Thị Hoa', mst: '0310 771 245', risk: 'Low', city: 'TP.HCM' },
    { id: 'V-1005', name: 'Công ty TNHH Dịch vụ Kỹ thuật Hưng Long', cat: 'Services', status: 'Preferred', score: 4.10, grade: 'B', otif: 96.0, email: 'hunglong.service@gmail.com', contact: 'Bùi Minh Khoa', mst: '0314 559 830', risk: 'Low', city: 'TP.HCM' },
    { id: 'V-1006', name: 'CTCP Logistics Sao Việt', cat: 'Logistics', status: 'Approved', score: 3.65, grade: 'B', otif: 86.7, email: 'ops.saoviet@gmail.com', contact: 'Lý Thanh Tùng', mst: '0311 640 092', risk: 'Medium', city: 'TP.HCM' },
    { id: 'V-1007', name: 'Công ty TNHH Kho vận Phú Mỹ', cat: 'Logistics', status: 'Pending approval', score: null, grade: '—', otif: null, email: 'kho.phumy@gmail.com', contact: 'Huỳnh Gia Bảo', mst: '3502 418 776', risk: '—', city: 'Bà Rịa – Vũng Tàu' },
    { id: 'V-1008', name: 'CTCP Kim khí Bắc Sơn', cat: 'Construction', status: 'Probation', score: 3.40, grade: 'C', otif: 84.0, email: 'bacson.steel@gmail.com', contact: 'Trịnh Văn Hải', mst: '0106 228 914', risk: 'High', city: 'Hà Nội' },
    { id: 'V-1009', name: 'Công ty TNHH Bê tông Tân Phước', cat: 'Construction', status: 'Approved', score: 3.90, grade: 'B', otif: 92.4, email: 'betong.tanphuoc@gmail.com', contact: 'Châu Ngọc Mai', mst: '0315 003 627', risk: 'Low', city: 'TP.HCM' },
    { id: 'V-1010', name: 'CTCP Xây lắp Phước Thành', cat: 'Construction', status: 'Approved', score: 3.75, grade: 'B', otif: 90.0, email: 'phuocthanh.xl@gmail.com', contact: 'Lâm Quốc Việt', mst: '0314 870 251', risk: 'Low', city: 'Long An' },
    { id: 'V-1011', name: 'Công ty TNHH Thép Tân Long', cat: 'Construction', status: 'Approved', score: 3.71, grade: 'B', otif: 89.1, email: 'tanlong.steel@gmail.com', contact: 'Mạc Thị Thu', mst: '0316 125 480', risk: 'Low', city: 'Bình Dương' }
  ],

  /* Documents keyed by number. type: PR | TND | PO | GRN | CT | INV | NCR. mats = Material IDs. value excl. VAT. */
  docs: [
    { id: 'PR-2026-0412', type: 'PR', title: 'Nhà xưởng C2 · thép D16', date: '02/09/2026', status: 'Closed', mats: ['CON-24015'], value: 1316000000, by: 'Nguyễn Minh Anh', next: 'TND-2026-024' },
    { id: 'PR-2026-0431', type: 'PR', title: 'Máy phát điện 500kVA – Nhà máy Bình Dương', date: '30/10/2026', status: 'Awaiting approval', mats: ['EQP-31007'], value: 1850000000, by: 'Lê Quốc Huy' },
    { id: 'PR-2026-0436', type: 'PR', title: 'Tủ điện MSB – Nhà xưởng C2', date: '22/10/2026', status: 'Approved', mats: ['EQP-31402'], value: 386000000, by: 'Lê Quốc Huy' },
    { id: 'PR-2026-0438', type: 'PR', title: 'Quạt hút công nghiệp – Kho A', date: '29/10/2026', status: 'Awaiting approval', mats: ['EQP-31501'], value: 86000000, by: 'Lê Quốc Huy' },
    { id: 'PR-2026-0440', type: 'PR', title: 'Dự án Kho B · thép, xi măng, bê tông', date: '20/10/2026', status: 'In tender', mats: ['CON-24015', 'CON-24102', 'CON-24330'], value: 3450000000, by: 'Nguyễn Minh Anh', next: 'TND-2026-031' },
    { id: 'PR-2026-0452', type: 'PR', title: 'Dự án Kho B · giai đoạn 2', date: '31/10/2026', status: 'Draft', mats: ['CON-24015', 'CON-24020', 'CON-24330', 'CON-24102', 'SRV-52210'], value: 4004500000, by: 'Nguyễn Minh Anh' },
    { id: 'TND-2026-024', type: 'TND', title: 'Thép D16 – Nhà xưởng C2', cat: 'CON', date: '18/09/2026', close: '30/09/2026', status: 'Awarded', mats: ['CON-24015'], invited: 4, bids: 4, award: 'V-1001' },
    { id: 'TND-2026-027', type: 'TND', title: 'Vận chuyển nội địa Q4/2026', cat: 'LOG', date: '01/09/2026', close: '15/09/2026', status: 'Awarded', mats: ['LOG-61012'], invited: 3, bids: 3, award: 'V-1006' },
    { id: 'TND-2026-029', type: 'TND', title: 'Bê tông thương phẩm – Nhà xưởng C2', cat: 'CON', date: '15/10/2026', close: '30/10/2026', status: 'Evaluation', mats: ['CON-24330', 'CON-24325', 'SRV-52210'], invited: 4, bids: 4, note: 'Evaluation due 04/11/2026' },
    { id: 'TND-2026-030', type: 'TND', title: 'Vệ sinh công nghiệp 2027', cat: 'SRV', date: '28/10/2026', close: '18/11/2026', status: 'Open', mats: ['SRV-52118'], invited: 4, bids: 0 },
    { id: 'TND-2026-031', type: 'TND', title: 'Thép & xi măng – Dự án Kho B', cat: 'CON', date: '22/10/2026', close: '05/11/2026', status: 'Open', mats: ['CON-24015', 'CON-24102', 'CON-24330'], invited: 5, bids: 4, sealed: true, note: 'Sealed until 05/11/2026 17:00' },
    { id: 'TND-2026-032', type: 'TND', title: 'Bơm ly tâm 75kW ×6', cat: 'EQP', date: '26/10/2026', close: '12/11/2026', status: 'Q&A', mats: ['EQP-31244'], invited: 3, bids: 1 },
    { id: 'TND-2026-033', type: 'TND', title: 'Bảo trì HVAC văn phòng 2027', cat: 'SRV', date: '20/10/2026', close: '07/11/2026', status: 'Open', mats: ['SRV-52003'], invited: 3, bids: 2 },
    { id: 'TND-2026-034', type: 'TND', title: 'Container 40ft HCM–HN Q1/2027', cat: 'LOG', date: '27/10/2026', close: '10/11/2026', status: 'Open', mats: ['LOG-61012'], invited: 4, bids: 1, note: '8% reduction ends 31/12/2026 — rate is set at invoice date' },
    { id: 'TND-2026-035', type: 'TND', title: 'Biến tần 55kW – dây chuyền 3', cat: 'EQP', date: '30/10/2026', close: '20/11/2026', status: 'Open', mats: ['EQP-31455'], invited: 3, bids: 0 },
    { id: 'PO-2026-0791', type: 'PO', title: 'Thép D16 – Nhà xưởng C1', date: '12/09/2026', status: 'Closed', mats: ['CON-24015'], vendor: 'V-1002', qty: '60 tấn', price: 16450000, value: 987000000 },
    { id: 'PO-2026-0812', type: 'PO', title: 'Thuê kho bãi Phú Mỹ Q4', date: '25/09/2026', status: 'Delivered', mats: ['LOG-61045'], vendor: 'V-1006', qty: '1.000 m²/tháng', price: 105000, value: 315000000 },
    { id: 'PO-2026-0846', type: 'PO', title: 'Quạt hút công nghiệp – Kho C', date: '05/10/2026', status: 'Delivered', mats: ['EQP-31501'], vendor: 'V-1004', qty: '13 cái', price: 6615000, value: 86000000 },
    { id: 'PO-2026-0848', type: 'PO', title: 'Bê tông M300 + bơm – Kho A', date: '07/10/2026', status: 'Delivered', mats: ['CON-24330', 'SRV-52210'], vendor: 'V-1009', qty: '420 m³', price: 1320000, value: 580400000 },
    { id: 'PO-2026-0858', type: 'PO', title: 'Release CT-2026-008 · thép D16', date: '14/10/2026', status: 'Delivered', mats: ['CON-24015'], vendor: 'V-1001', qty: '45 tấn', price: 15627500, value: 703237500 },
    { id: 'PO-2026-0861', type: 'PO', title: 'Xi măng PCB40 – Dự án Kho A', date: '16/10/2026', status: 'Partially received', mats: ['CON-24102'], vendor: 'V-1002', qty: '120 tấn', price: 1680000, value: 201600000, note: 'NCR-2026-014 open · 5 tấn rejected' },
    { id: 'PO-2026-0866', type: 'PO', title: 'Thép D20 – Nhà xưởng C2', date: '19/10/2026', status: 'Partially received', mats: ['CON-24020'], vendor: 'V-1001', qty: '30 tấn', price: 15350000, value: 460500000 },
    { id: 'PO-2026-0869', type: 'PO', title: 'Bơm ly tâm 75kW – Nhà máy Bình Dương', date: '29/10/2026', status: 'Sent · not confirmed', mats: ['EQP-31244'], vendor: 'V-1003', qty: '2 cái', price: 182000000, value: 364000000, note: '3 days overdue' },
    { id: 'PO-2026-0874', type: 'PO', title: 'Container HCM–HN tháng 10', date: '20/10/2026', status: 'Delivered', mats: ['LOG-61012'], vendor: 'V-1006', qty: '12 chuyến', price: 18500000, value: 222000000 },
    { id: 'PO-2026-0877', type: 'PO', title: 'Thép D16 – Nhà xưởng C2 (TND-2026-024)', date: '21/10/2026', status: 'Partially received', mats: ['CON-24015'], vendor: 'V-1001', qty: '80 tấn', price: 15200000, value: 1216000000, note: 'GRN-2026-1532 50 tấn 28/10 · 30 tấn due 06/11 · Rev.2 pending' },
    { id: 'PO-2026-0882', type: 'PO', title: 'Tủ điện MSB – Nhà xưởng C2', date: '02/11/2026', status: 'Draft', mats: ['EQP-31402'], vendor: 'V-1004', qty: '2 bộ', price: 193000000, value: 386000000 },
    { id: 'GRN-2026-1470', type: 'GRN', title: 'Thuê kho bãi Phú Mỹ · tháng 9', date: '30/09/2026', status: 'Accepted', mats: ['LOG-61045'], vendor: 'V-1006', po: 'PO-2026-0812' },
    { id: 'GRN-2026-1490', type: 'GRN', title: 'Thép D16 · 45 tấn (CT-2026-008 release)', date: '16/10/2026', status: 'Accepted', mats: ['CON-24015'], vendor: 'V-1001', po: 'PO-2026-0858' },
    { id: 'GRN-2026-1497', type: 'GRN', title: 'Quạt hút công nghiệp · 13 cái', date: '18/10/2026', status: 'Accepted', mats: ['EQP-31501'], vendor: 'V-1004', po: 'PO-2026-0846' },
    { id: 'GRN-2026-1501', type: 'GRN', title: 'Bê tông M300 · 420 m³ + bơm 4 ca', date: '20/10/2026', status: 'Accepted', mats: ['CON-24330', 'SRV-52210'], vendor: 'V-1009', po: 'PO-2026-0848' },
    { id: 'GRN-2026-1518', type: 'GRN', title: 'Xi măng PCB40 · 55 tấn accepted', date: '24/10/2026', status: 'Accepted with NCR', mats: ['CON-24102'], vendor: 'V-1002', po: 'PO-2026-0861' },
    { id: 'GRN-2026-1525', type: 'GRN', title: 'Container HCM–HN · 12 chuyến tháng 10', date: '31/10/2026', status: 'Accepted', mats: ['LOG-61012'], vendor: 'V-1006', po: 'PO-2026-0874' },
    { id: 'GRN-2026-1528', type: 'GRN', title: 'Thép D20 · lô 1 · 15 tấn', date: '27/10/2026', status: 'Accepted', mats: ['CON-24020'], vendor: 'V-1001', po: 'PO-2026-0866' },
    { id: 'GRN-2026-1532', type: 'GRN', title: 'Thép D16 · 50 tấn on time & in full', date: '28/10/2026', status: 'Accepted', mats: ['CON-24015'], vendor: 'V-1001', po: 'PO-2026-0877' },
    { id: 'GRN-2026-1539', type: 'GRN', title: 'Thép D20 · lô 2 · 15 tấn quarantined (thiếu CQ)', date: '31/10/2026', status: 'Rejected with NCR', mats: ['CON-24020'], vendor: 'V-1001', po: 'PO-2026-0866' },
    { id: 'CT-2025-007', type: 'CT', title: 'Fixed price – Xi măng An Khang 2025–2026', date: '01/10/2025', status: 'Expired', mats: ['CON-24102'], vendor: 'V-1002', note: 'Expired 30/09/2026' },
    { id: 'CT-2025-019', type: 'CT', title: 'Rate card Logistics Sao Việt', date: '01/01/2025', status: 'Expiring', mats: ['LOG-61012'], vendor: 'V-1006', note: 'Expires 31/12/2026' },
    { id: 'CT-2026-008', type: 'CT', title: 'Framework – Thép Minh Phát 2026', date: '01/01/2026', status: 'Expiring', mats: ['CON-24015', 'CON-24020'], vendor: 'V-1001', note: '1.200 tấn commitment · 640 tấn released · 01/01–31/12/2026' },
    { id: 'CT-2026-011', type: 'CT', title: 'HVAC maintenance SLA – Hưng Long', date: '01/04/2026', status: 'Active', mats: ['SRV-52003'], vendor: 'V-1005' },
    { id: 'CT-2026-014', type: 'CT', title: 'Generator maintenance – Đại Phong', date: '28/10/2026', status: 'Pending signature', mats: ['EQP-31007'], vendor: 'V-1003', value: 240000000 },
    { id: 'INV-2026-0314', type: 'INV', title: 'Thuê kho bãi tháng 9', date: '05/10/2026', status: 'Ready for payment', mats: ['LOG-61045'], vendor: 'V-1006', value: 105000000 },
    { id: 'INV-2026-0318', type: 'INV', title: 'Thép D16 – PO-2026-0858', date: '20/10/2026', status: 'Matched', mats: ['CON-24015'], vendor: 'V-1001', value: 703237500 },
    { id: 'INV-2026-0319', type: 'INV', title: 'Thép D16 – GRN-2026-1532', date: '29/10/2026', status: 'Matched', mats: ['CON-24015'], vendor: 'V-1001', value: 760000000 },
    { id: 'INV-2026-0320', type: 'INV', title: 'Xi măng PCB40 – GRN-2026-1518', date: '26/10/2026', status: 'Exception · price +1,2%', mats: ['CON-24102'], vendor: 'V-1002', value: 93500000 },
    { id: 'INV-2026-0321', type: 'INV', title: 'Bê tông M300 – PO-2026-0848', date: '28/10/2026', status: 'Blocked · legal check', mats: ['CON-24330'], vendor: 'V-1009', value: 290400000 },
    { id: 'INV-2026-0322', type: 'INV', title: 'Container HCM–HN – PO-2026-0874', date: '30/10/2026', status: 'Exception · price +2,7%', mats: ['LOG-61012'], vendor: 'V-1006', value: 228000000 },
    { id: 'INV-2026-0323', type: 'INV', title: 'Vật tư phụ – Trường Sơn', date: '31/10/2026', status: '1 line: No Material ID', mats: ['EQP-31501'], vendor: 'V-1004', value: 14200000 },
    { id: 'INV-2026-0324', type: 'INV', title: 'Vệ sinh công nghiệp T10 – PO-2026-0831', date: '01/11/2026', status: 'Matched', mats: ['SRV-52118'], vendor: 'V-1005', value: 62000000 },
    { id: 'NCR-2026-009', type: 'NCR', title: 'Thép D16 · sai lệch khối lượng lô 3', date: '18/08/2026', status: 'Closed · accepted with discount', mats: ['CON-24015'], vendor: 'V-1001', po: 'PO-2026-0705' },
    { id: 'NCR-2026-014', type: 'NCR', title: 'Xi măng PCB40 · 5 tấn bao rách, ẩm', date: '24/10/2026', status: 'Open', mats: ['CON-24102'], vendor: 'V-1002', po: 'PO-2026-0861' },
    { id: 'NCR-2026-017', type: 'NCR', title: 'Thép D20 · thiếu CQ lô 2', date: '31/10/2026', status: 'Awaiting supplier', mats: ['CON-24020'], vendor: 'V-1001', po: 'PO-2026-0866' },
    { id: 'PO-2026-0702', type: 'PO', title: 'Máy phát điện 500kVA – Nhà máy Bình Dương', date: '18/05/2026', status: 'Closed', mats: ['EQP-31007'], vendor: 'V-1003', qty: '1 bộ', price: 1610000000, value: 1610000000 },
    { id: 'PO-2026-0760', type: 'PO', title: 'Quạt hút công nghiệp – Kho B', date: '08/08/2026', status: 'Closed', mats: ['EQP-31501'], vendor: 'V-1004', qty: '12 cái', price: 6800000, value: 81600000 },
    { id: 'PO-2026-0772', type: 'PO', title: 'Biến tần 55kW – Dây chuyền 2', date: '20/08/2026', status: 'Closed', mats: ['EQP-31455'], vendor: 'V-1004', qty: '2 cái', price: 74500000, value: 149000000 },
    { id: 'PO-2026-0781', type: 'PO', title: 'Tủ điện phân phối MSB – Kho A', date: '28/08/2026', status: 'Closed', mats: ['EQP-31402'], vendor: 'V-1004', qty: '1 bộ', price: 196000000, value: 196000000 },
    { id: 'PO-2026-0790', type: 'PO', title: 'Máy nén khí trục vít 37kW', date: '11/09/2026', status: 'Closed', mats: ['EQP-31310'], vendor: 'V-1003', qty: '1 cái', price: 265000000, value: 265000000 },
    { id: 'PO-2026-0831', type: 'PO', title: 'Dịch vụ vệ sinh công nghiệp T10', date: '01/10/2026', status: 'Delivered', mats: ['SRV-52118'], vendor: 'V-1005', qty: '1 tháng', price: 62000000, value: 62000000 },
    { id: 'PO-2026-0844', type: 'PO', title: 'Bê tông M250 – Kho A', date: '03/10/2026', status: 'Closed', mats: ['CON-24325'], vendor: 'V-1009', qty: '300 m³', price: 1150000, value: 345000000 },
    { id: 'PO-2026-0855', type: 'PO', title: 'Bơm ly tâm 75kW – Trạm bơm', date: '13/10/2026', status: 'Delivered', mats: ['EQP-31244'], vendor: 'V-1003', qty: '2 cái', price: 182000000, value: 364000000 },
    { id: 'PO-2026-0889', type: 'PO', title: 'Release CT-2026-008 · thép D20 – Dự án Kho B', date: '01/11/2026', status: 'Sent · not confirmed', mats: ['CON-24020'], vendor: 'V-1001', qty: '20 tấn', price: 14354500, value: 287090000, note: 'Confirm within 48 h · due 03/11/2026 16:00' },
    { id: 'PO-2026-0870', type: 'PO', title: 'Bảo trì hệ thống HVAC T11', date: '27/10/2026', status: 'Confirmed', mats: ['SRV-52003'], vendor: 'V-1005', qty: '1 tháng', price: 48000000, value: 48000000 }
  ],

  /* Attachments linked by Material ID (R-19) */
  attachments: [
    { id: 'ATT-24015-01', mat: 'CON-24015', type: 'Spec sheet', name: 'TCVN 1651-2_D16_CB400V.pdf', ver: 'v2', date: '14/03/2024' },
    { id: 'ATT-24015-02', mat: 'CON-24015', type: 'Certificate', name: 'CQ-MP-2610-118.pdf', ver: 'v1', date: '28/10/2026' },
    { id: 'ATT-24015-03', mat: 'CON-24015', type: 'Certificate', name: 'Hop-quy-QCVN7-MinhPhat.pdf', ver: 'v3', date: '05/02/2026' },
    { id: 'ATT-24102-01', mat: 'CON-24102', type: 'Spec sheet', name: 'PCB40_TCVN6260.pdf', ver: 'v1', date: '20/03/2024' },
    { id: 'ATT-31007-01', mat: 'EQP-31007', type: 'Datasheet', name: 'Generator_500kVA_datasheet.pdf', ver: 'v1', date: '11/05/2024' }
  ],

  /* Material master change log (last 7 days) */
  materialLog: [
    { at: '31/10/2026 16:20', mat: 'EQP-31520', who: 'Nguyễn Minh Anh', what: 'Step 1 approved (Requester → Material master owner) · duplicate check passed' },
    { at: '30/10/2026 10:05', mat: 'EQP-31520', who: 'Lê Quốc Huy', what: 'Submitted for approval · number reserved' },
    { at: '29/10/2026 14:40', mat: 'CON-24015', who: 'Nguyễn Minh Anh', what: 'Alt-UoM added: 1 tấn = 54 cây' },
    { at: '28/10/2026 09:12', mat: 'LOG-61013', who: 'Phạm Thu Trang', what: 'Blocked · duplicate of LOG-61012 (number not reused)' },
    { at: '27/10/2026 15:30', mat: 'CON-24102', who: 'Đỗ Hoàng Nam', what: 'VAT 8% (reduced, until 31/12/2026) confirmed by Finance' }
  ],

  /* Approval queue — 6 items waiting for Nguyễn Minh Anh (QA round 1 Q-03/Q-04/Q-05) */
  approvals: [
    { id: 'PR-2026-0431', type: 'PR approval', title: 'Máy phát điện 500kVA – Nhà máy Bình Dương', mats: ['EQP-31007'], value: 1850000000, by: 'Lê Quốc Huy', step: 'Step 2 of 3', sla: '02/11/2026 17:00', note: 'Capex rule: EQP- above 1 tỷ ₫ adds the Finance Director' },
    { id: 'PR-2026-0438', type: 'PR approval', title: 'Quạt hút công nghiệp – Kho A', mats: ['EQP-31501'], value: 86000000, by: 'Lê Quốc Huy', step: 'Step 1 of 1', sla: '03/11/2026 17:00' },
    { id: 'EQP-31520', type: 'New Material ID', title: 'Bơm chìm nước thải 15kW', mats: ['EQP-31520'], value: null, by: 'Lê Quốc Huy', step: 'Step 2 of 3', sla: '04/11/2026 17:00', note: 'Duplicate check passed' },
    { id: 'PO-2026-0877 Rev.2', type: 'PO change order', title: 'Thép D16 · 80 → 85 tấn', mats: ['CON-24015'], value: 1292000000, by: 'Nguyễn Minh Anh', step: 'Step 1 of 2', sla: '03/11/2026 12:00', sod: true, note: 'Blocked — SoD: you raised this change order' },
    { id: 'V-1001', type: 'Vendor change', title: 'Thép Minh Phát · new account Vietcombank ···· 5307', mats: [], value: null, by: 'Võ Thị Lan', step: 'Step 1 of 2', sla: '03/11/2026 17:00' },
    { id: 'INV-2026-0322', type: 'Invoice exception', title: 'Container HCM–HN · price +2,7% vs PO', mats: ['LOG-61012'], value: 228000000, by: 'Trần Bảo Ngọc', step: 'Step 1 of 1', sla: '04/11/2026 17:00' }
  ],

  /* Notifications for the signed-in Procurement user — 6 unread (R-15) */
  notifications: [
    { id: 'N-801', type: 'PR approval', text: 'PR-2026-0431 Máy phát điện 500kVA waits for your approval (1,85 tỷ ₫)', doc: 'PR-2026-0431', mats: ['EQP-31007'], at: '02/11/2026 08:15', read: false, action: 'Review', href: '#/approvals?id=PR-2026-0431' },
    { id: 'N-802', type: 'PO overdue', text: 'PO-2026-0869 not confirmed by Đại Phong — 3 days overdue, escalated to buyer', doc: 'PO-2026-0869', mats: ['EQP-31244'], at: '02/11/2026 07:00', read: false, action: 'Follow up', href: '#/po/PO-2026-0869' },
    { id: 'N-803', type: 'Invoice exception', text: 'INV-2026-0322 Sao Việt — unit price +2,7% vs PO-2026-0874 (tolerance ±0,5%)', doc: 'INV-2026-0322', mats: ['LOG-61012'], at: '01/11/2026 16:42', read: false, action: 'Resolve', href: '#/invoices/INV-2026-0322' },
    { id: 'N-804', type: 'Tender', text: 'TND-2026-031 closes 05/11/2026 17:00 · 4 of 5 bids received · sealed', doc: 'TND-2026-031', mats: ['CON-24015', 'CON-24102', 'CON-24330'], at: '01/11/2026 09:00', read: false, action: 'Open', href: '#/tenders/TND-2026-031' },
    { id: 'N-805', type: 'Evaluation', text: 'TND-2026-029 award recommendation due 04/11/2026 — submit the Tờ trình', doc: 'TND-2026-029', mats: ['CON-24330'], at: '31/10/2026 17:30', read: false, action: 'Evaluate', href: '#/tenders/TND-2026-029' },
    { id: 'N-806', type: 'Price alert', text: 'LOG-61012 last price 18.500.000 ₫ is +8,9% vs 90-day average', doc: 'PO-2026-0874', mats: ['LOG-61012'], at: '31/10/2026 11:05', read: false, action: 'Open', href: '#/material360?id=LOG-61012' },
    { id: 'N-790', type: 'Certificate', text: 'ISO 9001 of CTCP Kim khí Bắc Sơn expired 15/10/2026 — vendor blocked for CON-24015', doc: 'V-1008', mats: ['CON-24015'], at: '30/10/2026 08:00', read: true, action: 'Open', href: '#/material360?id=CON-24015' },
    { id: 'N-788', type: 'Delivery', text: 'GRN-2026-1532 received 50 tấn CON-24015 on time & in full', doc: 'GRN-2026-1532', mats: ['CON-24015'], at: '28/10/2026 15:20', read: true, action: 'Open', href: '#/material360?id=CON-24015' },
    { id: 'N-785', type: 'Price alert', text: 'CON-24102 last price 1.680.000 ₫ is +6,4% vs 90-day average', doc: 'PO-2026-0861', mats: ['CON-24102'], at: '16/10/2026 10:10', read: true, action: 'Open', href: '#/material360?id=CON-24102' }
  ],

  /* Dashboard analytics */
  kpi: {
    spendYtd: 186.4, spendPrevYtd: 171.2, savingYtd: 9.7, savingTarget: 4, otif90: 91.4, otifTarget: 95, openPr: 38, prAwaiting: 12, activeTenders: 7,
    byCat: {
      CON: { spend: [8.1, 8.6, 9.4, 9.0, 9.8, 9.5, 9.9, 9.2, 9.6, 9.5], saving: 5.1, otif: 93.2, openPr: 15, prAwaiting: 5, tenders: 2, vendors: 6 },
      EQP: { spend: [4.2, 3.8, 5.1, 4.6, 4.9, 5.3, 4.4, 5.0, 5.2, 5.8], saving: 2.6, otif: 88.4, openPr: 11, prAwaiting: 4, tenders: 2, vendors: 2 },
      SRV: { spend: [2.3, 2.4, 2.5, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.5], saving: 1.0, otif: 96.0, openPr: 7, prAwaiting: 2, tenders: 2, vendors: 2 },
      LOG: { spend: [2.0, 1.9, 2.1, 2.2, 2.1, 2.2, 2.3, 2.1, 2.2, 2.3], saving: 1.0, otif: 86.7, openPr: 5, prAwaiting: 1, tenders: 1, vendors: 2 }
    }
  },
  spendMonths: ['01/26', '02/26', '03/26', '04/26', '05/26', '06/26', '07/26', '08/26', '09/26', '10/26'],
  otif: {
    months: ['11/25', '12/25', '01/26', '02/26', '03/26', '04/26', '05/26', '06/26', '07/26', '08/26', '09/26', '10/26'],
    values: [88.2, 89.5, 87.9, 90.4, 91.0, 89.8, 92.1, 91.6, 92.8, 90.9, 92.4, 91.0],
    target: 95
  },
  priceAlertThreshold: 5
};

/* ---------- Phase 2: vendors, evaluation, contracts, certificates (Modules 4–7) ---------- */
(function (D) {
  /* Vendor profile extensions (F-20..F-26): tax check, risk reasons (R-16), bank change (R-08), proposed Material ID links */
  const ext = {
    'V-1001': { terms: '30 days · advance 30% / 70%', phone: '0283 812 4471', address: '125 Quốc lộ 1A, P. Bình Hưng Hòa, Q. Bình Tân, TP.HCM', since: '15/03/2019', riskReasons: ['NCR-2026-017 awaiting supplier (CON-24020 · minor)'],
      bank: { now: 'Vietcombank ···· 2210', pending: 'Vietcombank ···· 5307', requested: '30/10/2026 16:40', by: 'Võ Thị Lan (portal)' } },
    'V-1002': { terms: '45 days', phone: '0251 382 6650', address: 'KCN Biên Hòa 2, TP. Biên Hòa, Đồng Nai', since: '02/06/2020', riskReasons: ['NCR-2026-014 open (CON-24102 · 5 tấn bao rách)'], bank: { now: 'ACB ···· 5521' } },
    'V-1003': { terms: '30 days', phone: '0274 377 9012', address: 'KCN VSIP 1, TP. Thuận An, Bình Dương', since: '20/09/2018', riskReasons: ['Single source for EQP-31007', 'PO-2026-0869 not confirmed · 3 days overdue', 'ISO 9001 expires 28/11/2026'], bank: { now: 'Techcombank ···· 8843' } },
    'V-1004': { terms: '45 days', phone: '0283 991 2044', address: '88 Đường số 7, KCN Tân Tạo, Q. Bình Tân, TP.HCM', since: '11/01/2021', riskReasons: [], bank: { now: 'VietinBank ···· 1176' } },
    'V-1005': { terms: '30 days', phone: '0283 620 1188', address: '45 Nguyễn Văn Linh, Q.7, TP.HCM', since: '05/01/2022', riskReasons: [], bank: { now: 'Vietcombank ···· 4402' } },
    'V-1006': { terms: '30 days', phone: '0283 740 5599', address: '12 Đường D1, KCN Cát Lái, TP. Thủ Đức, TP.HCM', since: '10/01/2020', riskReasons: ['Single source for LOG-61012 and LOG-61045', 'OTIF 86,7% (below 90% watch level)', 'INV-2026-0322 price exception +2,7%'], bank: { now: 'MB ···· 7730' } },
    'V-1007': { terms: '30 days', phone: '0254 389 1020', address: 'KCN Phú Mỹ 1, TX. Phú Mỹ, Bà Rịa – Vũng Tàu', since: '30/10/2026', riskReasons: ['Onboarding review in progress'], bank: { now: '—', pending: 'Sacombank ···· 3318', requested: '31/10/2026 09:10', by: 'Huỳnh Gia Bảo (portal)' },
      onboarding: [['Company & MST check', 'OK'], ['Legal representative', 'OK'], ['Giấy CNĐKDN upload', 'OK'], ['Bank account', 'Missing'], ['Categories', 'OK'], ['Material IDs offered', 'OK'], ['Certificates', 'Missing'], ['Code-of-conduct acceptance', 'OK']],
      proposed: ['LOG-61045'] },
    'V-1008': { terms: '30 days', phone: '0243 765 2201', address: 'Lô C3, KCN Quang Minh, Mê Linh, Hà Nội', since: '08/04/2021', riskReasons: ['ISO 9001 expired 15/10/2026 (mandatory for CON-24015)', 'OTIF 84,0% < 85%'], bank: { now: 'BIDV ···· 6604' } },
    'V-1009': { terms: '30 days', phone: '0283 896 4410', address: '201 Quốc lộ 13, TP. Thủ Đức, TP.HCM', since: '14/02/2022', riskReasons: ['INV-2026-0321 blocked · legal check'], bank: { now: 'Vietcombank ···· 0915' } },
    'V-1010': { terms: '45 days', phone: '0272 351 7788', address: 'KCN Đức Hòa 1, Long An', since: '03/05/2023', riskReasons: [], bank: { now: 'Agribank ···· 2047' } },
    'V-1011': { terms: '30 days', phone: '0274 362 5520', address: 'KCN Mỹ Phước 3, TX. Bến Cát, Bình Dương', since: '19/07/2023', riskReasons: ['Hợp quy QCVN 7 expires 20/11/2026'], bank: { now: 'VPBank ···· 3361' } }
  };
  D.vendors.forEach((v) => Object.assign(v, { taxStatus: 'Đang hoạt động', mstChecked: '28/10/2026', mstVerified: true, riskChecked: '02/11/2026 06:00', proposed: [] }, ext[v.id] || {}));

  /* Contracts (F-30..F-35). Lines are per Material ID; released qty per line. Security = performance security (R-09). Docs = typed, versioned (R-19). */
  D.contracts = [
    { id: 'CT-2026-008', ctype: 'Framework', vendor: 'V-1001', start: '01/01/2026', end: '31/12/2026', ceiling: 19500000000, vat: 10, owner: 'Nguyễn Minh Anh', esign: 'E-signed v3 · 05/01/2026', minPct: 80, forecast: 860,
      lines: [{ mat: 'CON-24015', commit: 900, released: 505, q3: 16450000, q4: 15627500 }, { mat: 'CON-24020', commit: 300, released: 135, q3: 15110000, q4: 14354500 }],
      adjust: 'Steel price index clause: max ±5% per quarter. Q4 index −6,8% → −5,0% applied by Phụ lục 01 (01/10/2026). PO price may not exceed the current contract price.',
      terms: [['Payment', '30 days after invoice'], ['Late delivery penalty', '0,1% per day, max 8%'], ['Warranty', 'Replace defective lot within 7 days'], ['Incoterms', 'DAP site (Nhà xưởng C2 / Kho B)']],
      security: { amount: 975000000, bank: 'Vietcombank – CN Sài Gòn', ref: 'BL-VCB-2026-00418', expiry: '31/01/2027' },
      releases: [['PO-2026-0118', 'CON-24015', 60, 16450000, '20/01/2026'], ['PO-2026-0204', 'CON-24015', 50, 16450000, '18/02/2026'], ['PO-2026-0297', 'CON-24015', 55, 16450000, '16/03/2026'], ['PO-2026-0365', 'CON-24015', 50, 16450000, '10/04/2026'],
        ['PO-2026-0442', 'CON-24015', 60, 16450000, '08/05/2026'], ['PO-2026-0531', 'CON-24015', 45, 16450000, '05/06/2026'], ['PO-2026-0590', 'CON-24020', 135, 15110000, '22/06/2026'], ['PO-2026-0618', 'CON-24015', 50, 16450000, '06/07/2026'],
        ['PO-2026-0705', 'CON-24015', 45, 16450000, '10/08/2026'], ['PO-2026-0802', 'CON-24015', 45, 16450000, '15/09/2026'], ['PO-2026-0858', 'CON-24015', 45, 15627500, '14/10/2026']],
      files: [{ type: 'Signed contract', name: 'CT-2026-008_signed.pdf', ver: 'v3', by: 'Nguyễn Minh Anh', date: '05/01/2026', mats: ['CON-24015', 'CON-24020'], tag: 'Signed' },
        { type: 'Phụ lục (amendment)', name: 'CT-2026-008_PL01_index.pdf', ver: 'v1', by: 'Nguyễn Minh Anh', date: '01/10/2026', mats: ['CON-24015', 'CON-24020'], tag: 'Signed' },
        { type: 'Performance security', name: 'BL-VCB-2026-00418.pdf', ver: 'v1', by: 'Võ Thị Lan', date: '06/01/2026', mats: [], tag: 'Uploaded by supplier' },
        { type: 'Mill certificate', name: 'MinhPhat_mill_cert_Q4.pdf', ver: 'v2', by: 'Võ Thị Lan', date: '28/10/2026', mats: ['CON-24015'], tag: 'Uploaded by supplier' }] },
    { id: 'CT-2025-019', ctype: 'Rate card', vendor: 'V-1006', start: '01/01/2025', end: '31/12/2026', ceiling: 4800000000, vat: 8, owner: 'Trần Bảo Ngọc', esign: 'E-signed v2 · 28/12/2025', minPct: 0, forecast: null,
      lines: [{ mat: 'LOG-61012', commit: 260, released: 214, q3: 18500000, q4: 18500000 }], adjust: 'Fuel surcharge reviewed quarterly, max ±3%.',
      terms: [['Payment', '30 days after invoice'], ['Late delivery penalty', '500.000 ₫ per trip per day'], ['Incoterms', 'Door to door']],
      security: { amount: 240000000, bank: 'BIDV – CN Gia Định', ref: 'BL-BIDV-2025-1172', expiry: '20/11/2026', note: 'Extension requested 28/10/2026' }, histNote: '+ 202 trips released before 2026 (history)',
      releases: [['PO-2026-0874', 'LOG-61012', 12, 18500000, '20/10/2026']],
      files: [{ type: 'Signed contract', name: 'CT-2025-019_rate_card_v2.pdf', ver: 'v2', by: 'Trần Bảo Ngọc', date: '28/12/2025', mats: ['LOG-61012'], tag: 'Signed' }] },
    { id: 'CT-2026-011', ctype: 'Service SLA', vendor: 'V-1005', start: '01/04/2026', end: '31/03/2027', ceiling: 576000000, vat: 8, owner: 'Trần Bảo Ngọc', esign: 'E-signed v1 · 25/03/2026', minPct: 0, forecast: null,
      lines: [{ mat: 'SRV-52003', commit: 12, released: 8, q3: 48000000, q4: 48000000 }], adjust: 'Fixed monthly fee for the term.',
      terms: [['Payment', 'Monthly, 30 days'], ['Response SLA', '4 hours · penalty 2% of monthly fee per breach'], ['Scope', 'Văn phòng HCM + nhà máy Bình Dương']],
      security: { amount: 28800000, bank: 'Vietcombank – CN Phú Mỹ Hưng', ref: 'BL-VCB-2026-00131', expiry: '30/04/2027' },
      releases: [['PO-2026-0870', 'SRV-52003', 1, 48000000, '27/10/2026']],
      files: [{ type: 'Signed contract', name: 'CT-2026-011_SLA.pdf', ver: 'v1', by: 'Trần Bảo Ngọc', date: '25/03/2026', mats: ['SRV-52003'], tag: 'Signed' }] },
    { id: 'CT-2026-014', ctype: 'Service SLA', vendor: 'V-1003', start: '01/11/2026', end: '31/10/2027', ceiling: 240000000, vat: 8, owner: 'Lê Quốc Huy', esign: 'Sent for e-signature 28/10/2026 · waiting for vendor', minPct: 0, forecast: null,
      lines: [{ mat: 'EQP-31007', commit: 4, released: 0, q3: null, q4: 60000000 }], adjust: 'Fixed price per quarterly service visit.',
      terms: [['Payment', '30 days after each visit'], ['Response SLA', '8 hours on site'], ['Spare parts', 'Billed at list price −10%']],
      security: { amount: 12000000, bank: 'Techcombank – CN Bình Dương', ref: 'Pending', expiry: '30/11/2027' },
      releases: [],
      files: [{ type: 'Draft contract', name: 'CT-2026-014_draft.pdf', ver: 'v2', by: 'Lê Quốc Huy', date: '28/10/2026', mats: ['EQP-31007'], tag: 'Draft' }] },
    { id: 'CT-2025-007', ctype: 'Fixed price', vendor: 'V-1002', start: '01/10/2025', end: '30/09/2026', ceiling: 1580000000, vat: 8, owner: 'Nguyễn Minh Anh', esign: 'E-signed v1 · 28/09/2025', minPct: 0, forecast: null,
      lines: [{ mat: 'CON-24102', commit: 1000, released: 940, q3: 1580000, q4: null }], adjust: 'Fixed price for the term.',
      terms: [['Payment', '45 days'], ['Incoterms', 'DAP site']],
      security: { amount: 79000000, bank: 'ACB – CN Đồng Nai', ref: 'BL-ACB-2025-0388', expiry: '31/10/2026' },
      releases: [], files: [{ type: 'Signed contract', name: 'CT-2025-007_signed.pdf', ver: 'v1', by: 'Nguyễn Minh Anh', date: '28/09/2025', mats: ['CON-24102'], tag: 'Signed' }] }
  ];
  /* Universe counters for the contract register (sample loaded) */
  D.contractStats = { total: 17, active: 12, value: 48.6, avgUse: 58 };

  /* Certificates (F-36..F-39). mats = scope by Material ID. Mandatory = required by a Material ID in scope (F-13). */
  D.certificates = [
    { id: 'CERT-0101', type: 'ISO 9001', no: 'BV-VN-9001-18842', vendor: 'V-1001', mats: ['CON-24015', 'CON-24020'], issuer: 'Bureau Veritas Certification', issued: '15/06/2025', expiry: '14/06/2028', status: 'Valid', verified: 'Nguyễn Minh Anh · 20/06/2025' },
    { id: 'CERT-0102', type: 'Hợp quy QCVN 7:2019/BKHCN', no: 'QC-7-MP-0221', vendor: 'V-1001', mats: ['CON-24015', 'CON-24020'], issuer: 'Quacert', issued: '05/02/2026', expiry: '04/02/2029', status: 'Valid', verified: 'Nguyễn Minh Anh · 06/02/2026' },
    { id: 'CERT-0115', type: 'Hợp quy QCVN 16:2023/BXD', no: 'QC-16-MP-0310', vendor: 'V-1001', mats: ['CON-24102'], issuer: 'Vinacontrol CE', issued: '16/12/2023', expiry: '15/12/2026', status: 'Valid', verified: 'Nguyễn Minh Anh · 20/12/2023' },
    { id: 'CERT-0113', type: 'Hợp quy QCVN 16:2023/BXD', no: 'QC-16-AK-1188', vendor: 'V-1002', mats: ['CON-24102'], issuer: 'Vinacontrol CE', issued: '01/07/2024', expiry: '30/06/2027', status: 'Valid', verified: 'Nguyễn Minh Anh · 05/07/2024' },
    { id: 'CERT-0111', type: 'ISO 9001', no: 'TUV-9001-DP-2023', vendor: 'V-1003', mats: ['EQP-31007', 'EQP-31244'], issuer: 'TÜV Rheinland Việt Nam', issued: '29/11/2023', expiry: '28/11/2026', status: 'Valid', verified: 'Lê Quốc Huy · 02/12/2023' },
    { id: 'CERT-0112', type: 'ISO 9001', no: 'SGS-9001-HL-0457', vendor: 'V-1005', mats: ['SRV-52003'], issuer: 'SGS Việt Nam', issued: '26/12/2023', expiry: '25/12/2026', status: 'Valid', verified: 'Trần Bảo Ngọc · 03/01/2024' },
    { id: 'CERT-0108', type: 'ISO 9001', no: 'QV-9001-BS-0912', vendor: 'V-1008', mats: ['CON-24015', 'CON-24020'], issuer: 'Quacert', issued: '16/10/2023', expiry: '15/10/2026', status: 'Valid', verified: 'Nguyễn Minh Anh · 20/10/2023' },
    { id: 'CERT-0109', type: 'ISO 9001', no: 'QV-9001-BS-1426', vendor: 'V-1008', mats: ['CON-24015', 'CON-24020'], issuer: 'Quacert', issued: '30/10/2026', expiry: '29/10/2029', status: 'Pending review', uploaded: 'Trịnh Văn Hải · 31/10/2026 (supplier)', file: 'ISO9001_BacSon_2026.pdf', replaces: 'CERT-0108' },
    { id: 'CERT-0114', type: 'ISO 9001', no: 'BV-VN-9001-20117', vendor: 'V-1009', mats: ['CON-24330', 'CON-24325'], issuer: 'Bureau Veritas Certification', issued: '11/01/2024', expiry: '10/01/2027', status: 'Valid', verified: 'Nguyễn Minh Anh · 15/01/2024' },
    { id: 'CERT-0116', type: 'ISO 45001', no: 'BV-VN-45001-0873', vendor: 'V-1010', mats: ['CON-24330'], issuer: 'Bureau Veritas Certification', issued: '29/09/2023', expiry: '28/09/2026', status: 'Valid', verified: 'Nguyễn Minh Anh · 02/10/2023' },
    { id: 'CERT-0110', type: 'Hợp quy QCVN 7:2019/BKHCN', no: 'QC-7-TL-0098', vendor: 'V-1011', mats: ['CON-24015'], issuer: 'Quacert', issued: '21/11/2023', expiry: '20/11/2026', status: 'Valid', verified: 'Nguyễn Minh Anh · 25/11/2023' },
    { id: 'CERT-0117', type: 'ISO 9001', no: 'SGS-9001-PM-0211', vendor: 'V-1007', mats: ['LOG-61045'], issuer: 'SGS Việt Nam', issued: '12/03/2025', expiry: '11/03/2028', status: 'Pending review', uploaded: 'Huỳnh Gia Bảo · 31/10/2026 (supplier)', file: 'ISO9001_PhuMy.pdf' }
  ];
  D.certStats = { valid: 214, expiring: 3, expired: 4, pending: 5 };

  /* Vendor evaluation (F-27..F-29). Auto sources use accepted qty for OTIF and NCR rate for Quality (R-07). */
  const base = [
    { name: 'Quality', src: 'Auto · NCR rate & accepted qty', w: 30 },
    { name: 'Delivery (OTIF)', src: 'Auto · PO deliveries (in full = accepted qty)', w: 25 },
    { name: 'Price competitiveness', src: 'Auto · price by Material ID vs 90-day average', w: 20 },
    { name: 'Responsiveness', src: 'Auto · tender response time', w: 10 },
    { name: 'Commercial terms', src: 'Manual', w: 10 },
    { name: 'HSE', src: 'Manual', w: 5 }
  ];
  D.evalTemplates = [
    { id: 'TPL-CON', name: 'Construction materials', cat: 'CON', criteria: base.map((c) => ({ ...c })) },
    { id: 'TPL-EQP', name: 'Equipment', cat: 'EQP', criteria: [{ ...base[0] }, { ...base[1] }, { ...base[2], w: 15 }, { name: 'Technical support', src: 'Manual', w: 15 }, { ...base[3] }, { ...base[5] }] },
    { id: 'TPL-SRV', name: 'Services & logistics', cat: 'SRV', criteria: [{ ...base[0], w: 20 }, { ...base[1], name: 'SLA / on-time service', w: 35 }, { ...base[2] }, { ...base[3], w: 15 }, { ...base[4] }] }
  ];
  D.grades = [['A', 4.2, 'Preferred'], ['B', 3.5, 'Approved'], ['C', 3.0, 'Probation'], ['D', 0, 'Blocked']];
  /* scores in template order; null = not entered yet. basis = evidence line. */
  D.scorecards = [
    { vendor: 'V-1001', tpl: 'TPL-CON', period: 'Q3/2026', status: 'Submitted', scores: [4.5, 4.6, 4.2, 4.0, 4.0, 3.6], by: 'Nguyễn Minh Anh', at: '15/10/2026', prev: 4.24, basis: '18 POs · 3 Material IDs',
      evidence: ['NCR rate 2 / 18 POs · 99,2% accepted qty', 'OTIF 95,8% by accepted qty (46 / 48)', 'CON-24015 −5,3% vs 90-day average', 'Avg. tender response 1,6 days', '', ''], comment: 'Ổn định, giao đúng hạn; cần cải thiện hồ sơ CQ lô 2 (NCR-2026-017).' },
    { vendor: 'V-1002', tpl: 'TPL-CON', period: 'Q3/2026', status: 'Submitted', scores: [3.8, 4.1, 4.2, 4.0, 4.0, 3.5], by: 'Nguyễn Minh Anh', at: '18/10/2026', prev: 3.92, basis: '14 POs · 3 Material IDs',
      evidence: ['NCR rate 1 / 14 POs · 97,9% accepted qty', 'OTIF 91,2% by accepted qty', 'CON-24102 +6,4% vs 90-day average', 'Avg. tender response 2,0 days', '', ''], comment: 'Chất lượng bao bì cần cải thiện (NCR-2026-014).' },
    { vendor: 'V-1009', tpl: 'TPL-CON', period: 'Q3/2026', status: 'Submitted', scores: [4.0, 4.2, 3.6, 3.5, 3.6, 4.4], by: 'Nguyễn Minh Anh', at: '20/10/2026', prev: 3.85, basis: '9 POs · 3 Material IDs',
      evidence: ['No NCR · 100% accepted qty', 'OTIF 92,4% by accepted qty', 'CON-24330 +1,2% vs 90-day average', 'Avg. tender response 2,6 days', '', ''], comment: 'An toàn công trường tốt.' },
    { vendor: 'V-1010', tpl: 'TPL-CON', period: 'Q3/2026', status: 'Draft', scores: [3.8, 4.0, 3.5, 3.6, 3.5, null], by: 'Nguyễn Minh Anh', prev: 3.70, basis: '6 POs · 2 Material IDs',
      evidence: ['No NCR · 100% accepted qty', 'OTIF 90,0% by accepted qty', 'CON-24330 +3,0% vs 90-day average', 'Avg. tender response 2,4 days', '', ''], comment: '' },
    { vendor: 'V-1011', tpl: 'TPL-CON', period: 'Q3/2026', status: 'Draft', scores: [3.7, 4.0, 3.8, 3.2, null, null], by: 'Nguyễn Minh Anh', prev: 3.66, basis: '5 POs · 1 Material ID',
      evidence: ['NCR rate 0 / 5 POs · 99,5% accepted qty', 'OTIF 89,1% by accepted qty', 'CON-24015 +1,6% vs 90-day average', 'Avg. tender response 3,1 days', '', ''], comment: '' },
    { vendor: 'V-1008', tpl: 'TPL-CON', period: 'Q3/2026', status: 'Not started', scores: [3.0, 3.3, 3.6, 3.0, null, null], by: 'Nguyễn Minh Anh', prev: 3.40, basis: '7 POs · 2 Material IDs',
      evidence: ['NCR rate 2 / 7 POs · 96,4% accepted qty', 'OTIF 84,0% by accepted qty', 'CON-24015 +3,4% vs 90-day average', 'Avg. tender response 3,0 days', '', ''], comment: '' },
    { vendor: 'V-1003', tpl: 'TPL-EQP', period: 'Q3/2026', status: 'Not started', scores: [4.2, 4.0, 3.9, null, 3.6, null], by: 'Lê Quốc Huy', prev: 4.05, basis: '11 POs · 5 Material IDs',
      evidence: ['NCR rate 0 / 11 POs · 100% accepted qty', 'OTIF 89,5% by accepted qty', 'EQP-31244 +5,2% vs 90-day average', '', 'Avg. tender response 2,8 days', ''], comment: '' }
  ];
  D.scoreHistory = { 'V-1001': [['Q1/2026', 4.18], ['Q2/2026', 4.24], ['Q3/2026', 4.32]], 'V-1002': [['Q1/2026', 3.88], ['Q2/2026', 3.92], ['Q3/2026', 3.98]], 'V-1009': [['Q1/2026', 3.80], ['Q2/2026', 3.85], ['Q3/2026', 3.90]], 'V-1008': [['Q1/2026', 3.62], ['Q2/2026', 3.40]], 'V-1003': [['Q1/2026', 3.98], ['Q2/2026', 4.05]] };
})(window.DATA);

/* ---------- Phase 3: tenders (F-40..F-49), purchase requests (F-50..F-55), approvals (F-56..F-60) ---------- */
(function (D) {
  /* Tender details keyed by number. method: RFQ | Sealed bid | Two-envelope | e-Auction. delivery = last delivery date (R-03 banner when after 31/12/2026). */
  D.tenders = {
    'TND-2026-024': { method: 'Sealed bid', envelopes: 'Single', pr: 'PR-2026-0412', owner: 'Nguyễn Minh Anh', delivery: '30/11/2026', currency: 'VND', validity: 90, secPct: 1, closeTime: '17:00',
      lines: [{ mat: 'CON-24015', qty: 80 }], step: 6, award: { status: 'Approved', vendor: 'V-1001', value: 1216000000 } },
    'TND-2026-027': { method: 'RFQ', envelopes: 'Single', pr: null, owner: 'Trần Bảo Ngọc', delivery: '31/12/2026', currency: 'VND', validity: 90, secPct: 0, closeTime: '17:00', lines: [{ mat: 'LOG-61012', qty: 36 }], step: 6, award: { status: 'Approved', vendor: 'V-1006', value: 666000000 } },
    'TND-2026-029': { method: 'Two-envelope', envelopes: 'Two', pr: 'PR-2026-0433', owner: 'Nguyễn Minh Anh', delivery: '15/12/2026', currency: 'VND', validity: 90, secPct: 1, secAmount: 15000000, closeTime: '17:00', step: 5,
      weights: [40, 60], pass: 70,
      lines: [{ mat: 'CON-24330', qty: 850 }, { mat: 'CON-24325', qty: 120 }, { mat: 'SRV-52210', qty: 40 }],
      bidders: [
        { vid: 'V-1009', name: 'Công ty TNHH Bê tông Tân Phước', rc: 'RC-029-003', at: '29/10/2026 10:12', tech: [84, 80], sec: 15000000, validity: 90, prices: [1270000, 1120000, 6300000] },
        { vid: 'V-1002', name: 'CTCP VLXD An Khang', rc: 'RC-029-001', at: '27/10/2026 15:40', tech: [78, 74], sec: 15000000, validity: 90, prices: [1255000, 1135000, 6600000] },
        { vid: 'V-1010', name: 'CTCP Xây lắp Phước Thành', rc: 'RC-029-004', at: '30/10/2026 16:31', tech: [72, 70], sec: 0, validity: 90, prices: [1285000, 1100000, 6200000] },
        { vid: null, name: 'Công ty TNHH Bê tông Long Hậu', rc: 'RC-029-002', at: '28/10/2026 09:05', tech: [66, 64], sec: 15000000, validity: 60, prices: null }
      ],
      evaluators: ['Nguyễn Minh Anh', 'Trần Bảo Ngọc'],
      opening: { tech: { at: '30/10/2026 17:05', by: ['Nguyễn Minh Anh', 'Đỗ Hoàng Nam'] }, price: { at: '01/11/2026 09:30', by: ['Nguyễn Minh Anh', 'Đỗ Hoàng Nam'] } },
      committee: [['Nguyễn Minh Anh', 'Chair · technical evaluator', 'Signed 15/10/2026'], ['Trần Bảo Ngọc', 'Technical evaluator', 'Signed 15/10/2026'], ['Lê Quốc Huy', 'Commercial evaluator', 'Not signed'], ['Phạm Thu Trang', 'Witness (bid opening)', 'Signed 16/10/2026'], ['Đỗ Hoàng Nam', 'Award approver', 'Signed 15/10/2026']],
      qa: [
        { no: 1, line: 'CON-24330', q: 'Có chấp nhận phụ gia chống thấm B8 thay cho B6 không?', a: 'Chấp nhận B8 nếu giữ nguyên mác M300 và độ sụt 12 ± 2 cm.', at: '22/10/2026 10:00' },
        { no: 2, line: 'SRV-52210', q: 'Một ca bơm tính bao nhiêu giờ và có gồm di chuyển cần bơm không?', a: '1 ca = 8 giờ tại công trường, đã gồm di chuyển và lắp đặt cần bơm 37 m.', at: '23/10/2026 15:30' }
      ],
      addenda: [{ no: 1, at: '24/10/2026', summary: 'SRV-52210: 36 → 40 ca; thêm yêu cầu cần bơm 37 m. Closing time unchanged (30/10/2026 17:00).', lines: ['CON-24330', 'SRV-52210'], acks: [['V-1009', '24/10/2026 14:10'], ['V-1002', '24/10/2026 16:02'], ['V-1010', '25/10/2026 08:45'], ['Long Hậu', '25/10/2026 09:20']] }],
      files: [{ type: 'Specification / drawing', name: 'TND-029_spec_be-tong_M300_M250.pdf', ver: 'v2', by: 'Nguyễn Minh Anh', date: '24/10/2026', mats: ['CON-24330', 'CON-24325'] },
        { type: 'BOQ', name: 'TND-029_BOQ_NhaxuongC2.xlsx', ver: 'v1', by: 'Nguyễn Minh Anh', date: '15/10/2026', mats: ['CON-24330', 'CON-24325', 'SRV-52210'] },
        { type: 'Addendum', name: 'TND-029_Addendum_01.pdf', ver: 'v1', by: 'Nguyễn Minh Anh', date: '24/10/2026', mats: ['SRV-52210'] },
        { type: 'Bid opening minutes', name: 'TND-029_Bien-ban-mo-thau.pdf', ver: 'v1', by: 'System', date: '01/11/2026', mats: [] }],
      award: null },
    'TND-2026-030': { method: 'RFQ', envelopes: 'Single', pr: 'PR-2026-0429', owner: 'Trần Bảo Ngọc', delivery: '31/12/2027', currency: 'VND', validity: 90, secPct: 1, closeTime: '17:00', lines: [{ mat: 'SRV-52118', qty: 12 }], step: 3 },
    'TND-2026-031': { method: 'Sealed bid', envelopes: 'Single', pr: 'PR-2026-0440', owner: 'Nguyễn Minh Anh', delivery: '20/12/2026', currency: 'VND', validity: 90, secPct: 1, secAmount: 35000000, closeTime: '17:00', step: 3,
      lines: [{ mat: 'CON-24015', qty: 120 }, { mat: 'CON-24102', qty: 300 }, { mat: 'CON-24330', qty: 850 }],
      benchmark: 'CON-24015 line benchmarks CT-2026-008 (Q4 15.627.500 ₫)',
      bidders: [
        { vid: 'V-1001', name: 'Công ty TNHH Thép Minh Phát', rc: 'RC-031-001', at: '30/10/2026 09:48', status: 'Submitted' },
        { vid: 'V-1002', name: 'CTCP VLXD An Khang', rc: 'RC-031-002', at: '31/10/2026 14:22', status: 'Submitted' },
        { vid: 'V-1011', name: 'Công ty TNHH Thép Tân Long', rc: 'RC-031-003', at: '01/11/2026 10:05', status: 'Submitted' },
        { vid: 'V-1008', name: 'CTCP Kim khí Bắc Sơn', rc: 'RC-031-004', at: '01/11/2026 16:37', status: 'Submitted' },
        { vid: 'V-1009', name: 'Công ty TNHH Bê tông Tân Phước', rc: null, at: null, status: 'Not submitted', warn: 'Reminder 04/11/2026 17:00' }
      ],
      committee: [['Nguyễn Minh Anh', 'Chair · evaluator', 'Signed 22/10/2026'], ['Lê Quốc Huy', 'Evaluator', 'Signed 23/10/2026'], ['Đỗ Hoàng Nam', 'Award approver', 'Signed 22/10/2026']],
      qa: [{ no: 1, line: 'CON-24102', q: 'Giao xi măng bao hay xá?', a: 'Xi măng bao 50 kg, giao theo pallet tại Kho B.', at: '27/10/2026 11:00' }], questions: [],
      addenda: [{ no: 1, at: '31/10/2026', summary: 'CON-24330: giao 2 đợt (425 m³ mỗi đợt, 05/12 và 20/12/2026). Quantities and closing time unchanged (05/11/2026 17:00).', lines: ['CON-24330'], acks: [['V-1002', '31/10/2026 15:05'], ['V-1011', '01/11/2026 08:40'], ['V-1008', '01/11/2026 16:30']] }],
      files: [{ type: 'Specification / drawing', name: 'TND-031_spec_thep_xi-mang_be-tong.pdf', ver: 'v1', by: 'Nguyễn Minh Anh', date: '22/10/2026', mats: ['CON-24015', 'CON-24102', 'CON-24330'] },
        { type: 'BOQ', name: 'TND-031_BOQ_KhoB.xlsx', ver: 'v1', by: 'Nguyễn Minh Anh', date: '22/10/2026', mats: ['CON-24015', 'CON-24102', 'CON-24330'] }] },
    'TND-2026-032': { method: 'Two-envelope', envelopes: 'Two', pr: 'PR-2026-0434', owner: 'Lê Quốc Huy', delivery: '15/12/2026', currency: 'VND or USD', fx: 'USD bids converted at the Vietcombank selling rate on the opening day', validity: 90, secPct: 1.5, closeTime: '17:00', step: 2,
      lines: [{ mat: 'EQP-31244', qty: 6 }], weights: [40, 60], pass: 70,
      qa: [{ no: 1, line: 'EQP-31244', q: 'Có chấp nhận động cơ IE2 không?', a: 'Không. Yêu cầu tối thiểu IE3 theo spec Material ID.', at: '30/10/2026 09:30' }], addenda: [] },
    'TND-2026-033': { method: 'RFQ', envelopes: 'Single', pr: 'PR-2026-0427', owner: 'Trần Bảo Ngọc', delivery: '31/12/2027', currency: 'VND', validity: 90, secPct: 0, closeTime: '17:00', lines: [{ mat: 'SRV-52003', qty: 12 }], step: 3 },
    'TND-2026-034': { method: 'e-Auction', envelopes: 'Single', pr: 'PR-2026-0435', owner: 'Trần Bảo Ngọc', delivery: '31/03/2027', currency: 'VND', validity: 90, secPct: 1, closeTime: '10:00', step: 3,
      lines: [{ mat: 'LOG-61012', qty: 60 }],
      auction: { start: 18500000, decrement: 0.5, live: '10/11/2026 09:00–10:00', extend: 5, visibility: 'Rank only' } },
    'TND-2026-035': { method: 'Sealed bid', envelopes: 'Single', pr: 'PR-2026-0439', owner: 'Lê Quốc Huy', delivery: '15/01/2027', currency: 'VND', validity: 90, secPct: 1, closeTime: '17:00', lines: [{ mat: 'EQP-31455', qty: 4 }], step: 3 }
  };

  /* Purchase request details (F-50..F-55). PR-2026-0452: 10% on 2.438.000.000 + 8% on 1.566.500.000 = 4.004.500.000 */
  D.budgets = {
    'KHOB-VLXD': { name: 'Dự án Kho B · Vật liệu xây dựng', budget: 12000000000, invoiced: 2150000000, committed: 5400000000 },
    'BD-CAPEX': { name: 'Nhà máy Bình Dương · Capex thiết bị', budget: 5000000000, invoiced: 900000000, committed: 1200000000 },
    'KHOA-OPEX': { name: 'Kho A · Bảo trì & thiết bị nhỏ', budget: 800000000, invoiced: 310000000, committed: 120000000 },
    'C2-STEEL': { name: 'Nhà xưởng C2 · Steel', budget: 6000000000, invoiced: 2900000000, committed: 916500000 }
  };
  D.prs = {
    'PR-2026-0452': { requester: 'Nguyễn Minh Anh', dept: 'Phòng Mua hàng', project: 'Dự án Kho B · giai đoạn 2', cc: 'KHOB-VLXD', cat: 'CON', need: '15/12/2026', site: 'Kho B · KCN Tân Uyên, Bình Dương',
      reason: 'Giai đoạn 2 Dự án Kho B: móng và sàn khu kệ cao tầng theo bản vẽ KC-02 rev.3.', saved: '31/10/2026 17:42',
      lines: [{ mat: 'CON-24015', qty: 120, price: 15200000 }, { mat: 'CON-24020', qty: 40, price: 15350000 }, { mat: 'CON-24330', qty: 500, price: 1320000 }, { mat: 'CON-24102', qty: 350, price: 1680000 }, { mat: 'SRV-52210', qty: 49, price: 6500000 }],
      files: [{ type: 'BOQ', name: 'KhoB_GD2_BOQ.xlsx', ver: 'v2', by: 'Nguyễn Minh Anh', date: '31/10/2026', mats: ['CON-24015', 'CON-24020', 'CON-24330', 'CON-24102', 'SRV-52210'] },
        { type: 'Specification / drawing', name: 'KC-02_rev3_mong-san.pdf', ver: 'v3', by: 'Nguyễn Minh Anh', date: '30/10/2026', mats: ['CON-24015', 'CON-24020', 'CON-24330'] },
        { type: 'Quotation', name: 'BaoGia_TanPhuoc_bom-be-tong.pdf', ver: 'v1', by: 'Công ty TNHH Bê tông Tân Phước', date: '29/10/2026', mats: ['SRV-52210'], supplier: true }] },
    'PR-2026-0431': { requester: 'Lê Quốc Huy', dept: 'Nhà máy Bình Dương', project: 'Nâng cấp nguồn điện dự phòng', cc: 'BD-CAPEX', cat: 'EQP', need: '30/12/2026', site: 'Nhà máy Bình Dương', reason: 'Thay máy phát 250kVA đã hết khấu hao, tải đỉnh mới 420 kVA.', saved: '30/10/2026 09:10',
      lines: [{ mat: 'EQP-31007', qty: 1, price: 1850000000 }], files: [{ type: 'Quotation', name: 'BaoGia_DaiPhong_500kVA.pdf', ver: 'v1', by: 'Phạm Văn Đức', date: '29/10/2026', mats: ['EQP-31007'], supplier: true }] },
    'PR-2026-0438': { requester: 'Lê Quốc Huy', dept: 'Kho A', project: 'Thông gió Kho A', cc: 'KHOA-OPEX', cat: 'EQP', need: '20/11/2026', site: 'Kho A', reason: 'Bổ sung quạt hút cho khu đóng gói.', saved: '29/10/2026 11:00',
      lines: [{ mat: 'EQP-31501', qty: 10, price: 8600000 }], files: [] },
    'PR-2026-0436': { requester: 'Lê Quốc Huy', dept: 'Nhà xưởng C2', project: 'Điện nhà xưởng C2', cc: 'C2-STEEL', cat: 'EQP', need: '25/11/2026', site: 'Nhà xưởng C2', reason: 'Tủ MSB cho khu mở rộng.', saved: '22/10/2026 10:00', lines: [{ mat: 'EQP-31402', qty: 2, price: 193000000 }], files: [] },
    'PR-2026-0440': { requester: 'Nguyễn Minh Anh', dept: 'Phòng Mua hàng', project: 'Dự án Kho B · giai đoạn 1', cc: 'KHOB-VLXD', cat: 'CON', need: '20/12/2026', site: 'Kho B', reason: 'Giai đoạn 1 Dự án Kho B.', saved: '20/10/2026 15:00',
      lines: [{ mat: 'CON-24015', qty: 120, price: 15200000 }, { mat: 'CON-24102', qty: 300, price: 1680000 }, { mat: 'CON-24330', qty: 850, price: 1320000 }], files: [] },
    'PR-2026-0412': { requester: 'Nguyễn Minh Anh', dept: 'Phòng Mua hàng', project: 'Nhà xưởng C2', cc: 'C2-STEEL', cat: 'CON', need: '30/11/2026', site: 'Nhà xưởng C2', reason: 'Thép D16 cho kết cấu nhà xưởng C2.', saved: '02/09/2026 10:00',
      lines: [{ mat: 'CON-24015', qty: 80, price: 16450000 }], files: [] }
  };
  /* Approval bands by value excl. VAT (F-54) */
  D.approvalBands = [[200000000, 'Dept head'], [2000000000, 'Procurement Lead'], [Infinity, 'Finance Director']];
  D.bulkLimit = 50000000;

  /* Approval detail: chain history per item (F-57) */
  D.approvalChains = {
    'PR-2026-0431': [['Dept head · Nhà máy Bình Dương', 'Approved', '31/10/2026 16:05', 'Đúng kế hoạch capex 2026.'], ['Nguyễn Minh Anh · Procurement Lead', 'Waiting', 'Since 31/10/2026 16:05 · SLA ends 02/11/2026 17:00', ''], ['Đỗ Hoàng Nam · Finance Director', 'Next', 'Capex rule: EQP- above 1 tỷ ₫', '']],
    'PR-2026-0438': [['Lê Quốc Huy · Requester', 'Submitted', '29/10/2026 11:00', ''], ['Nguyễn Minh Anh · Dept head (Kho A acting)', 'Waiting', 'Since 29/10/2026 11:00 · SLA ends 03/11/2026 17:00', '']],
    'EQP-31520': [['Lê Quốc Huy · Requester', 'Submitted', '30/10/2026 10:05', 'Number reserved'], ['Nguyễn Minh Anh · Material master owner', 'Waiting', 'Since 31/10/2026 16:20', ''], ['Phạm Thu Trang · Admin (publish)', 'Next', '', '']],
    'PO-2026-0877 Rev.2': [['Nguyễn Minh Anh · Buyer', 'Raised', '01/11/2026 11:20', 'Thêm 5 tấn cho sàn tầng lửng.'], ['Approver step 1', 'Blocked — SoD', 'Requester cannot approve own change order → Đỗ Hoàng Nam', ''], ['Đỗ Hoàng Nam · Finance Director', 'Next', '', '']],
    'V-1001': [['Võ Thị Lan · Supplier', 'Submitted', '30/10/2026 16:40', 'Đổi tài khoản nhận thanh toán.'], ['Nguyễn Minh Anh · Procurement Lead', 'Waiting', 'Call-back to registered phone required', ''], ['Finance verification', 'Next', '', '']],
    'INV-2026-0322': [['Trần Bảo Ngọc · Buyer', 'Raised', '01/11/2026 16:42', 'Phụ phí nhiên liệu tháng 10.'], ['Nguyễn Minh Anh · Procurement Lead', 'Waiting', 'Since 01/11/2026 16:42', '']]
  };
  D.approvalHistory = [
    { id: 'PR-2026-0436', type: 'PR approval', title: 'Tủ điện MSB – Nhà xưởng C2', decision: 'Approved', by: 'Nguyễn Minh Anh', at: '23/10/2026 10:15', comment: 'OK theo kế hoạch điện C2.' },
    { id: 'PO-2026-0866', type: 'PO change order', title: 'Thép D20 · ngày giao 24/10 → 27/10', decision: 'Approved', by: 'Lê Quốc Huy', onBehalf: 'Nguyễn Minh Anh', at: '20/10/2026 14:02', comment: 'Đổi ngày giao, không đổi giá.' },
    { id: 'PR-2026-0424', type: 'PR approval', title: 'Văn phòng phẩm Q4', decision: 'Returned', by: 'Nguyễn Minh Anh', at: '15/10/2026 09:30', comment: 'Thiếu Material ID cho 2 dòng.' }
  ];
  D.delegation = { to: 'Lê Quốc Huy', from: '10/11/2026', until: '14/11/2026', cap: 500000000, types: ['PR approval', 'PO change order'], above: 'Đỗ Hoàng Nam' };
  D.sodRules = [['Requester ≠ approver of the same PR / change order / Material ID request', 'Block'], ['Vendor creator ≠ vendor approver', 'Block'], ['PO buyer ≠ GRN receiver', 'Warn'], ['Tender evaluator ≠ award approver', 'Block']];
})(window.DATA);

/* ---------- Phase 4: purchase orders & goods receipt (F-61..F-69), invoices & matching (F-70..F-75), price history (F-76..F-80), reports (F-81..F-86) ---------- */
(function (D) {
  D.company = { name: '[YOUR COMPANY]', mst: '[YOUR MST]', address: '[YOUR ADDRESS]' };
  D.poStats = { total: 128 };
  D.tolerance = { price: 0.5, qty: 2 };
  D.fx = { USD: 25420, EUR: 27610, src: 'Vietcombank selling rate', at: '02/11/2026' };
  const done = (q, due, grn) => [q, due, grn];
  /* PO details. lines[].sched = [qty, promised date, GRN no.]. revs newest first. */
  D.pos = {
    'PO-2026-0877': { vendor: 'V-1001', pr: 'PR-2026-0412', tender: 'TND-2026-024', contract: null, buyer: 'Nguyễn Minh Anh', site: 'Nhà xưởng C2 · KCN Tân Tạo, Q. Bình Tân, TP.HCM', terms: '30 days after invoice · advance 30% / 70%', rev: 1,
      lines: [{ mat: 'CON-24015', qty: 80, price: 15200000, sched: [done(50, '28/10/2026', 'GRN-2026-1532'), done(30, '06/11/2026', null)] }],
      confirm: { status: 'Confirmed', by: 'Võ Thị Lan (portal)', at: '24/10/2026 09:12', note: 'Rev.1 re-confirmed' },
      revs: [{ no: 2, status: 'Pending approval', at: '01/11/2026 11:20', by: 'Nguyễn Minh Anh', diff: 'CON-24015 qty 80 → 85 tấn · value 1.216.000.000 → 1.292.000.000 ₫ (+76.000.000 ₫)', reason: 'Thêm 5 tấn cho sàn tầng lửng.', change: [{ i: 0, qty: 85 }], approval: 'PO-2026-0877 Rev.2' },
        { no: 1, status: 'Current · re-confirmed by supplier 24/10/2026', at: '23/10/2026 14:00', by: 'Nguyễn Minh Anh', diff: 'Delivery 2 (30 tấn): 03/11 → 06/11/2026 · no value change, no approval step', reason: 'Công trường chưa sẵn sàng bãi tập kết.' },
        { no: 0, status: 'Superseded', at: '21/10/2026 10:00', by: 'Nguyễn Minh Anh', diff: 'Original issue from TND-2026-024 award', reason: '' }],
      files: [{ type: 'Signed PO', name: 'PO-2026-0877_Rev1_signed.pdf', ver: 'v2', by: 'Nguyễn Minh Anh', date: '23/10/2026', mats: ['CON-24015'] },
        { type: 'Mill certificate', name: 'CQ-MP-2610-118.pdf', ver: 'v1', by: 'Võ Thị Lan', date: '28/10/2026', mats: ['CON-24015'], supplier: true },
        { type: 'Biên bản giao nhận', name: 'BBGN_GRN-2026-1532.pdf', ver: 'v1', by: 'Phan Văn Lộc', date: '28/10/2026', mats: ['CON-24015'] }] },
    'PO-2026-0861': { vendor: 'V-1002', pr: 'PR-2026-0428', tender: null, contract: null, buyer: 'Nguyễn Minh Anh', site: 'Kho A · KCN Sóng Thần, Bình Dương', terms: '45 days after invoice', rev: 0,
      lines: [{ mat: 'CON-24102', qty: 120, price: 1680000, sched: [done(60, '24/10/2026', 'GRN-2026-1518'), done(60, '07/11/2026', null)] }],
      confirm: { status: 'Confirmed', by: 'Ngô Văn Tài (portal)', at: '17/10/2026 08:40' }, revs: [{ no: 0, status: 'Current', at: '16/10/2026 09:00', by: 'Nguyễn Minh Anh', diff: 'Original issue (RFQ ≤ 500tr)', reason: '' }], files: [] },
    'PO-2026-0869': { vendor: 'V-1003', pr: 'PR-2026-0434', tender: null, contract: null, buyer: 'Lê Quốc Huy', site: 'Nhà máy Bình Dương · KCN VSIP 1', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'EQP-31244', qty: 2, price: 182000000, sched: [done(2, '26/11/2026', null)] }],
      confirm: { status: 'Not confirmed', sent: '29/10/2026 15:00', note: 'Reminder at 48 h (31/10) · escalated to the buyer at 72 h · 3 days overdue' }, revs: [{ no: 0, status: 'Current', at: '29/10/2026 15:00', by: 'Lê Quốc Huy', diff: 'Original issue', reason: '' }], files: [] },
    'PO-2026-0882': { vendor: 'V-1004', pr: 'PR-2026-0436', tender: null, contract: null, buyer: 'Lê Quốc Huy', site: 'Nhà xưởng C2 · KCN Tân Tạo, Q. Bình Tân, TP.HCM', terms: '45 days after invoice', rev: 0,
      lines: [{ mat: 'EQP-31402', qty: 2, price: 193000000, sched: [done(2, '20/11/2026', null)] }], confirm: null, revs: [], files: [] },
    'PO-2026-0874': { vendor: 'V-1006', pr: null, tender: null, contract: 'CT-2025-019', buyer: 'Trần Bảo Ngọc', site: 'Kho Cát Lái → Kho Hà Nội', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'LOG-61012', qty: 12, price: 18500000, sched: [done(12, '31/10/2026', 'GRN-2026-1525')] }], confirm: { status: 'Confirmed', by: 'Lý Thanh Tùng (portal)', at: '20/10/2026 16:05' }, revs: [], files: [] },
    'PO-2026-0848': { vendor: 'V-1009', pr: 'PR-2026-0421', tender: null, contract: null, buyer: 'Nguyễn Minh Anh', site: 'Kho A · KCN Sóng Thần, Bình Dương', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'CON-24330', qty: 420, price: 1320000, sched: [done(420, '20/10/2026', 'GRN-2026-1501')] }, { mat: 'SRV-52210', qty: 4, price: 6500000, sched: [done(4, '20/10/2026', 'GRN-2026-1501')] }], confirm: { status: 'Confirmed', by: 'Châu Ngọc Mai (portal)', at: '08/10/2026 10:00' }, revs: [], files: [] },
    'PO-2026-0858': { vendor: 'V-1001', pr: null, tender: null, contract: 'CT-2026-008', buyer: 'Nguyễn Minh Anh', site: 'Nhà xưởng C1', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'CON-24015', qty: 45, price: 15627500, sched: [done(45, '16/10/2026', 'GRN-2026-1490')] }], confirm: { status: 'Confirmed', by: 'Võ Thị Lan (portal)', at: '14/10/2026 15:30' }, revs: [], files: [] },
    'PO-2026-0846': { vendor: 'V-1004', pr: null, tender: null, contract: null, buyer: 'Lê Quốc Huy', site: 'Kho C', terms: '45 days after invoice', rev: 0,
      lines: [{ mat: 'EQP-31501', qty: 13, price: 6615000, sched: [done(13, '18/10/2026', 'GRN-2026-1497')] }], confirm: { status: 'Confirmed', by: 'Đặng Thị Hoa (portal)', at: '06/10/2026 09:00' }, revs: [], files: [] },
    'PO-2026-0866': { vendor: 'V-1001', pr: 'PR-2026-0426', tender: null, contract: null, buyer: 'Lê Quốc Huy', site: 'Nhà xưởng C2', terms: '30 days after invoice', rev: 1,
      lines: [{ mat: 'CON-24020', qty: 30, price: 15350000, sched: [done(15, '27/10/2026', 'GRN-2026-1528'), done(15, '31/10/2026', 'GRN-2026-1539')] }], confirm: { status: 'Confirmed', by: 'Võ Thị Lan (portal)', at: '21/10/2026 08:30', note: 'Rev.1 re-confirmed' },
      revs: [{ no: 1, status: 'Current', at: '20/10/2026 14:02', by: 'Nguyễn Minh Anh', diff: 'Lot 1 date 24/10 → 27/10/2026 · no price change', reason: 'Đổi ngày giao, không đổi giá.' }, { no: 0, status: 'Superseded', at: '19/10/2026 09:00', by: 'Nguyễn Minh Anh', diff: 'Original issue (spot PO, not released from CT-2026-008)', reason: '' }], files: [] },
    'PO-2026-0870': { vendor: 'V-1005', pr: null, tender: null, contract: 'CT-2026-011', buyer: 'Trần Bảo Ngọc', site: 'Văn phòng HCM + Nhà máy Bình Dương', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'SRV-52003', qty: 1, price: 48000000, sched: [done(1, '30/11/2026', null)] }], confirm: { status: 'Confirmed', by: 'Bùi Minh Khoa (portal)', at: '28/10/2026 09:00' }, revs: [{ no: 0, status: 'Current', at: '27/10/2026 10:00', by: 'Trần Bảo Ngọc', diff: 'Release CT-2026-011 · HVAC T11', reason: '' }], files: [] },
    'PO-2026-0889': { vendor: 'V-1001', pr: null, tender: null, contract: 'CT-2026-008', buyer: 'Nguyễn Minh Anh', site: 'Kho B · KCN Tân Uyên, Bình Dương', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'CON-24020', qty: 20, price: 14354500, sched: [done(20, '12/11/2026', null)] }], confirm: { status: 'Not confirmed', sent: '01/11/2026 16:00', note: 'Supplier confirms within 48 h (03/11/2026 16:00)' },
      revs: [{ no: 0, status: 'Current', at: '01/11/2026 16:00', by: 'Nguyễn Minh Anh', diff: 'Release from CT-2026-008 (Q4 price 14.354.500 ₫)', reason: '' }], files: [] },
    'PO-2026-0812': { vendor: 'V-1006', pr: null, tender: null, contract: null, buyer: 'Trần Bảo Ngọc', site: 'KCN Phú Mỹ, Bà Rịa – Vũng Tàu', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'LOG-61045', qty: 3000, price: 105000, sched: [done(1000, '30/09/2026', 'GRN-2026-1470'), done(1000, '31/10/2026', null), done(1000, '30/11/2026', null)] }], confirm: { status: 'Confirmed', by: 'Lý Thanh Tùng (portal)', at: '26/09/2026 10:00' }, revs: [], files: [] },
    'PO-2026-0831': { vendor: 'V-1005', pr: null, tender: null, contract: null, buyer: 'Trần Bảo Ngọc', site: 'Nhà máy Bình Dương', terms: '30 days after invoice', rev: 0,
      lines: [{ mat: 'SRV-52118', qty: 1, price: 62000000, sched: [done(1, '31/10/2026', 'SES-2026-0141')] }], confirm: { status: 'Confirmed', by: 'Bùi Minh Khoa (portal)', at: '01/10/2026 11:00' }, revs: [], files: [] }
  };
  /* Goods receipts (F-64/F-65, R-07). lines: [poLine, schedIdx, delivered, accepted, rejected, reason]. checks: [document, ok, note] */
  const std = (cq) => [['CO/CQ per lot', cq !== false, cq === false ? 'Missing for this lot' : 'Checked'], ['Biên bản giao nhận', true, 'Signed by both parties'], ['Photos', true, '4 photos']];
  D.grns = {
    'GRN-2026-1532': { po: 'PO-2026-0877', date: '28/10/2026', receiver: 'Phan Văn Lộc (Thủ kho C2)', inspector: 'Hồ Thị Thanh (QC)', lines: [[0, 0, 50, 50, 0, '']], checks: [['Mill certificate', true, 'CQ-MP-2610-118.pdf'], ...std()] },
    'GRN-2026-1518': { po: 'PO-2026-0861', date: '24/10/2026', receiver: 'Đinh Văn Phú (Thủ kho A)', inspector: 'Hồ Thị Thanh (QC)', lines: [[0, 0, 60, 55, 5, 'Bao rách, xi măng ẩm vón cục · 5 tấn (100 bao)']], checks: std(), ncr: 'NCR-2026-014' },
    'GRN-2026-1490': { po: 'PO-2026-0858', date: '16/10/2026', receiver: 'Phan Văn Lộc (Thủ kho C2)', inspector: 'Hồ Thị Thanh (QC)', lines: [[0, 0, 45, 45, 0, '']], checks: [['Mill certificate', true, 'CQ-MP-2610-097.pdf'], ...std()] },
    'GRN-2026-1497': { po: 'PO-2026-0846', date: '18/10/2026', receiver: 'Đinh Văn Phú (Thủ kho A)', inspector: 'Lê Quốc Huy', lines: [[0, 0, 13, 13, 0, '']], checks: std() },
    'GRN-2026-1501': { po: 'PO-2026-0848', date: '20/10/2026', receiver: 'Đinh Văn Phú (Thủ kho A)', inspector: 'Hồ Thị Thanh (QC)', lines: [[0, 0, 420, 420, 0, ''], [1, 0, 4, 4, 0, '']], checks: [['Phiếu kết quả nén mẫu', true, 'R7 đạt 312 kG/cm²'], ...std()] },
    'GRN-2026-1525': { po: 'PO-2026-0874', date: '31/10/2026', receiver: 'Kho Hà Nội (POD)', inspector: 'Trần Bảo Ngọc', lines: [[0, 0, 12, 12, 0, '']], checks: [['Proof of delivery (POD)', true, '12 / 12 trips'], ['Biên bản giao nhận', true, 'Signed']] },
    'GRN-2026-1528': { po: 'PO-2026-0866', date: '27/10/2026', receiver: 'Phan Văn Lộc (Thủ kho C2)', inspector: 'Hồ Thị Thanh (QC)', lines: [[0, 0, 15, 15, 0, '']], checks: std() },
    'GRN-2026-1539': { po: 'PO-2026-0866', date: '31/10/2026', receiver: 'Phan Văn Lộc (Thủ kho C2)', inspector: 'Hồ Thị Thanh (QC)', lines: [[0, 1, 15, 0, 15, 'Thiếu CQ lô 2 — quarantined until the CQ is received']], checks: std(false), ncr: 'NCR-2026-017' },
    'GRN-2026-1470': { po: 'PO-2026-0812', date: '30/09/2026', receiver: 'Trần Bảo Ngọc', inspector: 'Trần Bảo Ngọc', lines: [[0, 0, 1000, 1000, 0, '']], checks: [['Biên bản nghiệm thu tháng 9', true, 'Signed']] },
    'SES-2026-0141': { po: 'PO-2026-0831', date: '31/10/2026', receiver: 'Trần Bảo Ngọc', inspector: 'Trần Bảo Ngọc', ses: true, sla: [99.2, 98], lines: [[0, 0, 1, 1, 0, '']], checks: [['Service entry sheet (biên bản nghiệm thu)', true, 'SLA 99,2% vs target 98%']] }
  };
  /* NCRs (R-07): action Return | Replace | Accept with discount */
  D.ncrs = {
    'NCR-2026-014': { grn: 'GRN-2026-1518', po: 'PO-2026-0861', mat: 'CON-24102', qty: 5, action: 'Return to vendor', discount: null, raised: '24/10/2026 15:10', by: 'Hồ Thị Thanh (QC)', supplier: 'Awaiting supplier confirmation · due 05/11/2026', status: 'Open' },
    'NCR-2026-017': { grn: 'GRN-2026-1539', po: 'PO-2026-0866', mat: 'CON-24020', qty: 15, action: 'Replace', discount: null, raised: '31/10/2026 16:00', by: 'Hồ Thị Thanh (QC)', supplier: 'Awaiting supplier · send CQ lô 2 or replace the lot', status: 'Awaiting supplier' },
    'NCR-2026-009': { grn: 'GRN-2026-1311', po: 'PO-2026-0705', mat: 'CON-24015', qty: 1.2, action: 'Accept with discount', discount: 3, raised: '18/08/2026 10:00', by: 'Hồ Thị Thanh (QC)', supplier: 'Accepted by Võ Thị Lan 20/08/2026', status: 'Closed' }
  };
  /* E-invoices (R-01, R-02). lines: [Material ID | null, description, qty, unit price excl. VAT, previously invoiced qty on the PO line] */
  D.invoices = {
    'INV-2026-0314': { po: 'PO-2026-0812', grn: 'GRN-2026-1470', mau: '1', kh: '1C26TSV', no: '00000871', cqt: '00D1F3A7B2C94E5F8A6B1C2D3E4F5A6B7C', src: 'Inbox hoadon@', type: 'Original', lines: [['LOG-61045', 'Thuê kho bãi tháng 9/2026', 1000, 105000, 0]], stage: 3, exported: '30/10/2026 18:00' },
    'INV-2026-0318': { po: 'PO-2026-0858', grn: 'GRN-2026-1490', mau: '1', kh: '1C26TMP', no: '00001231', cqt: '00B7C2D9E1F04A3B5C6D7E8F9A0B1C2D3E', src: 'Portal', type: 'Replacement', orig: '1C26TMP · 00001229 (wrong delivery address)', lines: [['CON-24015', 'Thép cây D16 CB400-V', 45, 15627500, 0]], stage: 2 },
    'INV-2026-0319': { po: 'PO-2026-0877', grn: 'GRN-2026-1532', mau: '1', kh: '1C26TMP', no: '00001248', cqt: '00C4A8E2B6D14F7A9B3C5D7E9F1A3B5C7D', src: 'Portal', type: 'Original', lines: [['CON-24015', 'Thép cây D16 CB400-V', 50, 15200000, 0]], stage: 2 },
    'INV-2026-0320': { po: 'PO-2026-0861', grn: 'GRN-2026-1518', mau: '1', kh: '1C26TAK', no: '00003317', cqt: '00E9B1C3D5F7A24B6C8D0E2F4A6B8C0D2E', src: 'Portal', type: 'Original', lines: [['CON-24102', 'Xi măng PCB40 (bao 50 kg)', 55, 1700000, 0]], stage: 1, assigned: 'Nguyễn Minh Anh', hold: 'On hold · price exception', resolveBy: '05/11/2026' },
    'INV-2026-0321': { po: 'PO-2026-0848', grn: 'GRN-2026-1501', mau: '1', kh: '1C26TTP', no: '00000564', cqt: '', gdt: 'Không tìm thấy hóa đơn trên hệ thống GDT', src: 'Inbox hoadon@', type: 'Original', lines: [['CON-24330', 'Bê tông thương phẩm M300', 220, 1320000, 0]], stage: 0, hold: 'Blocked · legal check' },
    'INV-2026-0322': { po: 'PO-2026-0874', grn: 'GRN-2026-1525', mau: '1', kh: '1C26TSV', no: '00000902', cqt: '00A2B4C6D8E0F13A5B7C9D1E3F5A7B9C1D', src: 'Portal', type: 'Original', lines: [['LOG-61012', 'Vận chuyển container 40ft HCM–HN (gồm phụ phí nhiên liệu)', 12, 19000000, 0]], stage: 1, assigned: 'Trần Bảo Ngọc', hold: 'On hold · price exception', resolveBy: '04/11/2026' },
    'INV-2026-0323': { po: 'PO-2026-0846', grn: 'GRN-2026-1497', mau: '1', kh: '1C26TTS', no: '00002210', cqt: '00F1E3D5C7B9A02B4C6D8E0F2A4B6C8D0E', src: 'Inbox hoadon@', type: 'Original', lines: [['EQP-31501', 'Quạt hút công nghiệp D1380', 2, 6615000, 11], [null, 'Bộ giá đỡ quạt + bulong (vật tư phụ)', 1, 970000, 0]], stage: 1, assigned: 'Lê Quốc Huy', hold: 'On hold · map line 2 to a Material ID', resolveBy: '05/11/2026' },
    'INV-2026-0324': { po: 'PO-2026-0831', grn: 'SES-2026-0141', mau: '1', kh: '1C26THL', no: '00000415', cqt: '00B3D5F7A9C1E24A6C8E0A2C4E6A8C0E2A', src: 'Portal', type: 'Original', lines: [['SRV-52118', 'Dịch vụ vệ sinh công nghiệp tháng 10/2026', 1, 62000000, 0]], stage: 2 }
  };
  D.invoiceStats = { total: 24, toMatch: 9, exceptions: 3, ready: 6, blocked: 1 };
  /* Price records (F-80) not derivable from POs/invoices/bids above. src: PO | Bid | Quotation | Invoice | Contract. cur/orig for foreign currency (R-23) */
  D.priceRecords = [
    { mat: 'CON-24015', date: '30/09/2026', src: 'Bid', doc: 'TND-2026-024', vendor: 'V-1001', qty: 80, price: 15200000, use: 'Awarded' },
    { mat: 'CON-24015', date: '30/09/2026', src: 'Bid', doc: 'TND-2026-024', vendor: 'V-1011', qty: 80, price: 15980000, use: 'Tender round 1' },
    { mat: 'CON-24015', date: '30/09/2026', src: 'Bid', doc: 'TND-2026-024', vendor: 'V-1002', qty: 80, price: 16380000, use: 'Tender round 1' },
    { mat: 'CON-24015', date: '30/09/2026', src: 'Bid', doc: 'TND-2026-024', vendor: 'V-1008', qty: 80, price: 16600000, use: 'Tender round 1' },
    { mat: 'CON-24015', date: '01/10/2026', src: 'Contract', doc: 'CT-2026-008', vendor: 'V-1001', qty: null, price: 15627500, use: 'Contract price Q4 (Phụ lục 01)' },
    { mat: 'CON-24015', date: '15/09/2026', src: 'PO', doc: 'PO-2026-0802', vendor: 'V-1001', qty: 45, price: 16450000, use: 'Contract release' },
    { mat: 'CON-24015', date: '10/08/2026', src: 'PO', doc: 'PO-2026-0705', vendor: 'V-1001', qty: 45, price: 16450000, use: 'Contract release' },
    { mat: 'CON-24015', date: '22/07/2026', src: 'Quotation', doc: 'QT-TL-0722', vendor: 'V-1011', qty: 20, price: 16300000, use: 'Spot quote' },
    { mat: 'EQP-31007', date: '29/10/2026', src: 'Quotation', doc: 'BaoGia_DaiPhong_500kVA', vendor: 'V-1003', qty: 1, price: 1850000000, use: 'PR estimate (PR-2026-0431)' },
    { mat: 'EQP-31007', date: '27/10/2026', src: 'Quotation', doc: 'QT-IMP-2610-07', vendor: null, vname: 'Cummins Power Generation (import)', qty: 1, price: 62500 * 25420, cur: 'USD', orig: 62500, use: 'Spot quote · imported' },
    { mat: 'EQP-31244', date: '26/10/2026', src: 'Quotation', doc: 'QT-TS-2610', vendor: 'V-1004', qty: 2, price: 178500000, use: 'Spot quote' },
    { mat: 'LOG-61012', date: '15/09/2026', src: 'Bid', doc: 'TND-2026-027', vendor: 'V-1006', qty: 36, price: 18500000, use: 'Awarded' }
  ];
  /* Reports (F-81..F-86) */
  D.reports = {
    otif: { onTime: 94.0, inFull: 96.8, deliveries: 1284, late: 77, short: 41 },
    /* vendor: [deliveries, on time %, in full %] — OTIF = vendor.otif */
    otifVendors: { 'V-1001': [48, 97.9, 97.9], 'V-1002': [34, 94.1, 97.1], 'V-1003': [19, 94.7, 94.7], 'V-1004': [25, 92.0, 96.0], 'V-1005': [25, 96.0, 100], 'V-1006': [45, 88.9, 97.8], 'V-1008': [25, 88.0, 96.0], 'V-1009': [79, 94.9, 97.5], 'V-1010': [30, 93.3, 96.7], 'V-1011': [46, 93.5, 95.7] },
    saving: { reported: 9.7, rate: 5.2, target: 4, avoidance: 2.1, validated: 8.9 },
    savings: [
      { id: 'SAV-2026-118', mat: 'CON-24015', doc: 'TND-2026-024 → PO-2026-0877', type: 'Price reduction', base: 16450000, award: 15200000, qty: 80, status: 'Validated', by: 'Đỗ Hoàng Nam · 25/10/2026' },
      { id: 'SAV-2026-121', mat: 'EQP-31007', doc: 'PO-2026-0702', type: 'Cost avoidance', base: 1700000000, award: 1610000000, qty: 1, status: 'Validated', by: 'Đỗ Hoàng Nam · 30/05/2026' },
      { id: 'SAV-2026-116', mat: 'CON-24015', doc: 'CT-2026-008 → PO-2026-0858', type: 'Price reduction', base: 16450000, award: 15627500, qty: 45, status: 'Validated', by: 'Đỗ Hoàng Nam · 20/10/2026' },
      { id: 'SAV-2026-117', mat: 'CON-24325', doc: 'PO-2026-0844', type: 'Negotiated terms', base: 1180000, award: 1150000, qty: 300, status: 'Validated', by: 'Đỗ Hoàng Nam · 22/10/2026' },
      { id: 'SAV-2026-120', mat: 'SRV-52003', doc: 'CT-2026-011', type: 'Negotiated terms', base: 49500000, award: 48000000, qty: 12, status: 'Submitted', by: '' },
      { id: 'SAV-2026-119', mat: 'EQP-31244', doc: 'PO-2026-0855', type: 'Negotiated terms', base: 190000000, award: 182000000, qty: 2, status: 'Submitted', by: '' },
      { id: 'SAV-2026-109', mat: 'LOG-61012', doc: 'TND-2026-027', type: 'Price reduction', base: 18900000, award: 18500000, qty: 36, status: 'Validated', by: 'Đỗ Hoàng Nam · 18/09/2026' },
      { id: 'SAV-2026-122', mat: 'CON-24330', doc: 'TND-2026-029', type: 'Price reduction', tender: 'TND-2026-029', status: 'Draft', by: '' }
    ],
    /* Spend YTD by vendor, tỷ ₫ excl. VAT (top 5 = 77,17 = 41,4% of 186,4) */
    spendVendor: [['V-1001', 24.6], ['V-1002', 16.2], ['V-1003', 14.1], ['V-1009', 12.3], ['V-1006', 9.97], ['V-1004', 8.4], ['V-1005', 6.2], ['V-1011', 5.1], ['V-1010', 4.3], ['V-1008', 3.6]],
    otherVendors: 82,
    coverage: 87.4,
    cycle: { median: 9.5, target: 10, approval: 1.6, tender: 18, routes: [['≤ 200tr · Dept head', 4.0, 112], ['≤ 2 tỷ · + Procurement Lead', 9.0, 64], ['> 2 tỷ · + Finance Director', 16.5, 18], ['Contract release (no tender)', 3.5, 41]] }
  };
})(window.DATA);

/* ---------- Phase 5: supplier portal (F-87..F-98) and admin console (F-99..F-108) ---------- */
(function (D) {
  /* Supplier portal state per vendor. Only the signed-in vendor's own records are ever read (portal.js filters by vendor). */
  D.portal = {
    'V-1001': {
      lastLogin: '01/11/2026 16:05 · Chrome, TP.HCM', mstVerified: '28/10/2026', legalRep: 'Trần Văn Phát · Giám đốc', regNo: 'Giấy CNĐKDN 0315284671 · Sở KH&ĐT TP.HCM',
      /* Own bids only. lines align with the tender lines: price excl. VAT (null + nobid = No bid), lead time in days */
      bids: {
        'TND-2026-031': { status: 'Submitted', rc: 'RC-031-001', at: '30/10/2026 09:48', ver: 1, lines: [{ price: 15450000, lead: 14, nobid: false }, { price: null, lead: null, nobid: true }, { price: null, lead: null, nobid: true }],
          sec: { form: 'Bank guarantee', bank: 'Vietcombank – CN Sài Gòn', ref: 'BL-VCB-2026-01022', amount: 35000000, valid: '05/02/2027', file: 'BL-VCB-2026-01022.pdf' },
          files: [{ type: 'Quotation letter', name: 'MinhPhat_thu-chao-gia_TND031.pdf', ver: 'v1', by: 'Võ Thị Lan', date: '30/10/2026', mats: ['CON-24015'] }, { type: 'CO/CQ', name: 'MinhPhat_CQ_D16_mau.pdf', ver: 'v1', by: 'Võ Thị Lan', date: '30/10/2026', mats: ['CON-24015'] }],
          note: 'Giá đã gồm vận chuyển đến Kho B.', consent: true, log: [['30/10/2026 09:48', 'Submitted · RC-031-001']] },
        'TND-2026-024': { status: 'Submitted', rc: 'RC-024-002', at: '29/09/2026 15:10', ver: 1, lines: [{ price: 15200000, lead: 10, nobid: false }], sec: { form: 'Bank guarantee', amount: 12160000, valid: '29/12/2026', returned: '08/10/2026' }, files: [], consent: true, log: [['29/09/2026 15:10', 'Submitted · RC-024-002']] }
      },
      /* Result notices: own rank only, never other bidders' prices */
      results: [
        { tnd: 'TND-2026-024', title: 'Thép D16 – Nhà xưởng C2', rank: 1, of: 4, outcome: 'Awarded', at: '08/10/2026', po: 'PO-2026-0877', sec: 'Bid security not needed after award · performance security under CT-2026-008' },
        { tnd: 'TND-2026-016', title: 'Thép hình I200 – Kho A', rank: 2, of: 3, outcome: 'Not awarded', at: '14/08/2026', po: null, sec: 'Bid security returned 21/08/2026 (≤ 14 days)' }
      ],
      quotes: [{ id: 'QT-MP-2610-07', mat: 'CON-24020', qty: 20, price: 14900000, date: '24/10/2026', valid: '23/11/2026', status: 'Sent', for: 'Spot RFQ · Lê Quốc Huy' }],
      asns: [],
      checklist: [['Company & MST check', 'Done'], ['Legal representative', 'Done'], ['Giấy CNĐKDN upload', 'Done'], ['Bank account', 'Pending Finance verification'], ['Categories', 'Done'], ['Material IDs offered', 'Done'], ['Certificates', 'Renewal due 15/12/2026'], ['Code of conduct & privacy consent (v2.1)', 'Done']],
      notices: [['02/11/2026 07:00', 'PO-2026-0889 waits for your confirmation (due 03/11/2026 16:00)'], ['31/10/2026 16:00', 'NCR-2026-017 raised on GRN-2026-1539 — please respond'], ['31/10/2026 15:00', 'TND-2026-031 Addendum 01 published — acknowledge before you revise your bid']]
    }
  };

  /* Admin console (F-99..F-108) */
  D.userStats = { active: 58, invites: 4, suspended: 2, no2step: 3, integrationWarn: 1 };
  D.dataRequests = [{ id: 'DSR-2026-007', user: 'kho.phumy@gmail.com', kind: 'Export personal data', at: '31/10/2026', status: 'Open', due: '30/11/2026' }];
  D.privacy = { current: 'v2.1', published: '01/01/2026', accepted: 60, shown: 'First sign-in · bid submission · Privacy link in the footer', versions: [['v2.1', '01/01/2026', 'Current'], ['v2.0', '15/03/2025', 'Superseded'], ['v1.0', '01/09/2024', 'Superseded']] };
  D.access = { method: 'Google only (suppliers may use a password + email OTP)', allow: 'Allowlist', domain: '', allowlist: ['minhanh.nguyen@gmail.com', 'quochuy.le@gmail.com', 'baongoc.tran@gmail.com', 'hoangnam.do@gmail.com', 'thutrang.pham@gmail.com', 'sales.minhphat@gmail.com', 'daiphong.equip@gmail.com', 'kho.phumy@gmail.com'], inviteDays: 7, idle: 30, reauth: 12, twoStep: ['Admin', 'Approver', 'Finance'] };
  D.approvalRules = [
    { rule: 'EQP- Material ID above 1 tỷ ₫ (capex)', adds: 'Finance Director', on: true, cat: 'EQP', above: 1000000000 },
    { rule: 'PR above the remaining budget line', adds: 'Finance Director', on: true },
    { rule: 'New vendor or vendor bank change', adds: 'Finance Director (call-back verification)', on: true },
    { rule: 'New Material ID request', adds: 'Procurement Lead (material master owner)', on: true }
  ];
  D.delegPolicy = { maxDays: 14, cap: 2000000000, bulk: 50000000 };
  D.catAdmin = { CON: { owner: 'Nguyễn Minh Anh', match: '3-way' }, EQP: { owner: 'Lê Quốc Huy', match: '3-way' }, SRV: { owner: 'Trần Bảo Ngọc', match: '2-way (SES)' }, LOG: { owner: 'Trần Bảo Ngọc', match: '3-way (POD)' } };
  D.numbering = [
    ['Material ID', 'CAT-NNNNN', 'CON-24331', 'Range per category · never reused'], ['Purchase request', 'PR-YYYY-NNNN', null, 'Yearly reset'], ['Tender', 'TND-YYYY-NNN', null, 'Yearly reset'],
    ['Bid receipt', 'RC-NNN-NNN', 'RC-<tender>-<seq>', 'Per tender · issued on submit'], ['Purchase order', 'PO-YYYY-NNNN', null, 'Yearly reset'], ['PO revision', 'Rev.N', 'Rev.N+1 per change order', 'Re-confirmation required'],
    ['Contract', 'CT-YYYY-NNN', null, 'Yearly reset'], ['Goods receipt', 'GRN-YYYY-NNNN', null, 'Yearly reset'], ['Service entry sheet', 'SES-YYYY-NNNN', 'SES-2026-0142', 'Yearly reset'],
    ['Non-conformance', 'NCR-YYYY-NNN', null, 'Yearly reset'], ['Invoice (internal)', 'INV-YYYY-NNNN', null, 'Legal no. = mẫu · ký hiệu · số from the e-invoice'], ['Vendor', 'V-NNNN', null, 'Never reused']
  ];
  D.integrations = [
    { key: 'google', name: 'Google sign-in (OAuth)', status: 'OK', note: 'Allowlist mode · 58 active users', last: '02/11/2026 10:21' },
    { key: 'inbox', name: 'E-invoice inbox hoadon@', status: 'OK', note: 'Polls every 15 min · XML + PDF parsed', last: '02/11/2026 10:15' },
    { key: 'gdt', name: 'GDT invoice lookup', status: 'OK', note: 'hoadondientu.gdt.gov.vn · 1 not found (INV-2026-0321)', last: '02/11/2026 09:58' },
    { key: 'acct', name: 'Accounting export', status: '1 error', note: 'Daily 18:00 · Material ID → item code, V-code → vendor code', last: '01/11/2026 18:00' }
  ];
  /* Material ID → accounting item code; null = unmapped */
  D.itemMap = { 'CON-24015': '152-THEP-D16', 'CON-24020': '152-THEP-D20', 'CON-24102': '152-XM-PCB40', 'CON-24330': '152-BT-M300', 'CON-24325': '152-BT-M250', 'EQP-31007': '211-MPD-500', 'EQP-31244': '211-BOM-75', 'EQP-31402': '211-TD-MSB', 'EQP-31455': null, 'EQP-31501': '153-QUAT-HUT', 'SRV-52003': '642-HVAC', 'SRV-52118': '642-VSCN', 'SRV-52210': null, 'LOG-61012': '641-VC-40FT', 'LOG-61045': '641-KHO' };
  D.vendorMap = { mapped: 141, total: 142, unmapped: 'V-1007' };
  D.syncLog = [
    { at: '01/11/2026 18:00', job: 'Accounting export', detail: 'INV-2026-0314 exported · 1 line', status: 'OK' },
    { at: '01/11/2026 18:00', job: 'Accounting export', detail: 'INV-2026-0324 · SRV-52210 has no item code', status: 'Failed' },
    { at: '02/11/2026 10:15', job: 'E-invoice inbox', detail: '2 new e-mails · 1 invoice parsed (INV-2026-0323)', status: 'OK' },
    { at: '02/11/2026 09:58', job: 'GDT lookup', detail: 'INV-2026-0321 · Mã CQT not found', status: 'Warning' },
    { at: '02/11/2026 06:00', job: 'Vendor risk refresh', detail: '11 vendors · tax status checked', status: 'OK' }
  ];
  D.notifRules = [
    { ev: 'PO not confirmed by supplier', remind: '48 h', esc: '72 h → buyer', ch: ['In-app', 'Gmail', 'Portal'], last: '02/11/2026 07:00' },
    { ev: 'Approval waiting', remind: 'SLA − 4 h', esc: 'SLA breach → approver’s manager', ch: ['In-app', 'Gmail'], last: '02/11/2026 08:15' },
    { ev: 'Tender closing soon', remind: '72 h and 24 h', esc: '—', ch: ['In-app', 'Gmail', 'Portal'], last: '01/11/2026 09:00' },
    { ev: 'Certificate expiring', remind: '60 / 30 / 7 days', esc: 'Expired → block Material ID link', ch: ['In-app', 'Gmail', 'Portal'], last: '30/10/2026 08:00' },
    { ev: 'Contract expiring', remind: '90 / 60 / 30 days', esc: '30 days → Procurement Lead', ch: ['In-app', 'Gmail'], last: '01/11/2026 06:00' },
    { ev: 'Invoice exception', remind: 'Immediately', esc: '3 working days → Procurement Lead', ch: ['In-app', 'Gmail'], last: '01/11/2026 16:42' },
    { ev: 'NCR response due', remind: '24 h before due', esc: 'Overdue → buyer', ch: ['In-app', 'Gmail', 'Portal'], last: '31/10/2026 16:00' },
    { ev: 'Price alert by Material ID', remind: 'On new price', esc: '—', ch: ['In-app'], last: '31/10/2026 11:05' }
  ];
  D.digest = { on: true, time: '07:30', to: 'All procurement users' };
  D.sodRules.push(['Tender creator ≠ sole evaluator', 'Warn'], ['Vendor master editor ≠ payment approver', 'Block']);
  D.sodViolations = [3, 1, 2, 0, 1, 0];
  D.sodLog = D.sodLog || [{ id: 'PR-2026-0398', by: 'Phạm Thu Trang', at: '12/10/2026 14:05', reason: 'Requester on leave; Finance Director approved by phone — logged per policy.' }];
  /* Audit log sample (universe 18.420 entries, kept 10 years, read only) */
  D.auditStats = { total: 18420, years: 10 };
  D.audit = [
    { at: '02/11/2026 10:21', user: 'Phạm Thu Trang', type: 'Sign-in', action: 'Signed in with Google (2-step)', ref: '' },
    { at: '02/11/2026 08:02', user: 'Nguyễn Minh Anh', type: 'Sign-in', action: 'Signed in with Google', ref: '' },
    { at: '01/11/2026 16:37', user: 'Trịnh Văn Hải (V-1008)', type: 'Bids and tenders', action: 'Sealed bid submitted · RC-031-004 (content sealed)', ref: 'TND-2026-031' },
    { at: '01/11/2026 10:05', user: 'Mạc Thị Thu (V-1011)', type: 'Bids and tenders', action: 'Sealed bid submitted · RC-031-003 (content sealed)', ref: 'TND-2026-031' },
    { at: '01/11/2026 09:30', user: 'Nguyễn Minh Anh + Đỗ Hoàng Nam', type: 'Bids and tenders', action: 'Price envelope opened (two keys) · 3 price bids unsealed', ref: 'TND-2026-029' },
    { at: '30/10/2026 17:05', user: 'Nguyễn Minh Anh + Đỗ Hoàng Nam', type: 'Bids and tenders', action: 'Unseal · technical envelope opened (two keys) · 4 bids', ref: 'TND-2026-029' },
    { at: '30/10/2026 09:48', user: 'Võ Thị Lan (V-1001)', type: 'Bids and tenders', action: 'Sealed bid submitted · RC-031-001 (content sealed)', ref: 'TND-2026-031' },
    { at: '30/10/2026 16:40', user: 'Võ Thị Lan (V-1001)', type: 'Settings', action: 'Bank account change requested · Vietcombank ···· 5307 (pending Finance verification)', ref: 'V-1001' },
    { at: '28/10/2026 11:12', user: 'Phạm Thu Trang', type: 'Settings', action: 'Notification rule "Certificate expiring" reminders 60/30/7 days', ref: 'Notification rules' },
    { at: '12/10/2026 14:05', user: 'Phạm Thu Trang', type: 'Overrides', action: 'SoD override · requester ≠ approver', ref: 'PR-2026-0398' },
    { at: '05/10/2026 09:00', user: 'Phạm Thu Trang', type: 'Data privacy', action: 'Personal data export delivered (DSR-2026-005)', ref: 'baongoc.tran@gmail.com' },
    { at: '30/09/2026 17:02', user: 'System', type: 'Bids and tenders', action: 'Unseal · sealed bids opened at closing (4 bids)', ref: 'TND-2026-024' },
    { at: '15/09/2026 10:00', user: 'Phạm Thu Trang', type: 'Settings', action: 'Match tolerance price ±0,5% · qty ±2% (tấn, m³) confirmed by Đỗ Hoàng Nam', ref: 'Tolerances' }
  ];
  D.toleranceRule = { over: 'Auto-hold in the buyer’s exception queue; release needs the Procurement Lead', ncrBlocks: true, priceToHistory: true, srv2way: true, approvedBy: 'Đỗ Hoàng Nam · 15/09/2026' };
})(window.DATA);
