




function tryAsConductorCornerTrigger(x, y, velocity)  {
	if(currentPage != CONDUCTOR_PAGE) {  return false;  }

	if(y >= 4)  {
		var trackNum = Math.floor(x/2);
		if(y <= 5) { trackNum += 4; }

		println(trackNum);

		if(y == 4 || y == 6)  {
			var sceneNum = x%2;
			hitClip(trackNum, sceneNum);  }
		
		else  {
			if(x%2 == 0) {  trackSolos[trackNum].setHeld(velocity > 0);  }
			else  {  trackMutes[trackNum].setHeld(velocity > 0);  }  //mute track
}	}	}

//---------------------------------------------------------------------------

function tryAsConductorPadPosData(padNum, vertex, position)  {
	if(currentPage != CONDUCTOR_PAGE) {  return false;  }

	if(padNum < 8) {
		var trackNum = 1-Math.floor(padNum/4);
		trackNum *= 4;
		trackNum += padNum%4;

		if(vertex == "x" || vertex == "y")  {
			var macroNum = 0;
			if(vertex == "y")  { macroNum = 1; }
			deviceBanks[trackNum].getDevice(0).getMacro(macroNum).getAmount().set(position, 127);
		}

		padStates[padNum].lightPad();
	}

	return true;
}

//---------------------------------------------------------------------------

function showConductorPage()  {
	for(var i = 0; i < MAX_TRACKS; i++)  {
		var index = MAX_MODABLE_MACROS * i;
		padStates[i].setXPos(trackMacros[index]);
		padStates[i].setYPos(trackMacros[index+1]);
		padStates[i].lightPad();

		conductorUpdateSoloLED(i);
		conductorUpdateMuteLED(i);
}	}

//---------------------------------------------------------------------------

function conductorPageUpdateVU(trackNum)  {
	if(currentPage != CONDUCTOR_PAGE) {  return false;  }

	var index = Math.floor(trackNum / 4) * 16;
	index += (trackNum%4) * 2;
	index++;

	var out = getRangedVU(trackNum);
	setPadLED(index, out);

	return true;
}

//---------------------------------------------------------------------------

function conductorUpdateSoloLED(trackNum)  {
	var x = (trackNum %4) * 2;

	var y = 7;
	if (trackNum >= 4) {  y = 5; }

	var color = LIGHT_GREEN;
	if(trackSolos[trackNum].status == true) {  color = YELLOW;  }

	setPadLEDFromXY(x, y, color);
}

//---------------------------------------------------------------------------

function conductorUpdateMuteLED(trackNum)  {
	var x = (trackNum %4) * 2;
	x++;

	var y = 7;
	if (trackNum >= 4) {  y = 5; }

	var color = LIGHT_GREEN;
	if(trackMutes[trackNum].status == true) {  color = ORANGE;  }

	setPadLEDFromXY(x, y, color);
}








