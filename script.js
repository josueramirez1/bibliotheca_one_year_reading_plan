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

// Psalm track adjusted so it stays seamlessly in sequence
const getPsalmForDay = (day) => {
  if (day >= 1 && day <= 310) {
    // If day is past 199, adjust index back by 1 since Day 199 is a narrative pause
    const effectiveDay = day > 199 ? day - 1 : day;
    if (effectiveDay >= 119 && effectiveDay <= 124) return PSALM_119_PARTS[effectiveDay - 119];
    let baseNum = effectiveDay < 119 ? effectiveDay : effectiveDay - 5;
    // Loop back for second pass if needed
    if (baseNum > 150) baseNum = ((baseNum - 1) % 150) + 1;
    return "Psalm " + baseNum;
  } 
  const index = day - 311;
  return FINAL_PASS_PSALMS[Math.min(index, FINAL_PASS_PSALMS.length - 1)];
};

const generatePlan = () => {
  const masterPages = buildMasterPages(RAW_VOLUMES);
  
  // Total active reading days excluding our narrative pause day (Day 199)
  const readingDays = TOTAL_DAYS - 1; 
  const basePPD = Math.floor(masterPages.length / readingDays);
  const extraPages = masterPages.length % readingDays;

  let planHTML = "";
  let pageIndex = 0;

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    let volDisplay = "";
    let pageDisplay = "";
    let isTransition = false;

    // Special narrative pause wedged between Day 198 and Day 199
    if (day === 199) {
      volDisplay = "Writings";
      pageDisplay = "Psalms 1–2";
    } else {
      // For Day 198, give it 1 extra page (absorbs page 559 cleanly)
      let ppd = basePPD + (pageIndex < extraPages ? 1 : 0);
      if (day === 198) {
        ppd += 1; 
      }
      
      const dayPages = masterPages.slice(pageIndex, pageIndex + ppd);
      pageIndex += ppd;

      const groups = [];
      dayPages.forEach((item) => {
        let last = groups[groups.length - 1];
        if (last && last.volume === item.volume) {
          last.endPage = item.page;
        } else {
          groups.push({ volume: item.volume, startPage: item.page, endPage: item.page });
        }
      });

      isTransition = groups.length > 1;
      if (!isTransition) {
        volDisplay = groups[0].volume;
        pageDisplay = groups[0].startPage === groups[0].endPage ? "" + groups[0].startPage : groups[0].startPage + "–" + groups[0].endPage;
      } else {
        volDisplay = groups.map(g => g.volume).join(" & ");
        pageDisplay = groups.map(g => g.volume + ": " + (g.startPage === g.endPage ? g.startPage : g.startPage + "–" + g.endPage)).join("; ");
      }
    }

    const psalmDisplay = getPsalmForDay(day);

    planHTML += '<div class="row ' + (isTransition ? 'is-transition' : '') + '">' +
                  '<div class="cell day-cell">Day ' + day + '</div>' +
                  '<div class="cell vol-cell">' + volDisplay + '</div>' +
                  '<div class="cell page-cell">' + pageDisplay + '</div>' +
                  '<div class="cell psalm-cell">' + psalmDisplay + '</div>' +
                '</div>';
  }

  document.getElementById("reading-plan").innerHTML = planHTML;
};

generatePlan();
