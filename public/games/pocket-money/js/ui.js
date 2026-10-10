// UIModule — HUD, situation panel, toasts and overlays (FRD FR-02, FR-13, FR-17, FR-20).
var PMM = window.PMM || (window.PMM = {});

PMM.FEEDBACK = {
  smart: "Good choice! You still have money for future needs.",
  spent: "You spent ₹{cost}. Always keep an eye on your remaining budget.",
  shock: "Unexpected expenses can happen. Good thing you saved!",
  shockNoSave: "Unexpected expenses can happen. Keeping some money aside helps!",
  borrow: "Borrowing works today, but you will need your own notebook soon.",
  walk: "Walking is free! But a fixed bicycle saves time every day.",
  later: "You can save up and buy this toy later.",
  noMoney: "You don't have enough money for this item."
};

PMM.UI = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var toastTimer;

  function rupees(n) { return "₹" + n; }

  function bump(el) {
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function updateHud(state) {
    var money = $("hud-money"), points = $("hud-points");
    if (money.textContent !== rupees(state.money)) bump(money);
    if (points.textContent !== String(state.points)) bump(points);
    $("hud-day").textContent = state.day + " of " + PMM.TOTAL_DAYS;
    money.textContent = rupees(state.money);
    points.textContent = state.points;
  }

  function setScene(bg, location) {
    $("scene-bg").src = bg;
    $("location").textContent = location;
  }

  function setPrompt(text) {
    $("prompt").textContent = text;
  }

  function clearActions() {
    $("choices").innerHTML = "";
    $("feedback").hidden = true;
    clearTimeout(toastTimer);
    $("toast").className = "toast";
  }

  function showChoices(choices, onPick) {
    var box = $("choices");
    box.innerHTML = "";
    choices.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "choice";
      b.type = "button";
      b.dataset.id = c.id;
      b.innerHTML = '<img src="' + c.icon + '" alt="">' +
        '<span class="choice-label">' + c.label + "</span>" +
        '<span class="choice-cost">' + rupees(c.cost) + "</span>";
      b.addEventListener("click", function () { onPick(c, b); });
      box.appendChild(b);
    });
    box.querySelector("button").focus({ preventScroll: true });
  }

  function lockChoices(locked) {
    $("choices").querySelectorAll("button").forEach(function (b) { b.disabled = locked; });
  }

  function markUnaffordable(btn, shortfall) {
    btn.classList.add("cant");
    btn.querySelector(".choice-cost").textContent = "Need " + rupees(shortfall) + " more";
  }

  function showFeedback(text, pointsDelta, nextLabel, onNext) {
    var box = $("feedback");
    $("feedback-text").textContent = text;
    $("feedback-points").textContent = pointsDelta > 0 ? "+" + pointsDelta + " points" : "";
    $("choices").innerHTML = "";
    var next = $("next-btn");
    next.textContent = nextLabel;
    next.onclick = onNext;
    box.hidden = false;
    next.focus({ preventScroll: true });
  }

  function toast(text, kind) {
    var t = $("toast");
    t.textContent = text;
    t.className = "toast show " + (kind || "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 2600);
  }

  function showOverlay(id, show) {
    $(id).hidden = !show;
  }

  function showResults(r) {
    $("r-band").textContent = r.band.title;
    $("r-status").textContent = r.band.status;
    $("r-message").textContent = r.band.message;
    $("r-start").textContent = rupees(PMM.START_MONEY);
    $("r-spent").textContent = rupees(r.spent);
    $("r-saved").textContent = rupees(r.saved);
    $("r-smart").textContent = r.smartCount + "/" + PMM.TOTAL_DAYS;
    $("r-points").textContent = r.points;
    $("r-bonus").innerHTML = r.bonuses.map(function (b) {
      return "<li><span>" + b.label + "</span><b>" + (b.pts > 0 ? "+" : "") + b.pts + "</b></li>";
    }).join("");
    $("results").dataset.tier = r.band.title.toLowerCase().replace(/\s+/g, "-");
    showOverlay("results", true);
    $("again-btn").focus({ preventScroll: true });
  }

  function confetti(on) {
    var c = $("confetti");
    c.innerHTML = "";
    if (!on) return;
    var colors = ["#f4c542", "#2e5bd8", "#ee9fb8", "#7cc36b", "#e4572e", "#c3a3df"];
    for (var i = 0; i < 60; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 2.5 + "s";
      p.style.animationDuration = 2.5 + Math.random() * 2 + "s";
      p.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      c.appendChild(p);
    }
  }

  return {
    rupees: rupees, updateHud: updateHud, setScene: setScene, setPrompt: setPrompt,
    clearActions: clearActions, showChoices: showChoices, lockChoices: lockChoices,
    markUnaffordable: markUnaffordable, showFeedback: showFeedback, toast: toast,
    showOverlay: showOverlay, showResults: showResults, confetti: confetti
  };
})();
