/******************************
*      TAG CONSTANTS
******************************/
var OCTAVE_TAG = "#Oct:";
var PAGE_TAG = "#Page:";
var LIVE_BANK_POS_TAG = "#LPos:";
var NOT_YET_NAMED = "NYN";


/******************************
*      PAGE CONSTANTS
******************************/
var DRUM_PAGE = "DRM";
var CLIP_PAGE = "CLP";
var CONDUCTOR_PAGE = "CON";


/******************************
*      LIVE BANK CONSTANTS
******************************/
var LIVE_BANK_HEIGHT = 8;
var LIVE_BANK_WIDTH = 5;
var LIVE_BANK_TOTAL_SCENES = LIVE_BANK_HEIGHT * LIVE_BANK_WIDTH;
var MAX_MODABLE_SENDS = 9;
var MAX_MODABLE_MACROS = 8;
var MAX_DEVICES = 1;



/******************************
*      BITWIG CONSTANTS
******************************/
var SUPER_BANK_MAX_TRACKS = 64;







function RecordingStatus(){
	this.queuedTrack = -1;
	this.queuedScene = -1;
   	this.recTrack = -1;
   	this.recScene = -1;   
	this.nextTrack = -1;  }










