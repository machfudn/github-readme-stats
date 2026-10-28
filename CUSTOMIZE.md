# Panduan Self-Host GitHub Readme Stats (Fork `machfudn`)

Dokumen ini menjelaskan cara menjalankan fork `machfudn/github-readme-stats` di Vercel dengan token GitHub, termasuk menghitung repo private sebagai **angka agregat** dan membuat snippet README otomatis.

> [!WARNING]
> Statistik private tetap menjadi **informasi publik** ketika kartu di-embed di README publik. Siapa pun dapat melihat jumlah commit, stars, PR, issue, repo, dan bahasa. Jangan meng-embed `/api/pin` untuk repo private karena kartu tersebut menampilkan nama dan deskripsi repo. Gunakan `/api` dan `/api/top-langs/` saja untuk data agregat.

## 1. Arsitektur dan peringatan privasi

Alur sederhananya:

```text
README publik
   -> <img src="https://domain-anda/api?...">
   -> GitHub Camo (proxy + cache gambar)
   -> Vercel Function (/api, /api/top-langs/, /api/pin/)
   -> GitHub API dengan PAT_1
   -> SVG berisi angka agregat
```

- Endpoint utama: `/api` (stats), `/api/top-langs/` (bahasa), `/api/pin/` (kartu repo). Tidak ada database; hasil di-cache lewat header HTTP dan GitHub Camo.
- `GITHUB_USERNAME` membuat `?username=` boleh dihilangkan pada ketiga endpoint. `WHITELIST` membatasi username, tetapi tidak membatasi nama repo pada `/api/pin/`.

**Privasi:** dengan classic PAT yang punya scope `repo`, repo private ikut masuk ke agregat. Ini berguna untuk angka yang lebih lengkap, tetapi konsekuensinya angka tersebut dapat dilihat publik jika kartunya di-embed. Jangan pernah menampilkan nama atau deskripsi repo private. Endpoint `/api/pin/` tidak memiliki kontrol akses per-repo; siapa pun yang mengetahui nama repo dapat meminta kartunya. Jika tidak diperlukan, jangan publikasikan route pin, atau blokir di Vercel Firewall.

## 2. Prasyarat

- Node.js **>= 22** (repo ini memakai `.nvmrc` berisi `22`), npm, dan Git.
- Akun GitHub `machfudn` dan akun Vercel yang terhubung ke GitHub.
- Classic Personal Access Token (PAT) dari akun GitHub.

Cek versi:

```powershell
node -v
npm -v
git --version
```

## 3. Fork dan push

1. Buka `https://github.com/anuraghazra/github-readme-stats`.
2. Klik **Fork** dan pilih pemilik `machfudn`, sehingga terbentuk `https://github.com/machfudn/github-readme-stats`.
3. Dari folder lokal proyek ini, pastikan remote mengarah ke fork Anda, lalu push branch `master`.

```powershell
git remote -v

# Jika origin masih mengarah ke anuraghazra, ubah ke fork Anda:
git remote set-url origin https://github.com/machfudn/github-readme-stats.git

git push -u origin master
```

Jika fork belum dibuat, tombol **Fork** harus dilakukan lebih dulu; push akan gagal bila repo tujuan belum ada. Jangan commit file `.env` atau token ke repo.

## 4. Membuat classic PAT

Gunakan **token classic**, bukan fine-grained, karena fine-grained tidak menghitung commit private dengan lengkap.

1. Buka **GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic)**.
2. Klik **Generate new token (classic)**.
3. Beri nama, misalnya `grs-machfudn-vercel`.
4. Pilih masa berlaku terbatas, misalnya 90 hari, dan catat pengingat rotasi.
5. Centang `repo` (wajib untuk repo private) dan `read:user` (data profil).
6. Generate, lalu salin token satu kali. Simpan hanya di password manager.

| Jenis token | Commit private | Dipakai di panduan ini |
| --- | --- | --- |
| Classic `repo` + `read:user` | Ya | Ya |
| Fine-grained | Tidak (hanya commit publik) | Tidak |

Jangan pernah menaruh token di README, issue, screenshot, chat, atau commit Git. Token classic dengan `repo` memberi akses luas, jadi perlakukan seperti password.

## 5. Konfigurasi `.env` lokal

