/*A little bit wonky with it's updates, I'll have to figure out what I really want
hint: probably only loading from names on load and user input.  But that's hard to tell*/




var OctaveKey = "#Oct:";

var tracksPossible = 128;
var trackNames = initArray(0, tracksPossible);
var trackOctaveOffsets = initArray(-1, tracksPossible);
var MDIBank;


function octaveHandlerInit()  {
    

    MDIBank = host.createTrackBank(tracksPossible, 0, 1);

    for(var t = 0; t < tracksPossible; t++)  {
        var track = MDIBank.getTrack(t);

        track.addNameObserver(128, "not yet named", createNameObserver(t));
    }
}






function createNameObserver(trackIndex)  {
    return function(name)  {
        trackNames[trackIndex] = name;

        
        var index = name.indexOf(OctaveKey);
        if(index != -1)  {
            var splice = name.substr(index+OctaveKey.length, 2);
            if(splice.charAt(0) == '0') {  splice = splice.substr(1, 1); }
        
            println("splice "+splice);
            var octave = parseInt(splice);
            println("Oct "+octave);
            setTrackOctave(trackIndex, octave);
        }
        else {
            trackOctaveOffsets[trackIndex] == 3;
            updateTrackTitleOctave(trackIndex);
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
    if(octave <= 9) {  str = "0"+str; }

    if(index != -1)  {  name = name.replace( /(#Oct:\d+)/, OctaveKey+str);  }
    else {  name = name+"                "+OctaveKey+str;  }

    MDIBank.getTrack(trackIndex).setName(name);
}


function setTrackOctave(trackIndex, octave)  {
    println("NewOctIn "+octave);
    octave = Math.max(octave, 0);
    octave = Math.min(octave, 10);
    trackOctaveOffsets[trackIndex] = octave;

    println("NewOctOut "+octave);
}
 
