// GameModule — orchestrates the day loop (PRD §6, FRD SEC 19, Algorithm §10).
// START → walk to location → THINKING → choose → validate → HAPPY/SAD → next day → results.
var PMM = window.PMM || (window.PMM = {});

(function () {
  var UI = PMM.UI;
  var STAND_X = 38;   // where the boy stops, in front of each shop
  var ENTER_X = -8;
  var EXIT_X = 108;

  var state;
  var player;
  var busy = false;

  function freshState() {
    return { money: PMM.START_MONEY, points: 0, day: 1, spentMoney: 0, history: [] };
  }

  function feedbackFor(choice, smart) {
    var key = choice.feedback;
    if (key === "toy") key = smart ? "smart" : "spent";
    if (key === "shock" && !state.history.some(function (h) { return h.choice === "save"; })) key = "shockNoSave";
    return PMM.FEEDBACK[key].replace("{cost}", choice.cost);
  }

  function startGame() {
    state = freshState();
    UI.showOverlay("start", false);
    UI.showOverlay("results", false);
    UI.confetti(false);
    loadSituation();
  }

  function loadSituation() {
    var s = PMM.SITUATIONS[state.day - 1];
    UI.updateHud(state);
    UI.setScene(s.background, s.location);
    UI.clearActions();
    UI.setPrompt("Walking to the " + s.location + "...");
    player.place(ENTER_X);
    player.walkTo(STAND_X).then(function () {
      player.setState("THINKING");
      UI.setPrompt(s.prompt);
      busy = false;
      UI.showChoices(s.choices, onChoice);
    });
  }

  function onChoice(choice, btn) {
    if (busy) return;
    var moneyBefore = state.money;

    if (!PMM.Money.spend(state, choice.cost)) {
      busy = true;
      UI.lockChoices(true);
      player.setState("SAD");
      UI.markUnaffordable(btn, choice.cost - state.money);
      UI.toast(PMM.FEEDBACK.noMoney, "bad");
      setTimeout(function () {
        player.setState("THINKING");
        UI.lockChoices(false);
        busy = false;
      }, 1500);
      return;
    }

    busy = true;
    var smart = PMM.Scoring.isSmart(choice, moneyBefore);
    var delta = PMM.Scoring.choicePoints(choice, moneyBefore);
    state.points += delta;
    state.history.push({ day: state.day, choice: choice.id, cost: choice.cost, points: delta, smart: smart });
    UI.updateHud(state);
    player.setState("HAPPY");
    var text = feedbackFor(choice, smart);
    UI.toast(text, smart ? "good" : "");
    var last = state.day === PMM.TOTAL_DAYS;
    UI.showFeedback(text, delta, last ? "See my results" : "Next day", last ? finishGame : nextDay);
  }

  function nextDay() {
    UI.clearActions();
    UI.setPrompt("On to the next day...");
    player.walkTo(EXIT_X).then(function () {
      state.day += 1;
      loadSituation();
    });
  }

  function finishGame() {
    var bonuses = PMM.Scoring.finalBonuses(state);
    bonuses.forEach(function (b) { state.points += b.pts; });
    var band = PMM.Scoring.classify(state.points);
    var celebrate = state.points >= 60;
    UI.updateHud(state);
    UI.clearActions();
    UI.setPrompt("Week complete!");
    player.setState(celebrate ? "CELEBRATING" : "HAPPY");
    UI.confetti(celebrate);
    var results = {
      band: band,
      spent: state.spentMoney,
      saved: state.money,
      points: state.points,
      bonuses: bonuses,
      smartCount: state.history.filter(function (h) { return h.smart; }).length
    };
    // Let the reaction play on stage before the report card covers it.
    setTimeout(function () { UI.showResults(results); }, 1800);
  }

  document.addEventListener("DOMContentLoaded", function () {
    player = new PMM.Player(document.getElementById("player"));
    player.place(STAND_X);
    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("again-btn").addEventListener("click", startGame);
  });
})();