Salin `.env.example` menjadi `.env` di root proyek (file ini sudah masuk `.gitignore`), lalu sesuaikan. Contoh lengkap:

```dotenv
# Wajib: token, fallback username, dan whitelist
PAT_1=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=machfudn
WHITELIST=machfudn

# URL publik instance; isi setelah deploy, TANPA trailing slash.
# Untuk tes lokal sementara boleh: http://localhost:9000
SITE_URL=https://github-readme-stats-machfudn.vercel.app

# Opsional runtime
CACHE_SECONDS=21600
FETCH_MULTI_PAGE_STARS=true
EXCLUDE_REPO=

# Opsional generator README
README_THEME=transparent
README_LOCALE=id
README_INCLUDE_ALL_COMMITS=true
README_LANGS_COUNT=8
```

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `PAT_1` | Ya | Token classic untuk GitHub API. Tanpa ini kartu error. |
| `GITHUB_USERNAME` | Ya | Fallback saat `?username=` dihilangkan. Isi `machfudn`. |
| `WHITELIST` | Ya di Vercel | Hanya `machfudn` yang boleh memakai instance/token Anda. |
| `SITE_URL` | Ya untuk generator | Domain produksi, tanpa `/` di akhir. |
| `CACHE_SECONDS`, `FETCH_MULTI_PAGE_STARS`, `EXCLUDE_REPO` | Tidak | Cache, multi-page stars, dan repo yang dikecualikan dari agregat. |
| `README_*` | Tidak | Hanya dibaca generator README: tema, locale, all commits, jumlah bahasa. |

Catatan:

- **`SITE_URL` tanpa trailing slash.** Benar: `https://github-readme-stats-machfudn.vercel.app`; salah: `.../`.
- `EXCLUDE_REPO` memakai nama repo saja, misalnya `EXCLUDE_REPO=repo-berat,repo-lain` (pisahkan dengan koma).
- Di Vercel, isi variabel lewat dashboard. Setelah mengubah `.env`, restart `node express.js`; setelah mengubah env Vercel, redeploy.

## 6. Tes lokal

```powershell
npm install
node express.js
```

Server berjalan di port `9000`. Buka URL berikut **tanpa `?username=`** untuk membuktikan fallback `GITHUB_USERNAME`:

- `http://localhost:9000/api`
- `http://localhost:9000/api/top-langs/`
- Opsional, hanya repo publik: `http://localhost:9000/api/pin/?repo=github-readme-stats`

Buka di browser atau dengan `Start-Process "http://localhost:9000/api"`. Jika kartu menampilkan data `machfudn`, fallback berfungsi. Jika tidak ada token, kartu akan menampilkan pesan **`No GitHub API tokens found`**. Itu normal dan bukan bug aplikasi; isi `PAT_1` di `.env`, lalu restart server. Token yang salah atau kedaluwarsa juga akan gagal mengambil data.

## 7. Deploy ke Vercel

1. Di Vercel, klik **Add New... -> Project**.
2. Import repo `machfudn/github-readme-stats`.
3. Biarkan pengaturan default; Vercel mendeteksi fungsi di folder `api/`. Tidak perlu build command khusus.
4. Buka **Settings -> Environment Variables**, lalu tambahkan untuk **Production**:

| Name | Value |
| --- | --- |
| `PAT_1` | token classic Anda (simpan sebagai secret) |
| `WHITELIST` | `machfudn` |
| `GITHUB_USERNAME` | `machfudn` |
| `SITE_URL` | domain produksi, tanpa trailing slash |
| `CACHE_SECONDS` | `21600` |
| `FETCH_MULTI_PAGE_STARS` | `true` |
| `EXCLUDE_REPO` | opsional, nama repo dipisahkan koma |

5. Deploy. Setelah mendapat domain seperti `https://github-readme-stats-machfudn.vercel.app`, isi `SITE_URL` dengan domain tersebut (atau domain custom Anda).
6. **Redeploy** setelah menambah atau mengubah env. Perubahan env tidak berlaku pada deployment lama.
7. Tes produksi tanpa parameter username:

```text
https://DOMAIN-ANDA/api
https://DOMAIN-ANDA/api/top-langs/
```

