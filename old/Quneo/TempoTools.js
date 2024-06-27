/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	TempoTools.js:  this is some old code I had been using to see if I liked the sound of perfect ratio
+		tempo changes.  I do, but it definitely needs some work.  Also, I imagine the average user
+		would rather the additive form of tempo increase/decrease.
+
+	Depreciated... and messy.
+	     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/



var TEMPO_LIST = [];
var currentTempoNote = -1;
var tempoFloor = 40; //bpm
var tempoCeiling = 220; //bpm


var tempo = 0;


function initTempoList()  {
	// TEMPO_LIST.push(110);
	// TEMPO_LIST.push(130);
	// currentTempoNote = 0;

	var oxygenResonance = 4.639 * Math.pow(10, 13); //4.639 E13 hz
	// var fiveLimitScale 	= 	[1/1, 9/8, 4/3, 3/2, 16/9];
	var fiveLimitScale = [1/1, 9/8, 5/4, 4/3, 3/2, 5/3, 16/9, 15/8];
	var tempoStartNear = 110;

	//find the base tempo by halving the desired frequency and converting to bpm until below the range of normal musical tempos
	var baseTempo = -1;
	for(var halves = 0; baseTempo == -1; halves++)  {
		var freq = oxygenResonance * Math.pow(0.5, halves);
		var bpm = freq * 60;
		
		if(bpm < tempoFloor)  {
			baseTempo = bpm;  
			host.println("baseTempo "+baseTempo);
		}
	}

	var limitReached = false;
	var lastBpm = baseTempo;
	while(limitReached == false)  {
		lastBpm *= 33/32;

		if(lastBpm > tempoFloor)  {
			TEMPO_LIST.push(lastBpm);  }
		
		if(lastBpm > tempoCeiling) {
			limitReached = true;  }
	}

	// //move upwards through octaves and simple ratios creating a scale of resonant tempos
	// var limitReached = false;
	// for(var octave = 0; limitReached != true; octave++)  {
	// 	var octaveRootBpm = baseTempo * Math.pow(2, octave);

	// 	for(var iR = 0; iR < fiveLimitScale.length; iR++)  {
	// 		var bpm = octaveRootBpm * fiveLimitScale[iR];
	// 		if(bpm > tempoFloor)  {
	// 			if(bpm < tempoCeiling)  {
	// 				TEMPO_LIST.push(bpm);  }
	// 			else { limitReached = true;  }
	// 		}
	// 	}
	// }

	//choose a tempo note just below 110
	// for(var iT = TEMPO_LIST.length - 1; iT >= 0 && currentTempoNote == -1; iT--)  {
	// 	if(TEMPO_LIST[iT] < tempoStartNear)  {
	// 		currentTempoNote = iT;  }
	// }
}