/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+	
+	This plugin is built to allow the user to record and layer musical thoughts quickly and effectively.
+	For support: ShadyWillowCreek@gmail.com
+		
+		please note: anything *starred* in comments can be searched for (minus stars) to find 
+		other comments which relate
+	     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/



/******************************
*      MAX LIMIT CONSTANTS:
******************************/
// var LIVE_BANK_HEIGHT = 128;
// var LIVE_BANK_HEIGHT = 8;

// var MAX_SCENES = 5;



/******************************
*     DEPENDENCIES:
******************************/
loadAPI(1);
load("Shared/MultiDeviceInterface.js")
load("Shared/BitwigConstants.js")
load("Quneo/QUNEO_init.js")

/******************************
*     QUNEO HOST DEFINITION:
******************************/
var quneoPortNames = ["QUNEO"];
var QUNEONoteIn;

host.defineController("eImprov", "KMI QUNEO", "1.0", "A323D780-5AF5-11E4-8ED6-0800200C9A66", "Seph Reed");
host.defineMidiPorts(1, 1); 
host.addDeviceNameBasedDiscoveryPair(quneoPortNames, quneoPortNames);






/**************************************
*    SHARED VARIABLES: (just QUNEO now)
**************************************/
var currentlyPlaying = false;
var beatPosition = 0;
var application = null;
// var TRACK_BANKS = [];
// var allSeeingTrackBank;
// var TRACK_DEVICE_CURSORS = [];



/******************************
*           MAIN:
******************************/
function init() {
   //initialize all *shared variables*
	application = host.createApplication();

	transport = host.createTransport();

	MDI_initializeLiveBank();
	MDI_initializeRecordingFunctionality();
	// for(var i = 0; i < LIVE_BANK_HEIGHT; i++) {
	// 	TRACK_BANKS[i] = host.createTrackBank(LIVE_BANK_HEIGHT, MAX_MODABLE_SENDS, MAX_SCENES);
	// 	for(var i_s = 0; i_s < i; i_s++) 
	// 	{	TRACK_BANKS[i].scrollScenesDown();  }
	// }

   //add observers for updating *shared variables*
	transport.getTempo().addValueObserver(777, function(i_tempo){
		tempo = i_tempo;  });

	transport.addIsPlayingObserver(function(value)  {
		pageAutoSwitch.status = RECORDING_OFF;
		pageAutoSwitch.nextTrack = -1;
    	currentlyPlaying = value;  });

	transport.getPosition().addRawValueObserver(function(newPos)  {
		beatPosition = newPos;  
		updateQuneoToBeatTime();  
	});  //*quneo beat time*

   //quneo specific initialization
	quneoInit();
}








// STARRED:  If you searched for this, you get ten points.