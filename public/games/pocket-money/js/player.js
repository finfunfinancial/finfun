// PlayerModule — 2D schoolboy avatar, waypoint movement and animation FSM
// (PRD §13–15, FRD FR-03, FR-04, FR-12). States: IDLE WALKING THINKING HAPPY SAD CELEBRATING.
var PMM = window.PMM || (window.PMM = {});

(function () {
  var INK = "#1b1b1b", SKIN = "#b06f42", SHIRT = "#ffffff", PANTS = "#2b3a67";

  // A limb is a polyline drawn twice: thick ink outline, then colour on top.
  function limb(points, color, width) {
    var d = "M" + points.join(" L");
    var common = ' fill="none" stroke-linecap="round" stroke-linejoin="round" d="' + d + '"';
    return '<path stroke="' + INK + '" stroke-width="' + (width + 6) + '"' + common + "/>" +
           '<path stroke="' + color + '" stroke-width="' + width + '"' + common + "/>";
  }

  function arm(cls, shoulder, elbow, hand) {
    return '<g class="' + cls + '">' +
      limb([shoulder, elbow], SHIRT, 15) +
      limb([elbow, hand], SKIN, 11) +
      '<circle cx="' + hand.split(" ")[0] + '" cy="' + hand.split(" ")[1] + '" r="8" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>' +
      "</g>";
  }

  var SVG =
    '<svg class="boy" viewBox="0 0 170 310" aria-hidden="true">' +
    // effects behind the body
    '<g class="fx fx-happy" fill="#7cc36b" stroke="' + INK + '" stroke-width="3">' +
      '<path d="M18 60 l6 -14 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6z"/>' +
      '<path d="M146 40 l5 -11 l5 11 l11 5 l-11 5 l-5 11 l-5 -11 l-11 -5z"/>' +
    "</g>" +
    // backpack
    '<rect x="30" y="118" width="34" height="68" rx="12" fill="#2e5bd8" stroke="' + INK + '" stroke-width="4"/>' +
    '<rect x="34" y="150" width="24" height="24" rx="6" fill="#f4c542" stroke="' + INK + '" stroke-width="3"/>' +
    // legs
    '<g class="leg leg-l">' + limb(["72 192", "70 280"], PANTS, 17) +
      '<path d="M58 284 q0 -10 12 -10 h8 q14 0 16 12 z" fill="' + INK + '"/></g>' +
    '<g class="leg leg-r">' + limb(["94 192", "96 280"], PANTS, 17) +
      '<path d="M84 284 q0 -10 12 -10 h8 q14 0 16 12 z" fill="' + INK + '"/></g>' +
    // arms behind torso when hanging
    arm("arm arm-l pose-down", "58 124", "50 154", "50 182") +
    arm("arm arm-l pose-up", "58 124", "38 98", "32 66") +
    // torso: shirt, tie, belt, strap
    '<g class="torso">' +
      '<rect x="52" y="112" width="62" height="86" rx="18" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="52" y="184" width="62" height="12" rx="4" fill="' + PANTS + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M78 118 h10 l3 40 l-8 9 l-8 -9z" fill="#e4572e" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M78 130 l10 6 M77 144 l12 6" stroke="#16198c" stroke-width="3"/>' +
      '<path d="M70 113 l13 10 l13 -10" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M60 116 L66 186" stroke="#1d3fa3" stroke-width="7" stroke-linecap="round"/>' +
    "</g>" +
    arm("arm arm-r pose-down", "108 124", "116 154", "116 182") +
    arm("arm arm-r pose-up", "108 124", "128 98", "134 66") +
    arm("arm arm-r pose-think", "108 124", "122 154", "98 112") +
    // head
    '<g class="head">' +
      '<rect x="76" y="98" width="14" height="18" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="47" cy="74" r="9" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="119" cy="74" r="9" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="83" cy="70" r="37" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M46 70 C40 30 72 22 90 28 C112 28 126 44 120 70 C114 54 102 48 92 50 C78 44 62 52 54 64 Z" fill="' + INK + '"/>' +
      '<circle cx="64" cy="88" r="6" fill="#ee9fb8" opacity=".7"/><circle cx="104" cy="88" r="6" fill="#ee9fb8" opacity=".7"/>' +
      '<g class="eyes" fill="' + INK + '"><ellipse cx="70" cy="74" rx="4.5" ry="5.5"/><ellipse cx="97" cy="74" rx="4.5" ry="5.5"/>' +
        '<circle cx="71.5" cy="72" r="1.6" fill="#fff"/><circle cx="98.5" cy="72" r="1.6" fill="#fff"/></g>' +
      '<g class="brows brows-normal" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"><path d="M63 63 q7 -4 13 0"/><path d="M91 63 q7 -4 13 0"/></g>' +
      '<g class="brows brows-sad" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"><path d="M63 66 q7 -1 13 -6"/><path d="M91 60 q6 5 13 6"/></g>' +
      '<path class="mouth mouth-neutral" d="M74 92 q9 6 18 0" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="mouth mouth-open" d="M71 89 q12 1 24 0 q-2 16 -12 16 q-10 0 -12 -16z" fill="#7a2a1a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path class="mouth mouth-frown" d="M74 98 q9 -8 18 0" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path class="mouth mouth-hmm" d="M76 95 h12" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
    "</g>" +
    // effects in front
    '<g class="fx fx-think"><circle cx="146" cy="30" r="20" fill="#fff" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="128" cy="56" r="5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<text x="146" y="40" text-anchor="middle" font-size="28" font-weight="900" fill="#2e5bd8" font-family="Nunito, Arial, sans-serif">?</text></g>' +
    '<g class="fx fx-sad"><rect x="118" y="168" width="34" height="24" rx="5" fill="#a0673a" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M118 176 h34" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M128 198 q2 6 0 10 M142 198 q-2 6 0 10" stroke="#8ec3f0" stroke-width="3" fill="none" stroke-linecap="round"/></g>' +
    '<g class="fx fx-trophy" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round">' +
      '<path d="M62 6 h42 v12 q0 24 -21 26 q-21 -2 -21 -26z" fill="#f4c542"/>' +
      '<path d="M62 12 h-10 q0 16 14 18 M104 12 h10 q0 16 -14 18" fill="none"/>' +
      '<rect x="77" y="44" width="12" height="8" fill="#f4c542"/><rect x="68" y="52" width="30" height="8" rx="2" fill="#2e5bd8"/></g>' +
    "</svg>";

  var SPEED = 26; // stage-width percent per second

  function Player(el) {
    this.el = el;
    this.el.innerHTML = SVG;
    this.x = 8;
    this.facing = 1;
    this.raf = null;
    this.setState("IDLE");
    this.render();
  }

  Player.prototype.setState = function (state) {
    this.state = state;
    this.el.setAttribute("data-state", state.toLowerCase());
  };

  Player.prototype.render = function () {
    this.el.style.left = this.x + "%";
    this.el.style.setProperty("--facing", this.facing);
  };

  Player.prototype.place = function (x) {
    cancelAnimationFrame(this.raf);
    this.x = x;
    this.facing = 1;
    this.render();
  };

  // Constant-speed 1D movement; snaps when within epsilon and resolves (WAYPOINT_REACHED).
  Player.prototype.walkTo = function (target) {
    var self = this;
    cancelAnimationFrame(self.raf);
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return new Promise(function (resolve) {
      var last = null;
      function arrive() {
        self.x = target;
        self.render();
        self.setState("IDLE");
        self.el.dispatchEvent(new CustomEvent("waypointreached", { bubbles: true }));
        resolve();
      }
      if (reduced) return arrive();
      self.setState("WALKING");
      function step(now) {
        if (last === null) last = now;
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        var dx = target - self.x;
        if (Math.abs(dx) < 0.5) return arrive();
        self.facing = dx > 0 ? 1 : -1;
        self.x += self.facing * Math.min(Math.abs(dx), SPEED * dt);
        self.render();
        self.raf = requestAnimationFrame(step);
      }
      self.raf = requestAnimationFrame(step);
    });
  };

  PMM.Player = Player;
})();
