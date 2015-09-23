/*A little bit wonky with it's updates, I'll have to figure out what I really want
hint: probably only loading from names on load and user input.  But that's hard to tell*/



load("MDI_Constants.js");

var trackNames = initArray(0, SUPER_BANK_MAX_TRACKS);
var trackOctaveOffsets = initArray(3, SUPER_BANK_MAX_TRACKS);
var MDIBank;


function octaveHandlerInit()  {
    

    MDIBank = host.createTrackBank(SUPER_BANK_MAX_TRACKS, 0, 1);

    for(var t = 0; t < SUPER_BANK_MAX_TRACKS; t++)  {
        var track = MDIBank.getTrack(t);

        track.addNameObserver(128, "not yet named", createNameObserver(t));
    }
}






function createNameObserver(trackIndex)  {
    return function(name)  {
        trackNames[trackIndex] = name;

        
        var index = name.indexOf(OCTAVE_TAG);
        if(index != -1)  {
            var splice = name.substr(index+OCTAVE_TAG.length, 2);
            if(splice.charAt(0) == '0') {  splice = splice.substr(1, 1); }
    
            var octave = parseInt(splice);
            setTrackOctave(trackIndex, octave);
        }
        else {
            trackOctaveOffsets[trackIndex] == 3;
            updateTrackTitleOctave(trackIndex);
        }   
    
    };
}

function modTrackOctave(trackIndex, numOctaves)  {
    setTrackOctave(trackIndex, trackOctaveOffsets[trackIndex] + numOctaves);
    updateTrackTitleOctave(trackIndex);
}


function updateTrackTitleOctave(trackIndex)  {
    var name = trackNames[trackIndex];
    var index = name.indexOf(OCTAVE_TAG);

    var octave = trackOctaveOffsets[trackIndex];
    var str = octave;
    if(octave <= 9) {  str = "0"+str; }

    if(index != -1)  {  name = name.replace( /(#Oct:\d+)/, OCTAVE_TAG+str);  }
    else {  name = name+"                "+OCTAVE_TAG+str;  }

    MDIBank.getTrack(trackIndex).setName(name);
}


function setTrackOctave(trackIndex, octave)  {
    octave = Math.max(octave, 0);
    octave = Math.min(octave, 10);
    trackOctaveOffsets[trackIndex] = octave;

    println("Track#"+ trackIndex+" set Oct: "+octave);
}
 






