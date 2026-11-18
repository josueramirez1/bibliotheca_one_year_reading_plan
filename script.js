const generatePlan = () => {
  const totalDays = 365;

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

  // 2. Distribute pages across 365 days
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

    // 4. 5 days on, 2 days off pattern (e.g., skipping every 6th and 7th day of the week, 
    // or weekends), mapping out 300 total Psalm readings smoothly.
    let psalmDisplay = "—";
    const dayOfWeek = day % 7;
    // If dayOfWeek is 0 (Saturday) or 6 (Friday/Weekend), leave blank as a rest day. 
    // Otherwise, assign the next sequential Psalm up to the 300 cap.
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
