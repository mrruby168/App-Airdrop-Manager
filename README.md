# AIRDROP DASHBOARD — Daily Monitor

Dashboard quản lý kèo Airdrop chạy local (HTML/CSS/JS thuần), không cần build.

**Mở app:** `index.html` → `file://` hoặc `npx serve .`

## Tính năng
- **TIN TỨC** — 4 tin mới nhất (tiếng Việt tóm tắt, Source + XEM NGAY)
- **TASK MỚI** — Daily task (3) + New task phát hiện (baseline diff)
- **ALL TASK PROJECT** — 20 projects, filter theo type/priority/tìm kiếm
- **TIẾN TRÌNH** — Mỗi project 1 hàng ngang: Progress bar %, Timeline →, Current Stage, [Chi tiết] modal milestone/deadline/lịch sử
- **THỐNG KÊ** — Tổng cost/reward/revenue/P/L/ROI + bảng chi tiết
- **THÔNG BÁO** — Sidebar 5 notifications, tabs Tất cả/Chưa đọc/Quan trọng
- **Icon X chuẩn** — `https://unavatar.io/x/<handle>` từ `link_x`, fallback chữ cái
- **File:// safe** — `data/*.js` fallback (`window.DATA_*`) để không cần server

## Kiến trúc
```
task-app/
├── index.html
├── css/app.css
├── js/app.js, tabs.js, news.js, tasks.js, progress.js, statistics.js
├── data/projects.json, news.json, progress.json, notifications.json, statistics.json, daily_tasks.json, baseline_tasks.json, new_tasks.json
├── data/*.js  (fallback cho file://)
├── schema/*.schema.json
├── data.js (legacy cho tasks_dashboard.html)
└── backup/
```

## Data update (AI)
AI chỉ sửa `data/*.json` + `data/*.js` (giữ schema), không sửa `index.html/css/js/schema` khi cập nhật hàng ngày (CODE STABLE — DATA DYNAMIC).

## Nguồn data hiện tại
- `list_airdrop.json` 20 projects (3 daily: Amadeus critical, Asentum high, CZR Genesis)
- TGE: CZR 2026-10-01, deadlines: EarnList 2026-09-22, XDAO 2026-09-20/25, Amadeus 2026-10-12

## Deploy
```bash
git init
git add .
git commit -m "feat: airdrop dashboard v1"
gh repo create App-Airdrop-Manager --public --source=. --remote=origin --push
# hoặc
git remote add origin https://github.com/mrruby168/App-Airdrop-Manager.git
git branch -M main
git push -u origin main
```

## License
Private — mrruby168
