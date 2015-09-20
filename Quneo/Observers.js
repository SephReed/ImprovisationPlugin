var widthScenes = 5;
var numScenes = widthScenes * 8;

var IS_RECORDING = initArray(0, numScenes);
var HAS_CONTENT = initArray(0, numScenes);
var IS_QEUED = initArray(0, numScenes);
var IS_PLAYING = initArray(0, numScenes);