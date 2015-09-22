/*


A little bit wonky with it's updates, I'll have to figure out what I really want
hint: probably only loading from names on load and user input.  But that's hard to tell*/

DEPRECIATED


var OctaveKey = "#Oct:";

var tracksPossible = 128;
var trackNames = initArray(0, tracksPossible);
var trackOctaveOffsets = initArray(3, tracksPossible);
var trackBank;


function octaveHandlerInit()  {
	

	trackBank = host.createTrackBank(tracksPossible, 0, 1);

	for(var t = 0; t < tracksPossible; t++)  {
		var track = trackBank.getTrack(t);

		track.addNameObserver(128, "no controller", createNameObserver(t));
	}
}






function createNameObserver(trackIndex)  {
    return function(name)  {
        trackNames[trackIndex] = name;
    	var index = name.indexOf(OctaveKey);
    	if(index != -1)  {
            var splice = name.substr(index+OctaveKey.length, 2);
    		var octave = parseInt(splice);
    		println("Oct "+octave);
            if(trackOctaveOffsets[trackIndex] != octave) { setTrackOctave(trackIndex, octave);  }
    	}
    };
}

function modTrackOctave(trackIndex, numOctaves)  {
    println("ModOct "+numOctaves);
    setTrackOctave(trackIndex, trackOctaveOffsets[trackIndex] + numOctaves);
    updateTrackTitleOctave(trackIndex);
}


function updateTrackTitleOctave(trackIndex)  {
    var name = trackNames[trackIndex];
    var index = name.indexOf(OctaveKey);

    var octave = trackOctaveOffsets[trackIndex];
    var str = octave;
    if(octave <= 9) {  octave = "0"+octave; }

    if(index != -1)  {  name = name.replace( /(#Oct:\d+)/, OctaveKey+str);  }
    else {  name = name+OctaveKey+str;  }

    trackBank.getTrack(trackIndex).setName(name);
}


function setTrackOctave(trackIndex, octave)  {
    octave = Math.max(octave, 0);
    octave = Math.min(octave, 10);
    trackOctaveOffsets[trackIndex] = octave;

    println("NewOct "+octave);
}
 






