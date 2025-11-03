export default class TrainingSessionResetGuard {
  constructor() {
    this.guidedResetRef = null;
    this.semiResetRef = null;
  }

  update(resets) {
    if (resets.guidedReset) {
      this.guidedResetRef = resets.guidedReset;
    }
    if (resets.semiReset) {
      this.semiResetRef = resets.semiReset;
    }
  }

  trigger(mode, resume) {
    if (mode === "guided" && this.guidedResetRef) {
      this.guidedResetRef({ resume });
    } else if (mode === "semi" && this.semiResetRef) {
      this.semiResetRef({ resume });
    }
  }
}
