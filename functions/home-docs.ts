export type EndpointParamDoc = {
  name: string;
  required: boolean;
  example: string;
  descEn: string;
  descId: string;
};

export type EndpointDocSpec = {
  path: string;
  method: "GET";
  category: "cards" | "status";
  exampleQuery: string;
  sampleParams: Record<string, string>;
  params: EndpointParamDoc[];
};

const COMMON_CARD_PARAMS: EndpointParamDoc[] = [
  {
    name: "theme",
    required: false,
    example: "transparent",
    descEn: "Built-in theme name (75 options available).",
    descId: "Nama tema bawaan (tersedia 75 pilihan).",
  },
  {
    name: "locale",
    required: false,
    example: "en",
    descEn: "Card translation language code (46 locales).",
    descId: "Kode bahasa label kartu (46 bahasa).",
  },
  {
    name: "hide_border",
    required: false,
    example: "false",
    descEn: "Hide outer card border (true/false).",
    descId: "Sembunyikan garis tepi kartu (true/false).",
  },
  {
    name: "border_radius",
    required: false,
    example: "4.5",
    descEn: "Corner radius in px (0 - 50).",
    descId: "Radius sudut kartu dalam px (0 - 50).",
  },
  {
    name: "title_color",
    required: false,
    example: "2f80ed",
    descEn: "Title hex color without #.",
    descId: "Warna judul dalam hex tanpa #.",
  },
  {
    name: "text_color",
    required: false,
    example: "434d58",
    descEn: "Body text hex color without #.",
    descId: "Warna teks isi dalam hex tanpa #.",
  },
  {
    name: "icon_color",
    required: false,
    example: "4c71f2",
    descEn: "Icon hex color without #.",
    descId: "Warna ikon dalam hex tanpa #.",
  },
  {
    name: "bg_color",
    required: false,
    example: "fffefe",
    descEn: "Background hex or gradient (deg,hex1,hex2).",
    descId: "Warna latar hex atau gradien (deg,hex1,hex2).",
  },
  {
    name: "border_color",
    required: false,
    example: "e4e2e2",
    descEn: "Border hex color without #.",
    descId: "Warna border dalam hex tanpa #.",
  },
  {
    name: "cache_seconds",
    required: false,
    example: "3600",
    descEn: "Custom CDN cache lifetime in seconds.",
    descId: "Durasi cache CDN kustom dalam detik.",
  },
];

