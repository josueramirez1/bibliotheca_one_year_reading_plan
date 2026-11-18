const generatePlan = () => {
  const totalDays = 358;

  // 1. Build the master list using Volumes I, II, III, and V (Volume IV removed)
  const rawVolumes = [
    { name: "Volume I", start: 15, end: 751 },
    { name: "Volume II", start: 15, end: 559 },
    { name: "Volume III", start: 15, end: 607, skipStart: 15, skipEnd: 194 },
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
  
  // Track sequential Psalm progression
  let psalmStep = 0; 
  const totalPsalmSlots = 300;

  // Pre-generate a flattened array of all 300 daily Psalm assignments (expanding Psalm 119 into 6 parts each time it appears)
  let psalmSequence = [];
  
  for (let i = 0; i < totalPsalmSlots; i++) {
    const baseIndex = i % 150;
    const basePsalmNum = baseIndex + 1;

    if (basePsalmNum !== 119) {
      psalmSequence.push(`Psalm ${basePsalmNum}`);
    } else {
      // Expand Psalm 119 into its 6 exact page and stanza sections
      psalmSequence.push("Psalm 119 (p. 159–160: Aleph – Daleth)");
      psalmSequence.push("Psalm 119 (p. 161–162: He – Heth)");
      psalmSequence.push("Psalm 119 (p. 163–164: Teth – Lamedh)");
      psalmSequence.push("Psalm 119 (p. 165–166: Mem – Ayin)");
      psalmSequence.push("Psalm 119 (p. 167: Pe – Qoph)");
      psalmSequence.push("Psalm 119 (p. 168: Resh – Taw)");
      // Note: Because expanding 119 adds 5 extra slots per occurrence, 
      // we advance our loop index `i` past the extra iterations so we don't duplicate them
      i += 5; 
    }
  }

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

    // Pull from our pre-built sequence, looping if we ever reach the end
    let psalmDisplay = psalmSequence[(day - 1) % psalmSequence.length];

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
