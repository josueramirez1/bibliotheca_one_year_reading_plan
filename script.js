const TOTAL_DAYS = 358;
const RAW_VOLUMES = [
  { name: "Volume I", start: 15, end: 751 },
  { name: "Volume II", start: 15, end: 559 },
  { name: "Volume III", start: 15, end: 607, skipStart: 15, skipEnd: 194 },
  { name: "Volume V", start: 15, end: 566 }
];

const PSALM_119_PARTS = [
  "Psalm 119:1–32 (p. 159–160)",
  "Psalm 119:33–64 (p. 161–162)",
  "Psalm 119:65–96 (p. 163–164)",
  "Psalm 119:97–128 (p. 165–166)",
  "Psalm 119:129–152 (p. 167)",
  "Psalm 119:153–176 (p. 168)"
];

const FINAL_PASS_PSALMS = [
  "Psalm 1", "Psalm 2", "Psalm 3", "Psalm 4", "Psalm 5", "Psalm 6", "Psalm 7",
  "Psalm 8", "Psalm 9", "Psalm 10", "Psalm 11", "Psalm 12", "Psalm 13", "Psalm 14",
  "Psalm 15", "Psalm 16", "Psalm 17", "Psalm 18", "Psalm 19", "Psalm 20", "Psalm 21",
  "Psalm 22", "Psalm 23", "Psalm 24", "Psalm 25", "Psalm 26", "Psalm 27", "Psalm 28",
  "Psalm 29", "Psalm 30", "Psalm 31", "Psalm 32", "Psalm 33", "Psalm 34", "Psalm 35",
  "Psalm 36", "Psalm 37", "Psalm 38", "Psalm 39", "Psalm 40", "Psalm 41", "Psalm 42",
  "Psalm 43", "Psalm 44", "Psalm 45", "Psalm 46", "Psalm 47", "Psalm 48"
];

const buildMasterPages = (volumes) => {
  let pages = [];
  volumes.forEach((v) => {
    for (let p = v.start; p <= v.end; p++) {
      if (v.skipStart && p >= v.skipStart && p <= v.skipEnd) continue;
      pages.push({ volume: v.name, page: p });
    }
  });
  return pages;
};

const getPsalmForDay = (day) => {
  if (day >= 1 && day <= 155) {
    if (day >= 119 && day <= 124) return PSALM_119_PARTS[day - 119];
    let baseNum = day < 119 ? day : day - 5;
    return "Psalm " + baseNum;
  }
  if (day >= 156 && day <= 310) {
    const adjustedDay = day - 155;
    if (adjustedDay >= 119 && adjustedDay <= 124) return PSALM_119_PARTS[adjustedDay - 119];
    let baseNum = adjustedDay < 119 ? adjustedDay : adjustedDay - 5;
    return "Psalm " + Math.min(baseNum, 150);
  }
  const index = day - 311;
  return FINAL_PASS_PSALMS[Math.min(index, FINAL_PASS_PSALMS.length - 1)];
};

const splitIntoDays = (pages, numDays) => {
  const base = Math.floor(pages.length / numDays);
  const extra = pages.length % numDays;
  const slices = [];
  let idx = 0;
  for (let d = 0; d < numDays; d++) {
    const ppd = base + (d < extra ? 1 : 0);
    slices.push(pages.slice(idx, idx + ppd));
    idx += ppd;
  }
  return slices;
};

const generatePlan = () => {
  const masterPages = buildMasterPages(RAW_VOLUMES);
  const narrativeDays = TOTAL_DAYS - 1; // 357 reading days + 1 Psalms 1–2 day

  // Split exactly at the Volume II -> Volume III boundary
  const firstVol3 = masterPages.findIndex((p) => p.volume === "Volume III");
  const beforeVol3 = masterPages.slice(0, firstVol3);
  const fromVol3 = masterPages.slice(firstVol3);

  // Share the 357 days proportionally so pacing stays even on both sides
  const daysBefore = Math.round(narrativeDays * beforeVol3.length / masterPages.length);
  const daysAfter = narrativeDays - daysBefore;

  const schedule = [
    ...splitIntoDays(beforeVol3, daysBefore),
    { wedge: true },
    ...splitIntoDays(fromVol3, daysAfter)
  ];

  let planHTML = "";

  schedule.forEach((entry, i) => {
    const day = i + 1;
    let volDisplay = "";
    let pageDisplay = "";
    let isTransition = false;

    if (entry.wedge) {
      volDisplay = "Writings";
      pageDisplay = "Psalms 1–2";
    } else {
      const groups = [];
      entry.forEach((item) => {
        const last = groups[groups.length - 1];
        if (last && last.volume === item.volume) {
          last.endPage = item.page;
        } else {
          groups.push({ volume: item.volume, startPage: item.page, endPage: item.page });
        }
      });

      isTransition = groups.length > 1;
      const fmt = (g) => g.startPage === g.endPage ? "" + g.startPage : g.startPage + "–" + g.endPage;

      if (!isTransition && groups.length > 0) {
        volDisplay = groups[0].volume;
        pageDisplay = fmt(groups[0]);
      } else if (groups.length > 0) {
        volDisplay = groups.map((g) => g.volume).join(" & ");
        pageDisplay = groups.map((g) => g.volume + ": " + fmt(g)).join("; ");
      }
    }

    const psalmDisplay = getPsalmForDay(day);

    planHTML += '<div class="row ' + (isTransition ? 'is-transition' : '') + '">' +
                  '<div class="cell day-cell">Day ' + day + '</div>' +
                  '<div class="cell vol-cell">' + volDisplay + '</div>' +
                  '<div class="cell page-cell">' + pageDisplay + '</div>' +
                  '<div class="cell psalm-cell">' + psalmDisplay + '</div>' +
                '</div>';
  });

  document.getElementById("reading-plan").innerHTML = planHTML;
};

generatePlan();
