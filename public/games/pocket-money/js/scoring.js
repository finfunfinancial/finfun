// ScoringModule — points rules and final classification (PRD §11–12, FRD FR-11, FR-16 to FR-18).
var PMM = window.PMM || (window.PMM = {});

PMM.POINTS = {
  smart: 10,
  save: 5,
  allTasks: 20,
  saved200: 10,
  saved100: 5,
  broke: -10
};

PMM.BANDS = [
  { min: 80, title: "Money Master", status: "Excellent", message: "You spent wisely, saved well and were ready for surprises. Brilliant planning!" },
  { min: 60, title: "Smart Saver", status: "Solid planner", message: "Great job! You balanced fun and saving. A little more saving makes you a Money Master." },
  { min: 40, title: "Keep Practicing", status: "Getting there", message: "Good effort! Next time, try saving a little early so you have more for later." },
  { min: -Infinity, title: "Try Again", status: "Let's learn more", message: "Every money master started somewhere. Play again and try a new plan!" }
];

PMM.Scoring = {
  isSmart: function (choice, moneyBefore) {
    return typeof choice.smart === "function" ? choice.smart(moneyBefore) : !!choice.smart;
  },

  choicePoints: function (choice, moneyBefore) {
    if (!PMM.Scoring.isSmart(choice, moneyBefore)) return choice.pts || 0;
    return PMM.POINTS.smart + (choice.save ? PMM.POINTS.save : 0);
  },

  // End-of-game adjustments; savedMoney = money left (FR-16).
  finalBonuses: function (state) {
    var list = [];
    var tasksDone = PMM.SITUATIONS.every(function (sit, i) {
      var task = sit.choices.filter(function (c) { return c.task; })[0];
      return state.history[i] && (!task || state.history[i].choice === task.id);
    });
    if (tasksDone) list.push({ label: "All required tasks done", pts: PMM.POINTS.allTasks });
    if (state.money >= 200) list.push({ label: "Saved ₹200 or more", pts: PMM.POINTS.saved200 });
    else if (state.money >= 100) list.push({ label: "Saved ₹100 or more", pts: PMM.POINTS.saved100 });
    else if (state.money === 0) list.push({ label: "Ran out of money", pts: PMM.POINTS.broke });
    return list;
  },

  classify: function (points) {
    for (var i = 0; i < PMM.BANDS.length; i++) if (points >= PMM.BANDS[i].min) return PMM.BANDS[i];
  }
};
