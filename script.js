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

const generatePlan = () => {
  const masterPages = buildMasterPages(RAW_VOLUMES);
  
  // 357 narrative days + 1 dedicated transition wedge day = 358 total days
  const activeNarrativeDays = TOTAL_DAYS - 1; 
  const totalPages = masterPages.length;
  
  const basePPD = Math.floor(totalPages / activeNarrativeDays);
  const extraPages = totalPages % activeNarrativeDays;

  // Step 1: Pre-calculate page slices for all 357 narrative days to find the exact Volume II -> III boundary
  let narrativeSlices = [];
  let pageIndex = 0;
  for (let d = 1; d <= activeNarrativeDays; d++) {
    const ppd = basePPD + (d <= extraPages ? 1 : 0);
    const dayPages = masterPages.slice(pageIndex, pageIndex + ppd);
    pageIndex += ppd;
    narrativeSlices.push(dayPages);
  }

  // Find which day index transitions from Volume II to Volume III
  let wedgeInsertIndex = narrativeSlices.findIndex((slice, index) => {
    if (index === 0) return false;
    const prevVol = narrativeSlices[index - 1][narrativeSlices[index - 1].length - 1].volume;
    const currVol = slice[0].volume;
    return prevVol === "Volume II" && currVol === "Volume III";
  });

  // Fallback if index isn't found automatically
  if (wedgeInsertIndex === -1) wedgeInsertIndex = Math.floor(activeNarrativeDays / 2);

  // Step 2: Build the final 358-day schedule, injecting the wedge and absorbing an extra page right before it
  let planHTML = "";
  let narrativeSlicePtr = 0;

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    let volDisplay = "";
    let pageDisplay = "";
    let isTransition = false;

    // The wedge day sits right at the Volume II / III transition point
    if (day === wedgeInsertIndex + 1) {
      volDisplay = "Writings";
      pageDisplay = "Psalms 1–2";
    } else {
      // If this is the day immediately before the wedge, absorb an extra page from the next slice to smooth pacing
      let dayPages = narrativeSlices[narrativeSlicePtr++];
      if (day === wedgeInsertIndex && narrativeSlicePtr < narrativeSlices.length) {
        dayPages = dayPages.concat(narrativeSlices[narrativeSlicePtr++];
      }

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
      if (!isTransition && groups.length > 0) {
        volDisplay = groups[0].volume;
        pageDisplay = groups[0].startPage === groups[0].endPage ? "" + groups[0].startPage : groups[0].startPage + "–" + groups[0].endPage;
      } else if (groups.length > 0) {
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
