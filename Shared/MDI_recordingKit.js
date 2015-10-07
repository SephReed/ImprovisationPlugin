



var recStatus = new RecordingStatus();
var HAS_CONTENT = initArray(0, LIVE_BANK_TOTAL_SCENES);
// var HAS_REC_QUEUED = initArray(0, LIVE_BANK_TOTAL_SCENES);
var liveTrackArms = initArray(0, LIVE_BANK_HEIGHT);
var numTracksArmed = 0;

function MDI_initializeRecordingFunctionality() {
    for (var t = 0; t < LIVE_BANK_HEIGHT; t++)
    {
        var track = MDI_liveBank[t].getTrack(t);
        // track.getArm().addValueObserver(createArmObserver(t));
        // track.addIsSelectedInEditorObserver(MDI_createSelectObserver(t));

        var clipLauncher = track.getClipLauncher();
        clipLauncher.addHasContentObserver(MDI_createHasContentObserver(t, HAS_CONTENT));
        clipLauncher.addIsRecordingQueuedObserver(MDI_createRecordingQueuedObserver(t));
        clipLauncher.addIsRecordingObserver(MDI_createRecordingObserver(t));
    }
}







function MDI_hitLeftRecButton() {
    if(recStatus.recTrack == -1)  {
        createRecordingForCurrentLiveTrack();
    }
    else if(recStatus.recTrack == MDI_focusedLiveTrack) {
        var track = recStatus.recTrack;
        var scene = recStatus.recScene;
        removeLiveClip(recStatus.recTrack, recStatus.recScene);
        MDI_hitLiveBankClip(track, scene);
    }
    else if(recStatus.recTrack != MDI_focusedLiveTrack) {
        println("ERR: MDI_REC KIT ~36.  Recording on unfocused track");
    }
}

function MDI_hitRightRecButton() {
    if(recStatus.recTrack == -1)  {
        // createRecordingForCurrentLiveTrack();
        scrollPage();
    }
    else if(recStatus.recTrack == MDI_focusedLiveTrack) {
        MDI_hitLiveBankClip(recStatus.recTrack, recStatus.recScene);
        if(recStatus.nextTrack != -1)  {
            createRecordingForLiveTrack(recStatus.nextTrack);
            recStatus.nextTrack = -1;
        }
    }
}


function removeLiveClip(trackNum, sceneNum)  {
  MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().select(sceneNum);
  APPLICATION.remove(); 
  // MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().createEmptyClip(sceneNum, 0);
  var clipIndex = (trackNum*LIVE_BANK_WIDTH)+sceneNum;  
  HAS_CONTENT[clipIndex] = false;  
}







function MDI_createSelectObserver(track)  {
    return function(value)  {
        println("track #"+track+" selected = "+value);
        if(value == true) {
            MDI_focusedLiveTrack = track;  
        // showTracknum(track);
      }
}   }

function MDI_createHasContentObserver(track, statusBank)  {
    return function(scene, statusEngaged)  {
        var index = (track*LIVE_BANK_WIDTH)+scene;
        statusBank[index] = statusEngaged;
        // updateClipLED(index);
}   }

function MDI_createRecordingQueuedObserver(track)  {
    return function(scene, statusEngaged)  {
        if(statusEngaged == true)  {
            if(recStatus.queuedTrack != -1 && recStatus.queuedTrack != track)  {  println("ERR: multiple tracks queued");  }

            println("Queue Rec on: "+track+" sc "+scene);
            recStatus.queuedTrack = track;
            recStatus.queuedScene = scene;
        }
        else if(recStatus.queuedTrack == track && recStatus.queuedScene == scene){
            println("Queue Rec off: "+track+" sc "+scene);
            recStatus.queuedTrack = -1;
            recStatus.queuedScene = -1;
        }
}   }

function MDI_createRecordingObserver(track)  {
    return function(scene, statusEngaged)  {
        if(statusEngaged == true)  {
            if(recStatus.recTrack != -1 && recStatus.recTrack != track)  {  println("ERR: multiple tracks recording");  }

            println("Record on: "+track+" sc "+scene);
            recStatus.recTrack = track;
            recStatus.recScene = scene;
        }
        else if(recStatus.recTrack == track && recStatus.recScene == scene){
            println("Record off: "+track+" sc "+scene);
            recStatus.recTrack = -1;
            recStatus.recScene = -1;
        }

}   }


//is track armed
function createArmObserver(track)  {
    return function(value)  {
        println("arm for track "+track+" = "+value);
        var previouslyMultiArmed = numTracksArmed > 1;

        liveTrackArms[track] = value;

        numTracksArmed = 0;
        for(var i = 0; i < liveTrackArms.length; i++) {
            if(liveTrackArms[i] == true)  {  
                numTracksArmed++;  }
        }

        println("FIX RELEASE STALLED NOTES!!!!!!! MDI:93");
        //

        var nowSingularlyArmed = numTracksArmed == 1; 
        if(nowSingularlyArmed)  {
            // MDI_focusedLiveTrack = track;
            // println("Set focus "+track);
            if(previouslyMultiArmed){}
        }
            // tryReleasingStalledPadNotes();  }
        // if(currentPage == CLIP_PAGE)  {  setTrackMuteLED(track, value);  }
}   }


function MDI_hitLiveBankClip(trackNum, sceneNum) {
    var index = (trackNum*LIVE_BANK_WIDTH)+sceneNum;
     //record clip
    if(HAS_CONTENT[index] == false)  {
        MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().record(sceneNum);


    }
    else  {  MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().launch(sceneNum);  }
}



//---------------------------------------------------------------------------

//arming is not done by selecting a track
function armSingleLiveTrack(trackNum)  {
  if(numTracksArmed == 1 && liveTrackArms[trackNum] == true){  return;  }

  if(liveTrackArms[trackNum] != true)  {
    MDI_liveBank[trackNum].getTrack(trackNum).getArm().set(true);  }
  for(var t = 0; t < LIVE_BANK_HEIGHT; t++)  {
    println("track check for "+t);
    println("track check for "+t+"!="+trackNum+" && "+liveTrackArms[t]);
    if(t != trackNum && liveTrackArms[t] == true) 
    { MDI_liveBank[t].getTrack(t).getArm().set(false);  }
} }

//---------------------------------------------------------------------------

//just a one liner
function createRecordingForCurrentLiveTrack()  {
  createRecordingForLiveTrack(MDI_focusedLiveTrack);  }

//---------------------------------------------------------------------------

//iterates through all the visible clips in a bank and start's a recording
//on the first empty one
function createRecordingForLiveTrack(trackNum)  {
  var offset = trackNum * LIVE_BANK_WIDTH;
  for(var sc = 0; sc < LIVE_BANK_WIDTH; sc++)  {
    if(HAS_CONTENT[offset + sc] == false) {
      MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().record(sc);
      // hitClip(trackNum, sc);
      return;  }
} }


