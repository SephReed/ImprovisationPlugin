

// var midiOutPerKey = initArray(-1, 25);
var deviceBank = initArray(null, SUPER_BANK_MAX_TRACKS);
var numKeys;
var octaveModulous;



function keysInit(i_numKeys)  {
	numKeys = i_numKeys;
	octaveModulous = numKeys - (numKeys % 12);  //(50 - (50 % 12 == 2)) = 48
	// MDI_registerButtons(numKeys, function(buttonNum) {
	// 	var midiOut = buttonNum < numKeys : buttonNum % octaveModulous;
	// 	return midiOut;
	// });
	MDI_initializeLiveBank();
	MDI_initializeRecordingFunctionality();
	MDI_initializeBitwigHaxFunctionality(noteIn);
	MDI_registerButtons(numKeys);


	for(var i = 0; i < 8; i++) {
		deviceBank[i] = MDI_liveBank[i].getTrack(i).createDeviceBank(1).getDevice(0);
	}
}


function onMidi(status, data1, data2) {
	


	if(status == STATUS_NOTE_OFF) {  
		status = STATUS_NOTE_ON;  
		data2 = 0;  
	}


	if(status == STATUS_NOTE_ON)  {	

		println(status+" "+data1+" "+data2);

		var buttonNum = data1 < numKeys ? data1 : data1 % octaveModulous;

		sendButtonHitToBitwig(buttonNum, data2);

		// var buttonNum = data1 < numKeys : data1 : 

		// if(midiOutPerKey[data1] == -1)  {
		// 	midiOut = data1 + (12*trackOctaveOffsets[MDI_seleced_track]);
		// 	midiOutPerKey[data1] = midiOut;
		// }

		// noteIn.sendRawMidiEvent(status, midiOutPerKey[data1], data2);
		// if(data2 == 0){
		// 	midiOutPerKey[data1] = -1;
		// }
	}
	else if(status == STATUS_PITCH_BEND){ 
		if(data2 != 64) { 
			deviceBank[MDI_seleced_track].getMacro(1).getAmount().set(data2, 127);  }
	}
	else if(status == STATUS_CC){  
		deviceBank[MDI_seleced_track].getMacro(0).getAmount().set(data2, 127);
	}
}







