
var OctaveKey = "#Oct:";

var tracksPossible = 128;
var trackNames = initArray(0, tracksPossible);
var trackOctaveOffsets = initArray(3, tracksPossible);


function octaveHandlerInit()  {
	

	var trackBank = host.createTrackBank(tracksPossible, 0, 1);

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
            setTrackOctave(trackIndex, octave);
    	}
    };
}

function modTrackOctave(trackIndex, numOctaves)  {
    setTrackOctave(trackIndex, trackOctaveOffsets[trackIndex] + numOctaves);
}


function updateTrackTitleOctave(trackIndex, octave)  {
    var name = trackNames[trackIndex];
    var index = name.indexOf(OctaveKey);
    if(index != -1)  {
        var str = octave;
        if(octave <= 9) {  octave = "0"+octave; }

        // name.substr(index+OctaveKey.length, 2);
        // var octave = parseInt(splice);
        // println("Oct "+octave);
        // setTrackOctave(trackIndex, octave);
    }
}


function setTrackOctave(trackIndex, octave)  {
    octave = Math.max(octave, 0);
    octave = Math.min(octave, 10);
    trackOctaveOffsets[trackIndex] = octave;
}
 






