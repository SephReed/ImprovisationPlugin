




class eImprov {
  constructor() {
    this.banks = new BanksState();
    this.page = new PageState();
  }
}

const APP = new eImprov();



class PageState {
  constructor() {
    this.pages = [CLIP_PAGE, CONDUCTOR_PAGE, DRUM_PAGE];
    this.current = this.pages[0];
  }

  onPageChange(cb) { this.pageChangeCb = cb; }

  next() {
    const index = this.pages.indexOf(this.current);
    this.setPage(this.pages[index % this.pages.length]);
  }

  set(page) {
    if (this.current === page) { return; }
    this.current = page;
    this.pageChangeCb && this.pageChangeCb(page);
  }
}




class BanksState {
  constructor() {
    this.liveBanks = [];
    this.pos = 0;
  }

  onPositionShift(cb) { this.posShiftCb = cb; }

  get(index) {
    return this.liveBanks[index];
  }

  init() {
    for (let t = 0; t < LIVE_BANK_HEIGHT; t++) {
      const bank = this.liveBanks[t] = host.createTrackBank(LIVE_BANK_HEIGHT, MAX_MODABLE_SENDS, LIVE_BANK_WIDTH);

      var track = bank.getTrack(t);
      track.getArm().addValueObserver(createArmObserver(t));
      track.addIsSelectedInEditorObserver(MDI_createSelectObserver(t));
      for (let i_s = 0; i_s < t; i_s++) {   
        bank.scrollScenesDown();  
      }
    }
  }

  shiftPosition(numSteps)  {
    if(numSteps == 0)  {  
      return;  

    } else if (numSteps > 0)  {
        let spacesLeft = (availableTracks + 1) - (LIVE_BANK_HEIGHT + this.pos);
        numSteps = Math.min(numSteps, spacesLeft);
        if (numSteps === 0) { return; }
        this.pos += numSteps;

    } else if (numSteps < 0)  {
      if (this.pos === 0) { return; }
      numSteps = Math.max(numSteps, -1 * this.pos);
      this.pos -= numSteps;
    }

    this.posShiftCb && this.posShiftCb(numSteps);
    updateMasterTitlePage(LIVE_BANK_POS_TAG);
  }
}