Jika memakai Preview Deployment, tambahkan env yang sama untuk environment Preview. Untuk produksi, pastikan nilai yang dipakai adalah nilai **Production**. Jangan mengaktifkan Vercel Authentication/Deployment Protection pada URL kartu, karena GitHub tidak dapat mengambil gambar dari deployment yang terlindungi.

## 8. Generate snippet README

Pastikan `.env` sudah berisi `SITE_URL` dan variabel `README_*` yang diinginkan. Jalankan:

```powershell
npm run readme:snippet
```

Perintah ini mencetak blok Markdown/HTML ke terminal. Contoh hasilnya:

```markdown
<!-- github-readme-stats:start -->
<a href="https://github.com/machfudn"><img height="180" align="center" src="https://github-readme-stats-machfudn.vercel.app/api?show_icons=true&theme=transparent&locale=id&include_all_commits=true" alt="GitHub Stats machfudn" /></a>
<a href="https://github.com/machfudn?tab=repositories"><img height="180" align="center" src="https://github-readme-stats-machfudn.vercel.app/api/top-langs/?layout=compact&langs_count=8&theme=transparent&locale=id" alt="Top Languages machfudn" /></a>
<!-- github-readme-stats:end -->
```

Untuk menulis langsung ke file:

```powershell
node scripts/print-readme.mjs --write PROFILE_README.md
```

`--write` menyisipkan blok di antara marker `github-readme-stats:start/end`. Jika marker sudah ada, hanya blok itu yang diganti, sehingga isi README lain tetap aman.

> [!WARNING]
> Jangan menimpa `readme.md` resmi proyek dengan hasil generator. Tulis ke file terpisah seperti `PROFILE_README.md` atau `README.cards.md`, lalu salin blok ke README repo profil `machfudn/machfudn`. Periksa isi file sebelum commit.

## 9. Kustomisasi tampilan

Parameter ditambahkan ke query string. Contoh memakai domain `https://github-readme-stats-machfudn.vercel.app`; ganti dengan domain Anda.

| Kebutuhan | Parameter | Contoh nilai |
| --- | --- | --- |
| Tema | `theme` | `radical`, `tokyonight`, `dark`, `transparent` |
| Bahasa kartu | `locale` | `id`, `en`, `es`, `ja` |
| Sembunyikan stat | `hide` | `issues,prs` |
| Tampilkan stat tambahan | `show` | `reviews,prs_merged` |
| Ikon | `show_icons` | `true` |
| Judul khusus | `custom_title` | `Statistik%20Machfud` |
| Semua commit | `include_all_commits` | `true` |
| Layout bahasa | `layout` | `compact`, `donut`, `donut-vertical`, `pie` |
| Jumlah bahasa | `langs_count` | `1` sampai `20` |
| Sembunyikan border | `hide_border` | `true` |
| Lebar kartu | `card_width` | `400` |

Contoh URL:

```text
https://github-readme-stats-machfudn.vercel.app/api?show_icons=true&theme=tokyonight&locale=id&include_all_commits=true&hide=issues
https://github-readme-stats-machfudn.vercel.app/api/top-langs/?layout=compact&langs_count=8&theme=tokyonight&locale=id&custom_title=Bahasa%20Favorit
https://github-readme-stats-machfudn.vercel.app/api/pin/?repo=github-readme-stats&theme=tokyonight
```

Contoh terakhir hanya untuk repo **publik**. Untuk repo private, jangan gunakan `/api/pin/`.

Daftar tema lengkap ada di `themes/README.md`; daftar locale ada di `readme.md` bagian **Available locales**. Untuk tema yang mengikuti mode gelap/terang GitHub, tambahkan `#gh-dark-mode-only` atau `#gh-light-mode-only` di akhir URL gambar.

## 10. Keamanan dan privasi

