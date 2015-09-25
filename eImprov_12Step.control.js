loadAPI(1);

load("12_Step/StepConstants.js")
load("12_Step/12Step_init.js")
load("Shared/BitwigConstants.js")
load("Shared/MultiDeviceInterface.js")

var StepPortNames = ["12Step Port 1"];

host.defineController("eImprov", "KMI 12Step", "1.0", "FE086F1E-6173-11E5-9380-A8E688D887A8", "Seph Reed");
host.defineMidiPorts(1, 1); 
host.addDeviceNameBasedDiscoveryPair(StepPortNames, StepPortNames);

function init()  {
	host.println(STEP_LOAD_MSG);
	octaveHandlerInit();
	host.getMidiInPort(0).setMidiCallback(onMidi);
	// host.getMidiInPort(0).setSysexCallback(onSysex);
	noteIn = host.getMidiInPort(0).createNoteInput("12Step", "82????", "92????");
	noteIn.setShouldConsumeEvents(false);
	stepInit();
}






// function onSysex(data)
// {
// 	if (String(data) == "f07e00060300015f1e0000001e12000ff7")
// 	{	}
// }





