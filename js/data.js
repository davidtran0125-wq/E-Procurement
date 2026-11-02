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
    { email: 'minhanh.nguyen@gmail.com', name: 'Nguyễn Minh Anh', title: 'Procurement Lead', roles: ['procurement', 'admin'], status: 'Active', consent: '05/01/2026' },
    { email: 'quochuy.le@gmail.com', name: 'Lê Quốc Huy', title: 'Buyer – Equipment', roles: ['procurement'], status: 'Active', consent: '06/01/2026' },
    { email: 'baongoc.tran@gmail.com', name: 'Trần Bảo Ngọc', title: 'Buyer – Services & Logistics', roles: ['procurement'], status: 'Active', consent: '06/01/2026' },
    { email: 'hoangnam.do@gmail.com', name: 'Đỗ Hoàng Nam', title: 'Finance Director (approver)', roles: ['procurement'], status: 'Active', consent: '08/01/2026' },
    { email: 'thutrang.pham@gmail.com', name: 'Phạm Thu Trang', title: 'System Admin', roles: ['admin'], status: 'Active', consent: '02/01/2026' },
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
    { id: 'V-1003', name: 'Công ty TNHH Thiết bị Công nghiệp Đại Phong', cat: 'Equipment', status: 'Preferred', score: 4.05, grade: 'A', otif: 89.5, email: 'daiphong.equip@gmail.com', contact: 'Phạm Văn Đức', mst: '0312 456 789', risk: 'Medium', city: 'Bình Dương' },
    { id: 'V-1004', name: 'CTCP Cơ điện Trường Sơn', cat: 'Equipment / Services', status: 'Approved', score: 3.82, grade: 'B', otif: 88.0, email: 'truongson.me@gmail.com', contact: 'Đặng Thị Hoa', mst: '0310 771 245', risk: 'Low', city: 'TP.HCM' },
    { id: 'V-1005', name: 'Công ty TNHH Dịch vụ Kỹ thuật Hưng Long', cat: 'Services', status: 'Preferred', score: 4.10, grade: 'A', otif: 96.0, email: 'hunglong.service@gmail.com', contact: 'Bùi Minh Khoa', mst: '0314 559 830', risk: 'Low', city: 'TP.HCM' },
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
    { id: 'PR-2026-0440', type: 'PR', title: 'Dự án Kho B · thép, xi măng, bê tông', date: '20/10/2026', status: 'In tender', mats: ['CON-24015', 'CON-24102', 'CON-24330'], value: 3434000000, by: 'Nguyễn Minh Anh', next: 'TND-2026-031' },
    { id: 'PR-2026-0452', type: 'PR', title: 'Dự án Kho B · giai đoạn 2', date: '31/10/2026', status: 'Draft', mats: ['CON-24020'], value: 921000000, by: 'Nguyễn Minh Anh' },
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
    { id: 'PO-2026-0861', type: 'PO', title: 'Xi măng PCB40 – Dự án Kho A', date: '16/10/2026', status: 'Partially received', mats: ['CON-24102'], vendor: 'V-1002', qty: '120 tấn', price: 1680000, value: 201600000 },
    { id: 'PO-2026-0866', type: 'PO', title: 'Thép D20 – Nhà xưởng C2', date: '19/10/2026', status: 'Confirmed', mats: ['CON-24020'], vendor: 'V-1001', qty: '30 tấn', price: 15350000, value: 460500000 },
    { id: 'PO-2026-0869', type: 'PO', title: 'Bơm ly tâm 75kW – Nhà máy Bình Dương', date: '29/10/2026', status: 'Sent · not confirmed', mats: ['EQP-31244'], vendor: 'V-1003', qty: '2 cái', price: 182000000, value: 364000000, note: '3 days overdue' },
    { id: 'PO-2026-0874', type: 'PO', title: 'Container HCM–HN tháng 10', date: '20/10/2026', status: 'Confirmed', mats: ['LOG-61012'], vendor: 'V-1006', qty: '12 chuyến', price: 18500000, value: 222000000 },
    { id: 'PO-2026-0877', type: 'PO', title: 'Thép D16 – Nhà xưởng C2 (TND-2026-024)', date: '21/10/2026', status: 'Partially received', mats: ['CON-24015'], vendor: 'V-1001', qty: '80 tấn', price: 15200000, value: 1216000000, note: 'GRN-2026-1532 50 tấn 28/10 · 30 tấn due 06/11 · Rev.2 pending' },
    { id: 'PO-2026-0882', type: 'PO', title: 'Tủ điện MSB – Nhà xưởng C2', date: '02/11/2026', status: 'Draft', mats: ['EQP-31402'], vendor: 'V-1004', qty: '2 bộ', price: 193000000, value: 386000000 },
    { id: 'GRN-2026-1518', type: 'GRN', title: 'Xi măng PCB40 · 55 tấn accepted', date: '24/10/2026', status: 'Accepted with NCR', mats: ['CON-24102'], vendor: 'V-1002' },
    { id: 'GRN-2026-1532', type: 'GRN', title: 'Thép D16 · 50 tấn on time & in full', date: '28/10/2026', status: 'Accepted', mats: ['CON-24015'], vendor: 'V-1001' },
    { id: 'CT-2025-019', type: 'CT', title: 'Rate card Logistics Sao Việt', date: '01/01/2026', status: 'Expiring', mats: ['LOG-61012'], vendor: 'V-1006', note: 'Expires 31/12/2026' },
    { id: 'CT-2026-008', type: 'CT', title: 'Framework – Thép Minh Phát 2026', date: '01/01/2026', status: 'Expiring', mats: ['CON-24015', 'CON-24020'], vendor: 'V-1001', note: '1.200 tấn commitment · 640 tấn released · 01/01–31/12/2026' },
    { id: 'CT-2026-011', type: 'CT', title: 'HVAC maintenance SLA – Hưng Long', date: '01/01/2026', status: 'Active', mats: ['SRV-52003'], vendor: 'V-1005' },
    { id: 'CT-2026-014', type: 'CT', title: 'Generator maintenance – Đại Phong', date: '28/10/2026', status: 'Pending signature', mats: ['EQP-31007'], vendor: 'V-1003', value: 240000000 },
    { id: 'INV-2026-0314', type: 'INV', title: 'Thuê kho bãi tháng 9', date: '05/10/2026', status: 'Ready for payment', mats: ['LOG-61045'], vendor: 'V-1006', value: 105000000 },
    { id: 'INV-2026-0318', type: 'INV', title: 'Thép D16 – PO-2026-0858', date: '20/10/2026', status: 'Matched', mats: ['CON-24015'], vendor: 'V-1001', value: 703237500 },
    { id: 'INV-2026-0320', type: 'INV', title: 'Xi măng PCB40 – GRN-2026-1518', date: '26/10/2026', status: 'Matched', mats: ['CON-24102'], vendor: 'V-1002', value: 93500000 },
    { id: 'INV-2026-0321', type: 'INV', title: 'Bê tông M300 – PO-2026-0848', date: '28/10/2026', status: 'Blocked · legal check', mats: ['CON-24330'], vendor: 'V-1009', value: 290400000 },
    { id: 'INV-2026-0322', type: 'INV', title: 'Container HCM–HN – PO-2026-0874', date: '30/10/2026', status: 'Exception · price +2,7%', mats: ['LOG-61012'], vendor: 'V-1006', value: 228000000 },
    { id: 'INV-2026-0323', type: 'INV', title: 'Vật tư phụ – Trường Sơn', date: '31/10/2026', status: '1 line: No Material ID', mats: ['EQP-31501'], vendor: 'V-1004', value: 14200000 },
    { id: 'NCR-2026-009', type: 'NCR', title: 'Thép D16 · sai lệch khối lượng lô 3', date: '18/08/2026', status: 'Closed · accepted with discount', mats: ['CON-24015'], vendor: 'V-1001' },
    { id: 'NCR-2026-014', type: 'NCR', title: 'Xi măng PCB40 · 5 bao rách', date: '24/10/2026', status: 'Open', mats: ['CON-24102'], vendor: 'V-1002' },
    { id: 'NCR-2026-017', type: 'NCR', title: 'Thép D20 · thiếu CQ lô 2', date: '31/10/2026', status: 'Awaiting supplier', mats: ['CON-24020'], vendor: 'V-1001' }
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
    { id: 'PR-2026-0438', type: 'PR approval', title: 'Quạt hút công nghiệp – Kho A', mats: ['EQP-31501'], value: 86000000, by: 'Lê Quốc Huy', step: 'Step 2 of 2', sla: '03/11/2026 17:00' },
    { id: 'EQP-31520', type: 'New Material ID', title: 'Bơm chìm nước thải 15kW', mats: ['EQP-31520'], value: null, by: 'Lê Quốc Huy', step: 'Step 2 of 3', sla: '04/11/2026 17:00', note: 'Duplicate check passed' },
    { id: 'PO-2026-0877 Rev.2', type: 'PO change order', title: 'Thép D16 · 80 → 85 tấn', mats: ['CON-24015'], value: 1292000000, by: 'Nguyễn Minh Anh', step: 'Step 1 of 2', sla: '03/11/2026 12:00', sod: true, note: 'Blocked — SoD: you raised this change order' },
    { id: 'V-1001', type: 'Vendor change', title: 'Thép Minh Phát · new account BIDV ···· 0937', mats: [], value: null, by: 'Võ Thị Lan', step: 'Step 1 of 2', sla: '03/11/2026 17:00' },
    { id: 'INV-2026-0322', type: 'Invoice exception', title: 'Container HCM–HN · price +2,7% vs PO', mats: ['LOG-61012'], value: 228000000, by: 'Trần Bảo Ngọc', step: 'Step 1 of 1', sla: '04/11/2026 17:00' }
  ],

  /* Notifications for the signed-in Procurement user — 6 unread (R-15) */
  notifications: [
    { id: 'N-801', type: 'PR approval', text: 'PR-2026-0431 Máy phát điện 500kVA waits for your approval (1,85 tỷ ₫)', doc: 'PR-2026-0431', mats: ['EQP-31007'], at: '02/11/2026 08:15', read: false, action: 'Review', href: '#/approvals' },
    { id: 'N-802', type: 'PO overdue', text: 'PO-2026-0869 not confirmed by Đại Phong — 3 days overdue, escalated to buyer', doc: 'PO-2026-0869', mats: ['EQP-31244'], at: '02/11/2026 07:00', read: false, action: 'Follow up', href: '#/po' },
    { id: 'N-803', type: 'Invoice exception', text: 'INV-2026-0322 Sao Việt — unit price +2,7% vs PO-2026-0874 (tolerance ±0,5%)', doc: 'INV-2026-0322', mats: ['LOG-61012'], at: '01/11/2026 16:42', read: false, action: 'Resolve', href: '#/invoices' },
    { id: 'N-804', type: 'Tender', text: 'TND-2026-031 closes 05/11/2026 17:00 · 4 of 5 bids received · sealed', doc: 'TND-2026-031', mats: ['CON-24015', 'CON-24102', 'CON-24330'], at: '01/11/2026 09:00', read: false, action: 'Open', href: '#/tenders' },
    { id: 'N-805', type: 'Evaluation', text: 'TND-2026-029 technical evaluation due 04/11/2026 — your scores are missing', doc: 'TND-2026-029', mats: ['CON-24330'], at: '31/10/2026 17:30', read: false, action: 'Evaluate', href: '#/tenders' },
    { id: 'N-806', type: 'Price alert', text: 'LOG-61012 last price 18.500.000 ₫ is +8,9% vs 90-day average', doc: 'PO-2026-0874', mats: ['LOG-61012'], at: '31/10/2026 11:05', read: false, action: 'Open', href: '#/material360?id=LOG-61012' },
    { id: 'N-790', type: 'Certificate', text: 'ISO 9001 of CTCP Kim khí Bắc Sơn expired 15/10/2026 — vendor blocked for CON-24015', doc: 'V-1008', mats: ['CON-24015'], at: '30/10/2026 08:00', read: true, action: 'Open', href: '#/material360?id=CON-24015' },
    { id: 'N-788', type: 'PO overdue', text: 'GRN-2026-1532 received 50 tấn CON-24015 on time & in full', doc: 'GRN-2026-1532', mats: ['CON-24015'], at: '28/10/2026 15:20', read: true, action: 'Open', href: '#/material360?id=CON-24015' },
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
