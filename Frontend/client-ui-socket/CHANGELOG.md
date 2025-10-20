# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


<-->

 ## [0.0.2] - 2026-10-18

### Added
- ปุ่ม start socket
- ปุ่ม stop socket

### Changed
- Feature reconnect socket :เมื่อ server ขาดการติดต่อ


## [0.0.1] - 2026-10-18

### Added
- ตารางแสดงข้อมูลRealtime
- connect Socket


### Changed
- ปรับปรุง UI ของหน้าแรกให้ทันสมัยขึ้น
- เปลี่ยนฐานข้อมูลจาก SQLite เป็น PostgreSQL
- อัพเดท Dependencies ทั้งหมดเป็นเวอร์ชันล่าสุด



<!-- 
## [Unreleased]

### Added
- ฟีเจอร์ใหม่ที่กำลังพัฒนาอยู่

### Changed
- การเปลี่ยนแปลงที่กำลังทำอยู่ -->

<!-- ## [1.2.0] - 2024-03-15

### Added
- เพิ่มระบบ Login ด้วย Google OAuth
- เพิ่มหน้า Dashboard สำหรับผู้ดูแลระบบ
- เพิ่มฟีเจอร์ Export ข้อมูลเป็น CSV
- เพิ่มการแจ้งเตือนผ่าน Email

### Changed
- ปรับปรุง UI ของหน้าแรกให้ทันสมัยขึ้น
- เปลี่ยนฐานข้อมูลจาก SQLite เป็น PostgreSQL
- อัพเดท Dependencies ทั้งหมดเป็นเวอร์ชันล่าสุด

### Fixed
- แก้ไขปัญหาหน้าเว็บค้างเมื่อ Upload ไฟล์ขนาดใหญ่
- แก้ไข Bug การแสดงผลวันที่ผิดใน Timezone ที่ต่างกัน
- แก้ไขปัญหา Memory Leak ใน Background Service

### Deprecated
- API endpoint `/api/v1/old-users` จะถูกลบในเวอร์ชัน 2.0.0
- ฟังก์ชัน `getOldData()` แนะนำให้ใช้ `fetchData()` แทน

### Security
- แก้ช่องโหว่ SQL Injection ในหน้า Search
- อัพเดท OpenSSL เพื่อแก้ช่องโหว่ CVE-2024-XXXX

## [1.1.0] - 2024-02-01

### Added
- เพิ่มระบบค้นหาขั้นสูง
- เพิ่มการ Filter และ Sort ข้อมูล
- รองรับ Dark Mode

### Changed
- ปรับปรุงประสิทธิภาพการโหลดหน้าเว็บ 40%
- เปลี่ยน Logo และ Color Scheme

### Fixed
- แก้ไขปัญหาการ Login บน Mobile Safari
- แก้ไข Responsive Design บนหน้าจอขนาดเล็ก

## [1.0.1] - 2024-01-15

### Fixed
- แก้ไข Critical Bug ที่ทำให้ระบบล่ม
- แก้ไขปัญหา Session Timeout เร็วเกินไป

### Security
- Patch ช่องโหว่ XSS ในช่อง Comment

## [1.0.0] - 2024-01-01

### Added
- เปิดตัวเวอร์ชันแรก
- ระบบสมัครสมาชิกและ Login
- ระบบจัดการโปรไฟล์ผู้ใช้
- ระบบ CRUD พื้นฐาน
- API Documentation
- Unit Tests และ Integration Tests -->

<!-- [Unreleased]: https://github.com/username/project/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/username/project/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/username/project/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/username/project/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/username/project/releases/tag/v1.0.0 -->