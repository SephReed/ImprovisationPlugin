/*A little bit wonky with it's updates, I'll have to figure out what I really want
hint: probably only loading from names on load and user input.  But that's hard to tell*/



load("MDI_Constants.js");

var currentPage;

var masterName = null;
var trackNames = initArray(0, SUPER_BANK_MAX_TRACKS);
var trackOctaveOffsets = initArray(3, SUPER_BANK_MAX_TRACKS);

var MDI_seleced_track = 0;
var MDIBank;
var MDI_master_track;
var onPageChange = null;


function octaveHandlerInit()  {
    

    MDIBank = host.createTrackBank(SUPER_BANK_MAX_TRACKS, 0, 1);

    for(var t = 0; t < SUPER_BANK_MAX_TRACKS; t++)  {
        var track = MDIBank.getTrack(t);

        track.addNameObserver(256, NOT_YET_NAMED, createNameObserver(t));
        track.addIsSelectedInEditorObserver(createSelectObserver(t));
    }

    MDI_master_track = host.createMasterTrack(0);
    MDI_master_track.addNameObserver(256, NOT_YET_NAMED, createMasterNameObserver());
}


function MDI_addPageObserver(i_onPageChange) {
    onPageChange = i_onPageChange;
}





function createNameObserver(trackIndex)  {
    return function(name)  {
        if(name == NOT_YET_NAMED)  { return; }

        trackNames[trackIndex] = name;

        
        var index = name.indexOf(OCTAVE_TAG);
        // println("index of tag "+OCTAVE_TAG+" in "+name+": "+index);
        if(index != -1)  {
            var splice = name.substr(index+OCTAVE_TAG.length, 2);
            if(splice.charAt(0) == '0') {  splice = splice.substr(1, 1); }
    
            var octave = parseInt(splice);
            if(octave != trackOctaveOffsets[trackIndex]) {
                println("Loading Track#"+trackIndex+" Octave from: "+name);
                setTrackOctave(trackIndex, octave);  }
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

    if(index != -1)  {  name = name.replace( /(#Oct:\d{2})/, OCTAVE_TAG+str);  }
    else {  name = name+"                "+OCTAVE_TAG+str;  }

    println("Update Track Name: "+name);
    MDIBank.getTrack(trackIndex).setName(name);
}


function setTrackOctave(trackIndex, octave)  {
    octave = Math.max(octave, 0);
    octave = Math.min(octave, 10);
    trackOctaveOffsets[trackIndex] = octave;

    println("Track#"+ trackIndex+" set Oct: "+octave);
}
 












function createSelectObserver(track)  {
    return function(value)  {
        if(value == true) {
            MDI_seleced_track = track;  
}   }   }


function createMasterNameObserver()  {
    return function(name)  {
        if(name == NOT_YET_NAMED) { return; }

        masterName = name;

        var index = name.indexOf(PAGE_TAG);
        if(index != -1)  {
            var splice = name.substr(index+PAGE_TAG.length, 3);
            if(splice != currentPage)  {
                if(splice == DRUM_PAGE 
                    || splice == CLIP_PAGE
                    || splice == CONDUCTOR_PAGE  ) 
                {  
                    currentPage = splice;
                    if(onPageChange != null) {  onPageChange(currentPage);  }
                }      
                else { MDI_setPage(CLIP_PAGE);  }
        }   }
}   }

function MDI_setPage(i_page)  {
    if(currentPage == i_page) { return; }

    currentPage = i_page;
    if(onPageChange != null) {  onPageChange(currentPage);  }
    updateMasterTitlePage();
}


function updateMasterTitlePage()  {
    if(masterName != null)  {
        name = masterName;
        var index = name.indexOf(PAGE_TAG);
        if(index != -1)  {  name = name.replace( /(#Page:[A-Z]{3})/, PAGE_TAG+currentPage);  }
        else {  name = name+PAGE_TAG+currentPage;  }

        println("Update Master Name: "+name);
        MDI_master_track.setName(name);
    }
}





