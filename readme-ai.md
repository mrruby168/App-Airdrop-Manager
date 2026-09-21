# ***RULE***

* Chỉ update và thao tác các file đúng theo hướng dẫn.
* Không được phép sửa code app (**`index.html`**, **`css/*`**, **`js/*`**, **`schema/*`** khi cập nhật hàng ngày).
* **Đọc kĩ hướng dẫn dưới trước khi thực thi update data.**
* **Data đầu vào dùng để update app phải được viết bằng tiếng Việt.**
* Nếu kết quả check news theo **`rule-checknews-remind`** là **tiếng Anh hoặc ngôn ngữ khác**, phải **tự động dịch sang tiếng Việt trước**, sau đó mới được đưa vào update data app.

---

## Phần 1 — Mô tả các tap (để làm gì)

### Tap 1 : TIN TỨC

→ **`🔔 THÔNG BÁO`** (tin quan trọng mới quét trong ngày TV)
→ **`🗓️ Important Events`**
→ **`🚨 Upcoming`** (date≥21/09/2026: Amadeus 12/10, EarnList 22/09, CZR TGE 01/10…) / **`🕘 History`** (date<21/09: XDAO Snapshot 20/09…)

### Tap 2 : TASK MỚI

→ **`🔁 DAILY TASK`** (3 daily đang active)

* **`🆕 NEW TASK`** (CURRENT-BASELINE)

### Tap 3 ALL TASK PROJECT

→ **20 cards grid**, lọc/tìm

### Tap 4 TIẾN TRÌNH

→ **20 hàng ngang Progress% + Timeline ✅/🔵/⚪/🔒**

### Tap 5 THỐNG KÊ

→ **Cost/Reward/Revenue/P/L/ROI**, hiện revenue=0

---

## Phần 2 — Cách update data cho các tap (vào đâu + sửa như nào)

### Tap 1

**`data/news.json`** (3) + **`data/projects.json`** task_date/tge_date
→ **`js/app.js getImportantEvents()`** auto Upcoming/History.

**Sửa:** update **`list_airdrop.json`** task_date/tge_date
→ sync **`projects.json`**
→ regen **`data/*.js`**.

### Tap 2

**`data/daily_tasks.json`** + **`data/new_tasks.json`**/**`baseline_tasks.json`**
→ **`js/tasks.js`**.

**Sửa:** thêm daily/new vào **`list_airdrop.json`**
→ chạy **`sync_vn_to_app.py`**.

### Tap 3

**`data/projects.json`** (20)
→ **`ALL TASK`**.

**Sửa:** duy nhất **`list_airdrop.json`** 12 field (RULE-MANAGER-PROJECT)
→ sync.

### Tap 4

**`data/progress.json`** 20 hàng
→ **`js/progress.js`**.

**Sửa:** cập nhật **`stages[]`**, **`progress_percent`**, **`current_stage`** (chỉ new/active/pending/locked).

### Tap 5

**`data/statistics.json`**
→ **`js/statistics.js`**.

**Sửa:** điền **`cost/reward/revenue`** thực, trước TGE để **`revenue=0`**.

---

## Phần 3 — Quy định ngôn ngữ của data đầu vào

### 3.1. Ngôn ngữ chuẩn

* **Toàn bộ data đầu vào dùng để update app phải viết bằng tiếng Việt.**
* Nội dung đưa vào các file data phải được **chuẩn hóa và thống nhất bằng tiếng Việt**.
* Không đưa trực tiếp nội dung tiếng Anh hoặc ngôn ngữ khác từ nguồn check news vào data app.

### 3.2. Kết quả từ `rule-checknews-remind`

* Nếu kết quả check news theo **`rule-checknews-remind`** đã là **tiếng Việt** → dùng để update data theo rule.
* Nếu kết quả là **tiếng Anh hoặc ngôn ngữ khác** → **tự động dịch sang tiếng Việt**.
* Chỉ sau khi hoàn tất dịch sang tiếng Việt mới được:

  * **NORMALIZE**
  * **VERIFY**
  * **UPDATE data**
  * **REGEN data/*.js**

### 3.3. Nguyên tắc giữ nguyên dữ liệu gốc cần thiết

* Các trường cần giữ nguyên giá trị gốc như **link, URL, handle, ID, tên dự án, tên token, tên protocol, ticker** thì giữ nguyên.
* Phần **mô tả, tin tức, nội dung task, note, thông báo** phải được chuẩn hóa sang **tiếng Việt** trước khi đưa vào data app.

---

## Nguyên tắc đẩy data chung

**`READ list_airdrop → NORMALIZE TV → VERIFY → UPDATE data/*.json → VALIDATE schema → BACKUP → REGEN data/*.js (gen_js_data.py) → TEST file:// → (commit/push nếu cần)`**

### Quy định bắt buộc trong quy trình

**`READ list_airdrop`**
→ đọc dữ liệu nguồn.

**`NORMALIZE TV`**
→ chuẩn hóa dữ liệu và **dịch toàn bộ nội dung đầu vào sang tiếng Việt nếu cần**.

**`VERIFY`**
→ kiểm tra lại thông tin trước khi update.

**`UPDATE data/*.json`**
→ chỉ cập nhật đúng các file data được quy định.

**`VALIDATE schema`**
→ kiểm tra đúng schema và cấu trúc dữ liệu.

**`BACKUP`**
→ backup trước khi regen.

**`REGEN data/*.js (gen_js_data.py)`**
→ sinh lại data JS từ data nguồn.

**`TEST file://`**
→ kiểm tra app sau khi update.

**`(commit/push nếu cần)`**
→ chỉ thực hiện khi cần.

→ Giữ **`logo https://unavatar.io/x/<handle>`** + **`onerror fallback`**.
