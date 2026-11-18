const generatePlan = () => {
  const totalDays = 358;

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
  
  // Track our sequential Psalm progression (We need 300 total slots for 2 full cycles)
  let psalmStep = 0; 
  const totalPsalmSlots = 300;

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

    // 4. Check if current day's reading touches Volume IV (Apocrypha)
    const includesVolumeIV = groups.some(g => g.volume === "Volume IV");

    // 5. Assign Psalms for every non-Apocrypha day
    let psalmDisplay = "—";
    
    if (!includesVolumeIV && psalmStep < totalPsalmSlots) {
      // Check if this slot belongs to Psalm 119 expansion
      // In a 2-cycle plan of 150, Psalm 119 appears twice. 
      // We can map specific steps to your 6-day Psalm 119 breakdown:
      // (Psalm 119 is normally Psalm #119 in sequence)
      
      const currentBasePsalm = (psalmStep % 150) + 1;

      if (currentBasePsalm === 119) {
        // Determine which of the 6 parts of Psalm 119 this occurrence is
        // (Tracking how many times we've hit Psalm 119 so far)
        const psalm119Occurrences = Math.floor(psalmStep / 150); 
        // To keep it simple and sequence it across the 6 days during that block:
        // We can use a modulo or sub-counter, or handle the 6-day block explicitly.
      }

      // Let's implement the explicit 6-day breakdown for Psalm 119 when it comes up:
      // Instead of standard numbering when hitting 119, we expand it:
      // (We will use a helper check below)
    }

    // Refined Psalm Assignment Logic with Psalm 119 6-Day Spread:
    if (!includesVolumeIV && psalmStep < totalPsalmSlots) {
      // Let's check the exact psalm number in the standard 1-150 rotation
      const baseIndex = psalmStep % 150;
      const basePsalmNum = baseIndex + 1;

      if (basePsalmNum !== 119) {
        psalmDisplay = `Psalm ${basePsalmNum}`;
        psalmStep++;
      } else {
        // We hit Psalm 119! Let's spread it across 6 consecutive days using exact specifications:
        // Since Psalm 119 occurs twice in 300 slots, this block will run twice (once per cycle).
        // Let's track 119 sub-steps:
        if (typeof window.psalm119Day === 'undefined') window.psalm119Day = 0;
        
        const day119Parts = [
          "Psalm 119 (p. 159–160: Aleph – Daleth)",
          "Psalm 119 (p. 161–162: He – Heth)",
          "Psalm 119 (p. 163–164: Teth – Lamedh)",
          "Psalm 119 (p. 165–166: Mem – Ayin)",
          "Psalm 119 (p. 167: Pe – Qoph)",
          "Psalm 119 (p. 168: Resh – Taw)"
        ];

        psalmDisplay = day119Parts[window.psalm119Day % 6];
        window.psalm119Day++;
        psalmStep++; // Consume one slot for this day
      }
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