- **`WHITELIST=machfudn` wajib di Vercel.** Tanpa whitelist, siapa pun dapat memakai instance dan kuota token Anda untuk username lain. Whitelist tidak menyembunyikan statistik publik `machfudn`; kartu yang sudah di-embed tetap publik.
- Jangan commit `.env`. Verifikasi dengan `git check-ignore -v .env`; file itu sudah tercantum di `.gitignore`.
- Gunakan token khusus untuk deployment ini, dengan masa berlaku terbatas. Rotasi sebelum kedaluwarsa.
- Jika token bocor: **revoke segera** di GitHub Settings, buat token baru, perbarui `PAT_1` di Vercel, lalu redeploy. Hapus juga token dari tempat bocornya.
- Jangan gunakan `/api/pin/` untuk repo private. Route ini menampilkan nama dan deskripsi repo, dan cache pihak ketiga dapat menyimpannya.
- `CACHE_SECONDS=21600` mengurangi request ke GitHub, tetapi juga menunda pembaruan angka. Cache GitHub Camo dapat membuat gambar lama tetap muncul setelah README diubah.
- Deployment kartu harus dapat diakses publik agar GitHub bisa mengambil gambar. Karena itu, perlindungan utama adalah agregasi data dan whitelist, bukan URL rahasia.

## 11. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `No GitHub API tokens found` | `PAT_1` kosong, salah nama, atau `.env` tidak terbaca | Isi `PAT_1`, restart server; di Vercel tambahkan env lalu redeploy. |
| `Missing param: username` | `GITHUB_USERNAME` kosong atau deployment masih versi lama | Isi env, restart/redeploy; sementara tambahkan `?username=machfudn`. |
| `Downtime due to GitHub API rate limiting` | Kuota GitHub API habis | Tunggu, naikkan cache, kurangi `FETCH_MULTI_PAGE_STARS`, atau gunakan token lain. |
| Angka private rendah atau nol | Setting profil belum mengizinkan kontribusi private | Aktifkan **Include private contributions on my profile** di pengaturan profil GitHub. |
| Commit private tetap tidak masuk | Memakai fine-grained token | Ganti dengan classic PAT scope `repo` + `read:user`. |
| Env Vercel tidak berefek | Env hanya berlaku pada deployment baru | Redeploy environment **Production**, bukan hanya menyimpan env. |
| Link/gambar di snippet salah | `SITE_URL` salah, memakai domain preview, atau ada trailing slash | Perbaiki ke domain produksi tanpa `/`, redeploy, lalu generate ulang snippet. |
| Kartu masih menampilkan data lama | Cache `CACHE_SECONDS` atau cache GitHub Camo | Tunggu masa cache, turunkan `CACHE_SECONDS`, lalu redeploy. |
| `This username is not whitelisted` | Meminta username selain `machfudn` | Hapus `?username=`, atau sesuaikan `WHITELIST` bila memang diperlukan. |

Jika kartu error, buka URL langsung di browser (bukan hanya lewat README) untuk melihat pesan SVG. GitHub Camo terkadang menyembunyikan error asli.

## 12. Catatan upstream dan migrasi

Repo `anuraghazra/github-readme-stats` sudah **tidak dirawat**. README upstream menunjuk successor aktif:

- **GitHub Stats Extended:** `https://github.com/stats-organization/github-stats-extended`
- Alternatif action: `https://github.com/stats-organization/github-readme-stats-action`

Instance publik upstream juga tidak disarankan untuk kebutuhan produksi atau data private. Fork ini tetap dapat dipakai, tetapi tidak menerima patch keamanan rutin.

Langkah migrasi ke GitHub Stats Extended:

1. Fork/deploy `stats-organization/github-stats-extended` ke proyek Vercel baru.
2. Salin env yang sama: `PAT_1`, `WHITELIST`, `GITHUB_USERNAME` (jika didukung), `CACHE_SECONDS`, `FETCH_MULTI_PAGE_STARS`, dan `EXCLUDE_REPO`.
3. Tes `/api?username=machfudn`, `/api/top-langs/`, dan pin untuk repo publik.
4. Ganti domain pada snippet README. Path `/api`, `/api/top-langs/`, dan `/api/pin/` kompatibel, jadi biasanya hanya host yang berubah.
5. Setelah yakin, revoke token lama dan hapus deployment lama.

Perubahan lokal seperti fallback `GITHUB_USERNAME` dan `scripts/print-readme.mjs` adalah tambahan fork ini. Successor belum tentu memiliki perilaku fallback yang sama; setelah migrasi, gunakan `?username=machfudn` secara eksplisit bila diperlukan. Cadangkan perubahan lokal sebelum memindahkan repo.
