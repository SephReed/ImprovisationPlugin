/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	QuneoConstants.js: This file is just a holding place for all the constants
+     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/



/******************************
*     LOADING MESSAGE
******************************/
var QUNEO_LOAD_MSG = 
	"\n***~-~-~-~-~-~-~-[Initializing Quneo]-~-~-~-~-~-~-~***\n"
+	"eImprov for QUNEO and Bitwig.\n"
+	"   by Thumbz aka Seph Reed.\n\n"
+	"\"Peace is the acceptance of mutually assured destruction,\n"
+	"   and the respect of a worthy opponent.\"\n"
+	"***~-~-~-~-~-~-~-[Enjoy]-~-~-~-~-~-~-~***\n";


/******************************
*     THRESHOLD CONSTANTS
******************************/
var PAD_CORNER_WIDTH = 50;
var THRESH_PAD_MIN = PAD_CORNER_WIDTH;
var THRESH_PAD_MAX = 127 - PAD_CORNER_WIDTH;








/******************************
*      NOTE CONSTANTS
******************************/
var BOTTOM_PAD_NOTE = 0;
var TOP_PAD_NOTE_LIMIT = 16;
	//
var VERT_ARROW_1_DOWN = 70;
var VERT_ARROW_1_UP = VERT_ARROW_1_DOWN + 1;
	//
var VERT_ARROW_2_DOWN = 72;
var VERT_ARROW_2_UP = VERT_ARROW_2_DOWN + 1;
	//
var DARTH_NOSE_BUTTON = 74;

var LEFT_ROTARY = 75;
var RIGHT_ROTARY = 76;

var HOR_ARROW_1_LEFT = 77;
var HOR_ARROW_1_RIGHT = HOR_ARROW_1_LEFT + 1;

var HOR_ARROW_2_LEFT = 79;
var HOR_ARROW_2_RIGHT = HOR_ARROW_2_LEFT + 1;

var HOR_ARROW_3_LEFT = 81;
var HOR_ARROW_3_RIGHT = HOR_ARROW_3_LEFT + 1;

var HOR_ARROW_4_LEFT = 83;
var HOR_ARROW_4_RIGHT = HOR_ARROW_4_LEFT + 1;

var DIAMOND_BTN = 85;
var SQUARE_BTN = 86;
var TRIANGLE_BTN = 87;


var VERT_VU_1 = 0;
var VERT_VU_2 = 1;
var VERT_VU_3 = 2;
var VERT_VU_4 = 3;

var HOR_VU_1 = 4;
var HOR_VU_2 = 5;
var HOR_VU_3 = 6;
var HOR_VU_4 = 7;




/******************************
*      COLOR CONSTANTS
******************************/
var OFF = 0;
var RED = 127;
var ORANGE = 60;
var YELLOW = 47;
var GREEN = 44;
var LIGHT_GREEN = 5;





/******************************
*      REC CONSTANTS
******************************/
var RECORDING_CLOSED = "rec closed";
var RECORDING_QUEUED = "rec queued";
var RECORDING_RETRY = "rec retry";
var RECORDING_NOW = "rec now";
var RECORDING_OFF = "rec off";




/******************************
*      SOLO CONSTANTS
******************************/
var SOLO_ON = "solo on";
var SOLO_OFF = "solo off";
var SOLO_HELD_ON = "solo held on";
var SOLO_HELD_OFF = "solo held off";




/************************************
*      TOGGLEABLE BUTTON CONSTANTS
*************************************/
var TGL_BTN_SOLO = "toggle button solo";
var TGL_BTN_MUTE = "toggle button mute";
var TGL_ON = "btn on";
var TGL_OFF = "btn off";
var TGL_HELD_ON = "btn held on";
var TGL_HELD_OFF = "btn held off";




/******************************
*      ALT BUTTON CONSTANTS
******************************/
var BTN_HELD = "btn held";
var BTN_ALT_MODE = "btn alt mode";
var BTN_RELEASED = "btn released";








