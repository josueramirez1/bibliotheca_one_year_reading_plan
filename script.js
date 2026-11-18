const generatePlan = () => {
  const totalDays = 358; // Adjusted to match a 5-day-per-week rhythm (~51-52 weeks)

  // 1. Build the master list of main-track pages, excluding Volume III Psalms (15-194)
  const rawVolumes = [
    { name: "Volume I", start: 15, end: 751 },
    { name: "Volume II", start: 15, end: 559 },
    { name: "Volume III", start: 15, end: 607, skipStart: 15, skipEnd: 194 },
    { name: "Volume IV", start: 15, end: 552 },
    { name: "Volume V", start: 15, end: 566 },
  ];

  let masterPages = [];
  rawVolumes.forEach((v) => {
    for (let p = v.start; p <= v.end; p++) {
      if (v.skipStart && p >= v.skipStart && p <= v.skipEnd) continue;
      masterPages.push({ volume: v.name, page: p });
    }
  });

  // 2. Distribute pages across the 358 active days
  const totalPages = masterPages.length;
  const basePPD = Math.floor(totalPages / totalDays);
  let extraPages = totalPages % totalDays;

  let planHTML = "";
  let pageIndex = 0;
  let psalmCounter = 0; // Tracks sequential Psalm readings

  // 3. Generate rows for each day
  for (let day = 1; day <= totalDays; day++) {
    const ppd = basePPD + (day <= extraPages ? 1 : 0);
    const dayPages = masterPages.slice(pageIndex, pageIndex + ppd);
    pageIndex += ppd;

    const groups = [];
    dayPages.forEach((item) => {
      let lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.volume === item.volume) {
        lastGroup.endPage = item.page;
      } else {
        groups.push({
          volume: item.volume,
          startPage: item.page,
          endPage: item.page,
        });
      }
    });

    const isTransition = groups.length > 1;
    let volDisplay, pageDisplay;

    if (!isTransition) {
      volDisplay = groups[0].volume;
      pageDisplay =
        groups[0].startPage === groups[0].endPage
          ? `${groups[0].startPage}`
          : `${groups[0].startPage}–${groups[0].endPage}`;
    } else {
      volDisplay = groups.map((g) => g.volume).join(" & ");
      pageDisplay = groups
        .map(
          (g) =>
            `${g.volume}: ${
              g.startPage === g.endPage
                ? g.startPage
                : g.startPage + "–" + g.endPage
            }`
        )
        .join("; ");
    }

    // 4. Assign Psalms sequentially up to the 300 total cap (2 full cycles of 150)
    let psalmDisplay = "—";
    const dayOfWeek = day % 7;
    
    // Skipping two specific days of the week as rest/flex days (e.g., weekends)
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && psalmCounter < 300) {
      const psalmNum = (psalmCounter % 150) + 1;
      psalmDisplay = `Psalm ${psalmNum}`;
      psalmCounter++;
    }

    planHTML += `
      <div class="row ${isTransition ? "is-transition" : ""}">
          <div class="cell day-cell">Day ${day}</div>
          <div class="cell vol-cell">${volDisplay}</div>
          <div class="cell page-cell">${pageDisplay}</div>
          <div class="cell psalm-cell">${psalmDisplay}</div>
      </div>
    `;
  }

  document.getElementById("reading-plan").innerHTML = planHTML;
};

generatePlan();
