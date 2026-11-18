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
