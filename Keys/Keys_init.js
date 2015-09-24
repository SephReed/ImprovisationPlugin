

var midiOutPerKey = initArray(-1, 25);
var deviceBank = initArray(null, SUPER_BANK_MAX_TRACKS);


function keysInit()  {
	for(var i = 0; i < SUPER_BANK_MAX_TRACKS; i++) {
		deviceBank[i] = MDIBank.getTrack(i).createDeviceBank(1).getDevice(0);
	}
}


function onMidi(status, data1, data2) {
	println(status+" "+data1+" "+data2);


	if(status == 128) {  
		status = 144;  
		data2 = 0;  
	}

	data1 = data1%25;


	if(status == 144)  {	
		if(midiOutPerKey[data1] == -1)  {
			midiOut = data1 + (12*trackOctaveOffsets[MDI_seleced_track]);
			midiOutPerKey[data1] = midiOut;
		}


		noteIn.sendRawMidiEvent(144, midiOutPerKey[data1], data2);
		if(data2 == 0){
			midiOutPerKey[data1] = -1;
		}
	}
	else if(status == 224){ 
		if(data2 != 64) { 
			deviceBank[MDI_seleced_track].getMacro(1).getAmount().set(data2, 127);  }
		// noteIn.sendRawMidiEvent(status, midiOutPerKey[data1], data2);  
	}
	else if(status == 176){  
		deviceBank[MDI_seleced_track].getMacro(0).getAmount().set(data2, 127);
	}
}