/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	HelperClasses.js:  
+     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/



//this class holds all the data pertaining to most recent
//it also has information on whether another track is qeued to be recorded
function CurrentlyRecording(track, scene){
	this.status = RECORDING_QUEUED;
   	this.track = track;
   	this.scene = scene;  
	this.nextTrack = -1;  }

//---------------------------------------------------------------------------

function ToggleableButton(track, buttonType)  {
	this.track = track;
	this.buttonType = buttonType;
	this.status = false;
	this.held = false;  }

ToggleableButton.prototype.setHeld = function(held) {
	if(this.held != held)  {
		if(this.buttonType == TGL_BTN_SOLO) {  getTrackFromBank(this.track).getSolo().toggle();  }
		else if(this.buttonType == TGL_BTN_MUTE) {  getTrackFromBank(this.track).getMute().toggle();  }
		
		this.held = held;  }
}

//---------------------------------------------------------------------------

function StalledPadHit(velocity){
   	this.velocity = velocity;  
	this.impulseOnly = false;  }

//---------------------------------------------------------------------------

function ModButton() {
	this.held = false;
	this.numUses = 0;
}

ModButton.prototype.setHeld = function(held) {
	if(held == false)  { this.numUses = 0;  }
	this.held = held;
}







/******************************
*      PAD STATE
******************************/

function PadState(padNum)  {
	this.padNum = padNum;
	this.padXLoc = (this.padNum%4)*2;
	this.padYLoc = Math.floor(this.padNum/4)*2; 
		//
	this.xPos = 0;
	this.lastXPos = 0;
	this.yPos = 0;
	this.lastYPos = 0;
	this.pressure = 0;
	this.velocity = 0;
		//
	this.SW = false;
	this.SE = false;
	this.NW = false;
	this.NE = false;
}

//---------------------------------------------------------------------------

PadState.prototype.setXPos = function(newXPos) {
    this.lastXPos = this.xPos;
    this.xPos = newXPos;
    this.updateCorners(this.pressure);
};

//---------------------------------------------------------------------------

PadState.prototype.setYPos = function(newYPos) {
    this.lastYPos = this.yPos;
    this.yPos = newYPos;  
    this.updateCorners(this.pressure);
};

//---------------------------------------------------------------------------

PadState.prototype.setPressure = function(newPressure) {
	this.pressure = newPressure;

	var x = this.padXLoc;
	var y = this.padYLoc;

	if(this.SW == true) {  tryAsMidiCornerPressure(x, y, this.pressure);  }
	if(this.SE == true) {  tryAsMidiCornerPressure(x+1, y, this.pressure);  }
	if(this.NW == true) {  tryAsMidiCornerPressure(x, y+1, this.pressure);  }
	if(this.NE == true) {  tryAsMidiCornerPressure(x+1, y+1, this.pressure);  }
};

//---------------------------------------------------------------------------

PadState.prototype.setVelocity = function(newVelocity) {
	var oldVelocity = this.velocity;
	this.velocity = newVelocity;

	if(this.velocity == 0 && oldVelocity > 0) {
		this.updateCorners(this.velocity);  }

	if(this.velocity > 0 && oldVelocity == 0) {
		this.updateCorners(this.velocity);  }
};

//---------------------------------------------------------------------------

PadState.prototype.updateCorners = function(data2)  {
	var pressOut = initArray(0, 4);

	if(this.velocity > 0) {
		if(this.xPos < THRESH_PAD_MAX)  {
			if(this.yPos < THRESH_PAD_MAX) {  pressOut[0] = data2;  }
			if(this.yPos > THRESH_PAD_MIN) {  pressOut[2] = data2;  }
		}
		if(this.xPos > THRESH_PAD_MIN)  {
			if(this.yPos < THRESH_PAD_MAX) {  pressOut[1] = data2;  }
			if(this.yPos > THRESH_PAD_MIN) {  pressOut[3] = data2;  }
	}	}

	var x = this.padXLoc;
	var y = this.padYLoc;

	var nSW = (pressOut[0] != 0);
	var nSE = (pressOut[1] != 0);
	var nNW = (pressOut[2] != 0);
	var nNE = (pressOut[3] != 0);

	if(nSW != this.SW) {  tryAsMidiCornerTrigger(x, y, pressOut[0]);  }
	if(nSE != this.SE) {  tryAsMidiCornerTrigger(x+1, y, pressOut[1]);  }
	if(nNW != this.NW) {  tryAsMidiCornerTrigger(x, y+1, pressOut[2]);  }
	if(nNE != this.NE) {  tryAsMidiCornerTrigger(x+1, y+1, pressOut[3]);  }

	this.SW = nSW;
	this.SE	= nSE;
	this.NW = nNW;
	this.NE = nNE;
}

//---------------------------------------------------------------------------

PadState.prototype.toString = function() {
    return "x "+this.xPos+":: y "+this.yPos+":: pressure "+this.pressure;  };

//---------------------------------------------------------------------------

PadState.prototype.unlightPad = function() {
	var x = this.padXLoc;
	var y = this.padYLoc;

	setPadLEDFromXY(x, y, 0);
	setPadLEDFromXY(x+1, y, 0);
	setPadLEDFromXY(x, y+1, 0);
	setPadLEDFromXY(x+1, y+1, 0);
}

//---------------------------------------------------------------------------

PadState.prototype.lightPad = function() {
	var E = this.xPos;
	var W = 127 - this.xPos;
	var N = this.yPos;
	var S = 127 - this.yPos;

	var min = 20;
	var max = 90;

	var SW = ensureRange((S+W)-90, min, max);
	var SE = ensureRange((S+E)-90, min, max);
	var NW = ensureRange((N+W)-90, min, max);
	var NE = ensureRange((N+E)-90, min, max);

	var x = this.padXLoc;
	var y = this.padYLoc;

	setPadLEDFromXY(x, y, SW);
	setPadLEDFromXY(x+1, y, SE);
	setPadLEDFromXY(x, y+1, NW);
	setPadLEDFromXY(x+1, y+1, NE);
}


