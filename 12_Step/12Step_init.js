host.defineController("Keith McMillen Instruments", "12Step", "1.0", "FE086F1E-6173-11E5-9380-A8E688D887A8", "Seph Reed");
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
	println("Woo");

}








function onSysex(data)
{
	if (String(data) == "f07e00060300015f1e0000001e12000ff7")
	{	}
}





