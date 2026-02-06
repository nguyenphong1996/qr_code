// Danh sách chi nhánh ICOOL
const BRANCHES_DATA = [
    { code: 'PHI', name: 'ICOOL Phan Huy Ích', address: '455 Phan Huy Ích, Phường An Hội Tây, Quận Gò Vấp, TP.HCM' },
    { code: 'LVT', name: 'ICOOL Lê Văn Thọ', address: '142 Lê Văn Thọ, Phường Thông Tây Hội, Quận Gò Vấp, TP.HCM' },
    { code: 'LTH', name: 'ICOOL Lê Thị Hà', address: '269 Lê Thị Hà, Xã Hóc Môn, TP.HCM' },
    { code: 'SVH', name: 'ICOOL Sư Vạn Hạnh', address: '644 Sư Vạn Hạnh (hoặc 642-644), Phường 12/Hòa Hưng, Quận 10, TP.HCM' },
    { code: 'LVV', name: 'ICOOL Lê Văn Việt', address: '140 Lê Văn Việt, Phường Tăng Nhơn Phú, TP. Thủ Đức, TP.HCM' },
    { code: 'DL2', name: 'ICOOL Đại Lộ 2', address: '168 Đại Lộ 2, Phường Phước Long, TP. Thủ Đức, TP.HCM' },
    { code: 'HD', name: 'ICOOL Hoàng Diệu 2', address: '66G Hoàng Diệu 2, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM' },
    { code: 'HD65', name: 'ICOOL Hoàng Diệu 65', address: '65 Hoàng Diệu, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM' },
    { code: 'PXL', name: 'ICOOL Phan Xích Long', address: '266-268-270 Phan Xích Long, Phường 7/Cầu Kiệu, Phú Nhuận, TP.HCM' },
    { code: 'PCT', name: 'ICOOL Phan Chu Trinh', address: '39-41 Phan Chu Trinh, Phường 14, Bình Thạnh, TP.HCM' },
    { code: 'DD', name: 'ICOOL Đồng Đen', address: '124A Đồng Đen, Phường 14, Tân Bình, TP.HCM' },
    { code: 'NTP', name: 'ICOOL Nguyễn Tri Phương', address: '465 Nguyễn Tri Phương, Phường 8/Diên Hồng, Quận 10, TP.HCM' },
    { code: 'NTD', name: 'ICOOL Nhị Thiên Đường', address: '260 Quốc Lộ 50, Phường 6/Bình Đông, Quận 8, TP.HCM' },
    { code: 'CMTT', name: 'ICOOL Cách Mạng Tháng 8', address: '129A Cách Mạng Tháng 8, Phường Bàn Cờ, Quận 3, TP.HCM' },
    { code: 'TBT', name: 'ICOOL Trần Bình Trọng', address: '177 Trần Bình Trọng, Phường 3/Chợ Quán, Quận 5, TP.HCM' },
    { code: 'NT', name: 'ICOOL Nguyễn Trãi', address: '876-878 Nguyễn Trãi, Phường 14/Chợ Lớn, Quận 5, TP.HCM' },
    { code: 'TT', name: 'ICOOL Thành Thái', address: '120 Thành Thái, Phường Hòa Hưng, Quận 10, TP.HCM' },
    { code: 'CCY', name: 'ICOOL Cầu Chữ Y', address: '147 Dạ Nam, Phường Chánh Hưng, Quận 8, TP.HCM' },
    { code: 'MDC', name: 'ICOOL Mạc Đĩnh Chi', address: '90-92 Mạc Đĩnh Chi, Phường Tân Định, Quận 1, TP.HCM' },
    { code: 'NS', name: 'ICOOL Nguyễn Sơn', address: '38 Nguyễn Sơn, Phường Phú Thọ Hòa, Quận Tân Phú, TP.HCM' },
    { code: 'TN', name: 'ICOOL Trần Não', address: '18/9 Trần Não, Phường An Khánh, TP. Thủ Đức, TP.HCM' },
    { code: 'DBT', name: 'ICOOL Dương Bá Trạc', address: '456C1 Dương Bá Trạc, Phường Chánh Hưng, Quận 8, TP.HCM' },
    { code: 'UVK', name: 'ICOOL Ung Văn Khiêm', address: '122 Ung Văn Khiêm, Phường 25/Thạnh Mỹ Tây, Bình Thạnh, TP.HCM' },
    { code: 'TK', name: 'Tô Ký', address: 'B74 Bis Tô Ký, Phường Đông Hưng Thuận, Quận 12, TP.HCM' },
    { code: 'BP', name: 'Bình Phú', address: '31 Bình Phú, Phường 10/Bình Phú, Quận 6, TP.HCM' },
    { code: 'XVNT', name: 'Xô Viết Nghệ Tĩnh', address: '693 Xô Viết Nghệ Tĩnh, Phường 26, Bình Thạnh, TP.HCM' },
    { code: 'VT', name: 'ICOOL Vũng Tàu', address: '130 Hoàng Hoa Thám, Phường 2, TP. Vũng Tàu' },
];

export const BRANCHES = BRANCHES_DATA.map(branch => ({ 
    code: branch.code, 
    prefixed: `I${branch.code}`,
    name: branch.name,
    address: branch.address
}));
