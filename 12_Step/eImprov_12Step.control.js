loadAPI(1);

load("Constants.js")
load("MultiDeviceInterface.js")

var StepPortNames = ["12Step Port 1"];

host.defineController("eImprov", "KMI 12Step", "1.0", "FE086F1E-6173-11E5-9380-A8E688D887A8", "Seph Reed");
host.defineMidiPorts(1, 1); 
host.addDeviceNameBasedDiscoveryPair(StepPortNames, StepPortNames);

function init()  {
	octaveHandlerInit();
	host.getMidiInPort(0).setMidiCallback(onMidi);
	// host.getMidiInPort(0).setSysexCallback(onSysex);
	noteIn = host.getMidiInPort(0).createNoteInput("12Step", "82????", "92????");
	noteIn.setShouldConsumeEvents(false);
}



function onMidi(status, data1, data2) {
	println(data1+" "+data2);

	if(data2 > 0)  {
		if(data1 == OCT_UP_NOTE) {  modTrackOctave(0, 1);  }
		else if(data1 == OCT_DOWN_NOTE) {  modTrackOctave(0, -1);  }
	}
}








// function onSysex(data)
// {
// 	if (String(data) == "f07e00060300015f1e0000001e12000ff7")
// 	{	}
// }





