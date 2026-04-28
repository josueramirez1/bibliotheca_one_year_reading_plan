const volumes = [
  { name: "Volume I", start: 15, end: 751 },
  { name: "Volume II", start: 15, end: 559 },
  { name: "Volume III", start: 15, end: 607 },
  { name: "Volume IV", start: 15, end: 552 },
  { name: "Volume V", start: 15, end: 566 },
];

const generatePlan = () => {
  const totalDays = 365;
  const totalPages = volumes.reduce((acc, v) => acc + (v.end - v.start + 1), 0);
  const basePPD = Math.floor(totalPages / totalDays);
  let extraPages = totalPages % totalDays;

  let planHTML = "";
  let currentVolIdx = 0;
  let currentPage = volumes[currentVolIdx].start;

  for (let day = 1; day <= totalDays; day++) {
    const ppd = basePPD + (day <= extraPages ? 1 : 0);
    const currentVol = volumes[currentVolIdx];
    let volDisplay,
      pageDisplay,
      isTransition = false;

    if (currentPage + ppd - 1 > currentVol.end) {
      // Transition Day
      isTransition = true;
      const v1End = currentVol.end;
      const v2 = volumes[currentVolIdx + 1];
      const v2Needed = ppd - (v1End - currentPage + 1);
      const v2End = v2.start + v2Needed - 1;

      volDisplay = `${currentVol.name} & ${v2.name}`;
      pageDisplay = `${currentVol.name}: ${currentPage}–${v1End}; ${v2.name}: ${v2.start}–${v2End}`;

      currentPage = v2End + 1;
      currentVolIdx++;
    } else {
      // Standard Day
      const endPage = currentPage + ppd - 1;
      volDisplay = currentVol.name;
      pageDisplay = `${currentPage}–${endPage}`;

      currentPage = endPage + 1;
      if (currentPage > currentVol.end && currentVolIdx < volumes.length - 1) {
        currentVolIdx++;
        currentPage = volumes[currentVolIdx].start;
      }
    }

    planHTML += `
                <div class="row ${isTransition ? "is-transition" : ""}">
                    <div class="cell day-cell">Day ${day}</div>
                    <div class="cell vol-cell">${volDisplay}</div>
                    <div class="cell page-cell">${pageDisplay}</div>
                </div>
            `;
  }
  document.getElementById("reading-plan").innerHTML = planHTML;
};

generatePlan();
