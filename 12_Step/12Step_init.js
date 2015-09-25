

var trackSelectModeOn = false;
var deviceBank = initArray(null, SUPER_BANK_MAX_TRACKS);


function stepInit()  {
	for(var i = 0; i < SUPER_BANK_MAX_TRACKS; i++) {
		deviceBank[i] = MDIBank.getTrack(i).createDeviceBank(1).getDevice(0);
	}
}


function onMidi(status, data1, data2) {
	println(data1+" "+data2);

	if(status == STATUS_NOTE_ON && data2 > 0)  {
		switch(data1)  {
			case OCT_UP_NOTE:  
				modTrackOctave(MDI_seleced_track, 1);  break;

			case OCT_DOWN_NOTE:  
				modTrackOctave(MDI_seleced_track, -1);  break;

			case MODE_CHANGE:  
				trackSelectModeOn = !trackSelectModeOn;  break;


			default:
				if(trackSelectModeOn == true)  { 
					for(var i = 0; i < NUM_BTNS.length; i++) {
						if (data1 == NUM_BTNS[i])  {
							MDIBank.getTrack(i).select();  
							return;
				}	}	}
			}
		}
	}
	else if(status == STATUS_AFTERTOUCH)  {
		if(trackSelectModeOn == false)  { 
			for(var i = 0; i < NUM_BTNS.length; i++) {
				if (data1 == NUM_BTNS[i])  {
					deviceBank[MDI_seleced_track].getMacro(i).getAmount().set(data2, 127); 
					return;
		}	}	}
	}

}



