loadAPI(1);

load("Shared/BitwigConstants.js")
load("Shared/MultiDeviceInterface.js")
load("Keys/Keys_init.js");

var KeyPortInNames = ["USB2.0-MIDI Port 1"];
var KeyPortOutNames = ["USB2.0-MIDI Port 1", "USB2.0-MIDI Port 2"];

host.defineController("eImprov", "eI Keys", "1.0", "970FAD3A-6183-11E5-9214-76513C701F13", "Seph Reed");
host.defineMidiPorts(1, 2); 
host.addDeviceNameBasedDiscoveryPair(KeyPortInNames, KeyPortOutNames);

function init()  {
	octaveHandlerInit();
	host.getMidiInPort(0).setMidiCallback(onMidi);
	// host.getMidiInPort(0).setSysexCallback(onSysex);
	noteIn = host.getMidiInPort(0).createNoteInput("eIKeys", "82????", "92????");
	noteIn.setShouldConsumeEvents(false);
	keysInit();
}


