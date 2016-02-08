/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	Flair.js:  This is just a simple little bit of code that plays an animation when the program
+		loads for flair.
+     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/




// 1 black, 2 dark, 3 med, 4 light, 0 white
var lightAmountsForThumbzSymbol = [ 0, 127, 80, 40, 20 ];
var thumbzSymbol = [ 
	0, 0, 0, 0, 0, 0, 0, 0,  //empty page
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,

	0, 0, 0, 2, 2, 0, 0, 0,  //begin symbol
	0, 0, 4, 1, 1, 4, 0, 0,
	0, 0, 2, 3, 3, 2, 0, 0,
	0, 0, 1, 4, 4, 1, 0, 0, 
	0, 4, 1, 1, 1, 1, 4, 0,
	3, 1, 2, 4, 4, 2, 1, 3,
	1, 2, 4, 0, 0, 4, 2, 1,
		//
	3, 1, 0, 0, 0, 0, 1, 3,  //centerline
		//
	1, 2, 4, 0, 0, 4, 2, 1,
	3, 1, 2, 4, 4, 2, 1, 3,
	0, 4, 1, 1, 1, 1, 4, 0,
	0, 0, 1, 4, 4, 1, 0, 0,
	0, 0, 2, 3, 3, 2, 0, 0,
	0, 0, 4, 1, 1, 4, 0, 0,
	0, 0, 0, 2, 2, 0, 0, 0,  //end symbol

	0, 0, 0, 0, 0, 0, 0, 0,  //empty page
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 
]






//this scrolls through the image above 
function animateThumbzSymbol()  {
	var numLines = thumbzSymbol.length / 8;

	for(var i = 0; i <= numLines - 8; i++)  {
		var offset = i * 8;
		for(var c = 0; c < 64; c++)  {
			var out = lightAmountsForThumbzSymbol[thumbzSymbol[offset+c]];
			setPadGreenLED(c, out);
			setPadRedLED(c, Math.max(0, out - 30));
		}
		countMississippi(5000);
	}
}


//no timer functions are available, so I made something that eats time
function countMississippi(count)  {
	var notSoFast;
	for(var i = 0; i < count; i++)  {
		notSoFast += i + " mississippi, ";  }
}








