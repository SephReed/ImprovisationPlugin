host.defineController("Keith McMillen Instruments", "12Step", "1.0", "A323D780-5AF5-11E4-8ED6-0800200C9A66");
host.defineMidiPorts(1, 1); 
var 12StepPortNames 	= 	["12Step"];
host.addDeviceNameBasedDiscoveryPair(12StepPortNames, 12StepPortNames);

function init()  {
	host.getMidiInPort(0).setMidiCallback(onMidi);
	host.getMidiInPort(0).setSysexCallback(onSysex);
	noteIn = host.getMidiInPort(0).createNoteInput("12Step", "82????", "92????")
	noteIn.setShouldConsumeEvents(false);
}



function onMidi(status, data1, data2) {
	var isDrumRecChange = false;
	var isLowKeysRecChange = false;
	var isHighKeysRecChange = false;
	var isPadNote = false;



	if(isDrumRecChange)  {
		if(drumsRecord = REC_OFF) { 
			drumsRecord = REC_NEW;
			host.showPopupNotification("Drum Record New Loop");
		}
		else if(drumsRecord = REC_NEW) { 
			drumsRecord = REC_DUB;
			host.showPopupNotification("Drum Record Overdub Loop");
		}
		else if(drumsRecord = REC_DUB) { 
			drumsRecord = REC_OFF;
			host.showPopupNotification("Drum Record Disengaged");
		}
	}

	else if(isLowKeysRecChange)  {
		if(lowKeysRecord = REC_OFF) { 
			lowKeysRecord = REC_NEW;
			host.showPopupNotification("Low Keys Record New Loop");
		}
		else if(lowKeysRecord = REC_NEW) { 
			lowKeysRecord = REC_DUB;
			host.showPopupNotification("Low Keys Record Overdub Loop");
		}
		else if(lowKeysRecord = REC_DUB) { 
			lowKeysRecord = REC_OFF;
			host.showPopupNotification("Low Keys Record Disengaged");
		}
	}

	else if(isPadNote)  {
		//send note to pad
	}

}








function onSysex(data)
{
	if (String(data) == "f07e00060300015f1e0000001e12000ff7")
	{	}
}





