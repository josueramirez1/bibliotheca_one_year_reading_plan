const generatePlan = () => {
  const totalDays = 358;

  // 1. Build the master list of main-track pages, excluding Volume III Psalms (15-194) and Volume IV entirely
  const rawVolumes = [
    { name: "Volume I", start: 15, end: 751 },
    { name: "Volume II", start: 15, end: 559 },
    { name: "Volume III", start: 15, end: 607, skipStart: 15, skipEnd: 194 },
    // Volume IV (Apocrypha) removed completely
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
  
  // Track our sequential Psalm progression (300 total slots for 2 full cycles)
  let psalmStep = 0; 
  const totalPsalmSlots = 300;

  // Track Psalm 119 sub-steps across its occurrences
  let psalm119Day = 0;

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

    // 4. Assign Psalms sequentially for every single day, expanding Psalm 119 into its 6 page blocks
    let psalmDisplay = "";
    
    if (psalmStep < totalPsalmSlots) {
      const baseIndex = psalmStep % 150;
      const basePsalmNum = baseIndex + 1;

      if (basePsalmNum !== 119) {
        psalmDisplay = `Psalm ${basePsalmNum}`;
        psalmStep++;
      } else {
        const day119Parts = [
          "Psalm 119 (p. 159–160: Aleph – Daleth)",
          "Psalm 119 (p. 161–162: He – Heth)",
          "Psalm 119 (p. 163–164: Teth – Lamedh)",
          "Psalm 119 (p. 165–166: Mem – Ayin)",
          "Psalm 119 (p. 167: Pe – Qoph)",
          "Psalm 119 (p. 168: Resh – Taw)"
        ];

        psalmDisplay = day119Parts[psalm119Day % 6];
        psalm119Day++;
        psalmStep++;
      }
    } else {
      // If we exceed 300 active psalm slots before day 358, cycle back cleanly through the psalter
      const fallbackPsalmNum = ((psalmStep - totalPsalmSlots) % 150) + 1;
      psalmDisplay = `Psalm ${fallbackPsalmNum}`;
      psalmStep++;
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
