// SituationModule — the 5 fixed scenarios (PRD §8, FRD FR-14/15).
// A choice is "smart" (+10, +5 more if it is also a save) or earns its flat `pts`.
// `smart` may be a function of the balance before choosing, for choices whose
// wisdom depends on how well the player planned earlier.
// `task: true` marks the required daily task; skipping it forfeits the "all tasks" bonus.
var PMM = window.PMM || (window.PMM = {});

PMM.SITUATIONS = [
  {
    day: 1,
    id: "day1",
    location: "School Stationery Shop",
    background: "assets/backgrounds/school.svg",
    prompt: "School starts today. You need a notebook for class.",
    choices: [
      { id: "notebook", label: "Buy notebook", cost: 50, smart: true, task: true, icon: "assets/objects/notebook.svg", feedback: "smart" },
      { id: "borrow", label: "Borrow a friend's", cost: 0, icon: "assets/objects/borrow.svg", feedback: "borrow" }
    ]
  },
  {
    day: 2,
    id: "day2",
    location: "Gaming Zone",
    background: "assets/backgrounds/arcade.svg",
    prompt: "You have free time this afternoon. Do you want to play or save?",
    choices: [
      { id: "play", label: "Play arcade games", cost: 100, pts: 5, icon: "assets/objects/joystick.svg", feedback: "spent" },
      { id: "save", label: "Save money", cost: 0, smart: true, save: true, icon: "assets/objects/piggy.svg", feedback: "smart" }
    ]
  },
  {
    day: 3,
    id: "day3",
    location: "Food Shop",
    background: "assets/backgrounds/food.svg",
    prompt: "Lunch time! Which one will you pick?",
    choices: [
      { id: "sandwich", label: "Sandwich", cost: 50, smart: true, icon: "assets/objects/sandwich.svg", feedback: "smart" },
      { id: "pizza", label: "Pizza", cost: 120, pts: 5, icon: "assets/objects/pizza.svg", feedback: "spent" }
    ]
  },
  {
    day: 4,
    id: "day4",
    location: "Bicycle Repair Stall",
    background: "assets/backgrounds/bike.svg",
    prompt: "Oh no! Your bicycle tyre is flat. You need it to ride to school.",
    choices: [
      { id: "repair", label: "Repair bicycle", cost: 80, smart: true, task: true, icon: "assets/objects/bicycle.svg", feedback: "shock" },
      { id: "walk", label: "Walk to school instead", cost: 0, icon: "assets/objects/shoe.svg", feedback: "walk" }
    ]
  },
  {
    day: 5,
    id: "day5",
    location: "Toy Shop",
    background: "assets/backgrounds/toyshop.svg",
    prompt: "A cool remote-control car is in the toy shop window!",
    choices: [
      // Buying is smart only if you can still keep ₹100 aside afterwards.
      { id: "toy", label: "Buy the toy car", cost: 200, pts: 5, smart: function (moneyBefore) { return moneyBefore - 200 >= 100; }, icon: "assets/objects/toycar.svg", feedback: "toy" },
      // Waiting is a smart save only when it is a real choice, not forced.
      { id: "wait", label: "Save up, buy later", cost: 0, save: true, smart: function (moneyBefore) { return moneyBefore >= 200; }, icon: "assets/objects/piggy.svg", feedback: "later" }
    ]
  }
];

PMM.TOTAL_DAYS = PMM.SITUATIONS.length;
