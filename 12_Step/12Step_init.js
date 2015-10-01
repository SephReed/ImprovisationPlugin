

var trackSelectModeOn = false;
var deviceBank = initArray(null, SUPER_BANK_MAX_TRACKS);
var heldNums = initArray(false, 8);


function stepInit()  {
	for(var i = 0; i < SUPER_BANK_MAX_TRACKS; i++) {
		deviceBank[i] = MDIBank.getTrack(i).createDeviceBank(1).getDevice(0);
	}
}


function onMidi(status, data1, data2) {
	println(status+" "+data1+" "+data2);

	if(status == STATUS_NOTE_OFF) {  status = STATUS_NOTE_ON;   data2 = 0;  }

	if(status == STATUS_NOTE_ON)  {
		switch(data1)  {
			case OCT_UP_NOTE:  
				if(data2 > 0) { modTrackOctave(MDI_seleced_track, 1);  }  break;

			case OCT_DOWN_NOTE:  
				if(data2 > 0) { modTrackOctave(MDI_seleced_track, -1); }  break;

			case MODE_CHANGE:  
				if(data2 > 0) { trackSelectModeOn = !trackSelectModeOn; } break;


			default:
				for(var i = 0; i < NUM_BTNS.length; i++) {
					if (data1 == NUM_BTNS[i])  {
						if(trackSelectModeOn == true)  {  
							if(data2 > 0) { 
								MDIBank.getTrack(i+MDI_liveBankPosition).select();
								trackSelectModeOn = false;
						}	}
						else {  heldNums[i] = (data2 > 0);  }
						return;
				}	}
				
			
		}

	}
	else if(status == STATUS_AFTERTOUCH)  {
		if(trackSelectModeOn == false)  { 
			for(var i = 0; i < NUM_BTNS.length; i++) {
				if (data1 == NUM_BTNS[i])  {
					if(heldNums[i] == true) {  deviceBank[MDI_seleced_track].getMacro(i).getAmount().set(data2, 128);  }
					return;
		}	}	}
	}

}