export const ENDPOINT_DOCS: EndpointDocSpec[] = [
  {
    path: "/api",
    method: "GET",
    category: "cards",
    exampleQuery:
      "/api?username=machfudn&show_icons=true&include_all_commits=true",
    sampleParams: {
      username: "machfudn",
      show_icons: "true",
      include_all_commits: "true",
    },
    params: [
      {
        name: "username",
        required: false,
        example: "machfudn",
        descEn:
          "GitHub username (defaults to GITHUB_USERNAME env if configured).",
        descId:
          "Username GitHub (fallback ke env GITHUB_USERNAME bila kosong).",
      },
      {
        name: "show_icons",
        required: false,
        example: "true",
        descEn: "Show icons next to stat rows (true/false).",
        descId: "Tampilkan ikon di samping baris statistik (true/false).",
      },
      {
        name: "include_all_commits",
        required: false,
        example: "true",
        descEn: "Count lifetime commits instead of current year only.",
        descId: "Hitung total commit sepanjang waktu, bukan tahun ini saja.",
      },
      {
        name: "hide",
        required: false,
        example: "contribs,issues",
        descEn:
          "Comma-separated stats to hide (stars,commits,prs,issues,contribs).",
        descId:
          "Statistik yang disembunyikan dipisah koma (stars,commits,prs,issues,contribs).",
      },
      {
        name: "show",
        required: false,
        example: "prs_merged,discussions_started",
        descEn: "Comma-separated extra metrics to display.",
        descId: "Statistik tambahan yang ditampilkan dipisah koma.",
      },
      {
        name: "hide_rank",
        required: false,
        example: "false",
        descEn: "Hide the rank badge circle (true/false).",
        descId: "Sembunyikan lingkaran peringkat (true/false).",
      },
      {
        name: "rank_icon",
        required: false,
        example: "default",
        descEn: "Rank badge style (default or github).",
        descId: "Gaya ikon peringkat (default atau github).",
      },
      {
        name: "number_format",
        required: false,
        example: "short",
        descEn: "Number formatting style (short or long).",
        descId: "Format angka statistik (short atau long).",
      },
      {
        name: "exclude_repo",
        required: false,
        example: "repo1,repo2",
        descEn: "Comma-separated repository names to exclude from stars.",
        descId: "Nama repositori yang dikecualikan dari hitungan bintang.",
      },
      {
        name: "ring_color",
        required: false,
        example: "2f80ed",
        descEn: "Rank circle stroke color without #.",
        descId: "Warna garis lingkaran peringkat tanpa #.",
      },
      ...COMMON_CARD_PARAMS,
    ],
  },
  {
    path: "/api/streak",
    method: "GET",
    category: "cards",
    exampleQuery: "/api/streak?username=machfudn&timezone=Asia/Jakarta",
    sampleParams: {
      username: "machfudn",
      timezone: "Asia/Jakarta",
    },
    params: [
      {
        name: "username",
        required: false,
        example: "machfudn",
        descEn:
          "GitHub username (defaults to GITHUB_USERNAME env if configured).",
        descId:
          "Username GitHub (fallback ke env GITHUB_USERNAME bila kosong).",
      },
      {
        name: "user",
        required: false,
        example: "machfudn",
        descEn: "Streak-stats compatible alias for username.",
        descId: "Alias kompatibel streak-stats untuk parameter username.",
      },
      {
        name: "timezone",
        required: false,
        example: "Asia/Jakarta",
        descEn: "IANA timezone identifier for daily streak boundaries.",
        descId: "Zona waktu IANA untuk batas perhitungan hari streak.",
      },
      {
        name: "starting_year",
        required: false,
        example: "2020",
        descEn: "Minimum year to start contribution streak aggregation.",
        descId: "Tahun awal minimum untuk agregasi kontribusi streak.",
      },
      {
        name: "short_numbers",
        required: false,
        example: "true",
        descEn: "Format large counts with suffixes such as 1.2k.",
        descId: "Persingkat angka besar menggunakan akhiran seperti 1.2k.",
      },
      {
        name: "date_format",
        required: false,
        example: "M j[, Y]",
        descEn: "Custom date formatting pattern.",
        descId: "Pola format tanggal kustom.",
      },
      {
        name: "card_width",
        required: false,
        example: "495",
        descEn: "Custom card width in px.",
        descId: "Lebar kartu kustom dalam px.",
      },
      {
        name: "card_height",
        required: false,
        example: "195",
        descEn: "Custom card height in px.",
        descId: "Tinggi kartu kustom dalam px.",
      },
      {
        name: "ring_color",
        required: false,
        example: "fb8c00",
        descEn: "Current streak ring color without #.",
        descId: "Warna cincin current streak tanpa #.",
      },
      {
        name: "fire_color",
        required: false,
        example: "ff4500",
        descEn: "Flame icon color without #.",
        descId: "Warna ikon api streak tanpa #.",
      },
      {
        name: "side_nums_color",
        required: false,
        example: "ffffff",
        descEn: "Total and longest streak numbers color.",
        descId: "Warna angka total dan rekor streak terpanjang.",
      },
      {
        name: "side_labels_color",
        required: false,
        example: "c9d1d9",
        descEn: "Side column labels color.",
        descId: "Warna teks label kolom sisi.",
      },
      {
        name: "dates_color",
        required: false,
        example: "8b949e",
        descEn: "Date range caption color.",
        descId: "Warna teks rentang tanggal.",
      },
      ...COMMON_CARD_PARAMS,
    ],
  },
  {
    path: "/api/top-langs",
    method: "GET",
    category: "cards",
    exampleQuery:
      "/api/top-langs?username=machfudn&layout=compact&langs_count=8",
    sampleParams: {
      username: "machfudn",
      layout: "compact",
      langs_count: "8",
    },
    params: [
      {
        name: "username",
        required: false,
        example: "machfudn",
        descEn: "GitHub username.",
        descId: "Username GitHub.",
      },
      {
        name: "layout",
        required: false,
        example: "compact",
        descEn: "Card layout: normal, compact, donut, donut-vertical, pie.",
        descId:
          "Tata letak kartu: normal, compact, donut, donut-vertical, pie.",
      },
      {
        name: "langs_count",
        required: false,
        example: "8",
        descEn: "Number of languages to display (1 - 10).",
        descId: "Jumlah bahasa yang ditampilkan (1 - 10).",
      },
      {
        name: "hide",
        required: false,
        example: "html,css",
        descEn: "Comma-separated languages to omit.",
        descId: "Daftar bahasa yang disembunyikan dipisah koma.",
      },
      {
        name: "exclude_repo",
        required: false,
        example: "repo1,repo2",
        descEn: "Comma-separated repositories to exclude.",
        descId: "Daftar repositori yang dikecualikan dipisah koma.",
      },
      {
        name: "hide_progress",
        required: false,
        example: "false",
        descEn: "Hide percentage bars or numeric totals.",
        descId: "Sembunyikan bar persentase atau angka total.",
      },
      {
        name: "stats_format",
        required: false,
        example: "percentages",
        descEn: "Display metric unit: percentages or bytes.",
        descId: "Satuan tampilan bahasa: percentages atau bytes.",
      },
      {
        name: "size_weight",
        required: false,
        example: "1",
        descEn: "Weight multiplier for byte size ranking.",
        descId: "Bobot pengali berdasarkan ukuran byte kode.",
      },
      {
        name: "count_weight",
        required: false,
        example: "0",
        descEn: "Weight multiplier for repository count ranking.",
        descId: "Bobot pengali berdasarkan jumlah repositori.",
      },
      ...COMMON_CARD_PARAMS,
    ],
  },
  {
    path: "/api/pin",
    method: "GET",
    category: "cards",
    exampleQuery:
      "/api/pin?username=anuraghazra&repo=github-readme-stats&show_owner=true",
    sampleParams: {
      username: "anuraghazra",
      repo: "github-readme-stats",
      show_owner: "true",
    },
    params: [
      {
        name: "repo",
        required: true,
        example: "github-readme-stats",
        descEn: "Target GitHub repository name.",
        descId: "Nama repositori GitHub target.",
      },
      {
        name: "username",
        required: false,
        example: "anuraghazra",
        descEn: "Repository owner username.",
        descId: "Username pemilik repositori.",
      },
      {
        name: "show_owner",
        required: false,
        example: "true",
        descEn: "Prefix repository title with owner username.",
        descId: "Awali judul repositori dengan username pemilik.",
      },
      {
        name: "description_lines_count",
        required: false,
        example: "2",
        descEn: "Maximum number of description lines.",
        descId: "Jumlah baris maksimum untuk deskripsi repo.",
      },
      ...COMMON_CARD_PARAMS,
    ],
  },
  {
    path: "/api/wakatime",
    method: "GET",
    category: "cards",
    exampleQuery: "/api/wakatime?username=anuraghazra&layout=compact",
    sampleParams: {
      username: "anuraghazra",
      layout: "compact",
    },
    params: [
      {
        name: "username",
        required: true,
        example: "anuraghazra",
        descEn: "Public WakaTime username.",
        descId: "Username profil publik WakaTime.",
      },
      {
        name: "layout",
        required: false,
        example: "compact",
        descEn: "Card layout: normal or compact.",
        descId: "Tata letak kartu: normal atau compact.",
      },
      {
        name: "langs_count",
        required: false,
        example: "5",
        descEn: "Number of languages to display.",
        descId: "Jumlah bahasa yang ditampilkan.",
      },
      {
        name: "api_domain",
        required: false,
        example: "wakatime.com",
        descEn: "Custom WakaTime-compatible API domain.",
        descId: "Domain API WakaTime kustom.",
      },
      {
        name: "range",
        required: false,
        example: "last_7_days",
        descEn: "Stats time range (e.g. last_7_days, last_30_days, last_year).",
        descId: "Rentang waktu statistik (misal last_7_days, last_30_days).",
      },
      {
        name: "display_format",
        required: false,
        example: "time",
        descEn: "Value display format: time or percent.",
        descId: "Format nilai tampilan: time atau percent.",
      },
      ...COMMON_CARD_PARAMS,
    ],
  },
  {
    path: "/api/gist",
    method: "GET",
    category: "cards",
    exampleQuery:
      "/api/gist?id=bbfce31e0217a3689c8d961a356cb10d&show_owner=true",
    sampleParams: {
      id: "bbfce31e0217a3689c8d961a356cb10d",
      show_owner: "true",
    },
    params: [
      {
        name: "id",
        required: true,
        example: "bbfce31e0217a3689c8d961a356cb10d",
        descEn: "GitHub Gist ID.",
        descId: "ID GitHub Gist.",
      },
      {
        name: "show_owner",
        required: false,
        example: "true",
        descEn: "Show gist owner handle before filename.",
        descId: "Tampilkan username pemilik sebelum nama file gist.",
      },
      ...COMMON_CARD_PARAMS,
    ],
  },
  {
    path: "/api/status/up",
    method: "GET",
    category: "status",
    exampleQuery: "/api/status/up?type=shields",
    sampleParams: {},
    params: [
      {
        name: "type",
        required: false,
        example: "shields",
        descEn: "Response mode: boolean or shields.",
        descId: "Format respons: boolean atau shields.",
      },
    ],
  },
  {
    path: "/api/status/pat-info",
    method: "GET",
    category: "status",
    exampleQuery: "/api/status/pat-info",
    sampleParams: {},
    params: [],
  },
  {
    path: "/health",
    method: "GET",
    category: "status",
    exampleQuery: "/health",
    sampleParams: {},
    params: [],
  },
];
