// MoneyModule — balance ledger with overdraft protection (FRD FR-07 to FR-10, SEC 16).
var PMM = window.PMM || (window.PMM = {});

PMM.START_MONEY = 500;

PMM.Money = {
  canAfford: function (state, cost) {
    return cost <= state.money;
  },

  // Returns true and deducts if affordable; otherwise leaves state untouched.
  spend: function (state, cost) {
    if (!PMM.Money.canAfford(state, cost)) return false;
    state.money -= cost;
    state.spentMoney += cost;
    PMM.Money.checkInvariants(state);
    return true;
  },

  checkInvariants: function (state) {
    if (state.money + state.spentMoney !== PMM.START_MONEY || state.money < 0) {
      throw new Error("Ledger drift: money=" + state.money + " spent=" + state.spentMoney);
    }
  }
};
