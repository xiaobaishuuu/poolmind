# PoolMind

香港救生員排更・計薪 SaaS。本倉庫是「模塊化單體」：一個 NestJS 後端（`apps/api`）＋一個 React 前端（`apps/web`），另有前後端共用的校驗規則包（`packages/shared`）。用 pnpm 管理這個多包倉庫（monorepo）。

## 目錄怎麼看

| 目錄 | 是什麼 |
|------|--------|
| `apps/api` | 後端伺服器（處理資料、規則、資料庫）。裡面 `src/modules/` 一個資料夾＝一個業務領域（認證、證件、招募、聊天、更表、工資……），現在都是空殼，之後逐個開發。 |
| `apps/web` | 前端網頁（用戶在瀏覽器看到的畫面）。`src/pages/` 分主管／救生員／管理員三端。 |
| `packages/shared` | 前後端共用的「表單校驗規則」，寫一次兩邊都用，避免規則對不上。 |
| `docker-compose.yml` | 一鍵在本機起一個 PostgreSQL 資料庫（開發用）。 |
| `docs/` | 規格書、進度、設計 demo、開發日誌等所有文檔。 |

## 本機啟動步驟（第一次）

> 需要先裝好三樣工具：**Node.js 20+**、**pnpm**（`corepack enable pnpm` 即可）、**Docker Desktop**（用來跑本機資料庫）。

```bash
# 1. 起本機資料庫（背景執行）。第一次會自動建好兩個獨立的庫：poolmind_dev（開發）和 poolmind_test（測試）
docker compose up -d

# 2. 裝好所有依賴（前後端一次裝齊）
pnpm install

# 3. 準備後端環境設定：把樣例複製成正式設定檔（已幫你放好一份 .env，如缺失就複製）
cp apps/api/.env.example apps/api/.env    # 若 apps/api/.env 已存在可跳過

# 4. 把資料庫結構同步到開發庫 poolmind_dev（現在還沒有任何資料表，這步只驗證連得上）
pnpm --filter api prisma migrate dev

# 5. 啟動後端（開發模式，改代碼會自動重啟）
pnpm --filter api start:dev
#    啟動後打開 http://localhost:3000/health 應看到 {"status":"ok","db":"ok",...}

# 6. 另開一個視窗，啟動前端
pnpm --filter web dev
#    打開它印出的網址（預設 http://localhost:5173）應看到 PoolMind 首屏
```

## 常用指令

| 指令 | 作用 |
|------|------|
| `pnpm dev` | 同時起前端＋後端（開發模式） |
| `pnpm --filter api start:dev` | 只起後端 |
| `pnpm --filter web dev` | 只起前端 |
| `pnpm test` | 跑自動化測試。**只會連測試庫 poolmind_test，永遠不碰你在開發庫手動錄入的資料。** |
| `docker compose up -d` / `docker compose down` | 開／關本機資料庫 |

## 開發庫 vs 測試庫 vs 生產庫（很重要）

- **poolmind_dev**：你平時開發、手動錄入資料的庫。
- **poolmind_test**：跑測試專用，每次測試會清空重來——所以測試**絕不會弄髒**你在 dev 錄入的資料。這兩個庫在同一個本機 Postgres 裡，但**互相完全獨立**。
- **poolmind_production**：正式上線的真實資料庫，在 AWS（香港區）上，是另一台獨立機器，**永遠不會在本機跑**。

測試怎麼保證只連測試庫：`pnpm test` 會以 `NODE_ENV=test` 啟動，自動讀 `apps/api/.env.test`（裡面連的是 poolmind_test），與開發用的 `apps/api/.env`（連 poolmind_dev）分開。

## 合規須知（上線前必須落實）

- 資料庫在本地開發與上線部署時，需啟用 **AES-256 靜態加密（Encryption at Rest）**。
- 用戶上傳的救生員證照片，必須儲存在**非公開目錄（Private Storage）**，後台管理員需通過權限驗證後，由後端以 **Stream（串流）**形式讀取，**嚴禁生成公開 URL**。

（以上兩條為項目硬性合規要求，詳見 `docs/SPEC.md` §10 與實施計劃。）
