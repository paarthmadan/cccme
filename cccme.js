const errors = require('./errors.js');
const request = require('request');
const https = require('https');
const bl = require('bl');
const path = require('path');
let fs = require('fs');
let PDFParser = require('pdf2json');
let pdfreader = require('pdfreader');

const args = process.argv;
const base_url = "https://www.cemc.uwaterloo.ca/contests/computing/";
var size = 5;
let pdfParser = new PDFParser();


// pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
// pdfParser.on("pdfParser_dataReady", pdfData => {
//     fs.writeFile("./pdf/test.json", JSON.stringify(pdfData, null, 2));
// });

//ERROR HANDLING
if(args.length != 6 || errors.checkData(args) != 200){
	console.log("Error: Incorrect Input \n" + errors.message);
	process.exit();
}

//Capitalize Problem Input
args[2] = args[2].toUpperCase();
args[3] = args[3].toUpperCase();
args[4] = parseInt(args[4]);
args[5] = parseInt(args[5]);

var pdfCount = 0;
var parseCount = 0;

var problemSet, yearsSet;
var rangeSet = [];

var rows = {}; // indexed by y-position
 
function printRanges(){
	console.log(problemSet);
	console.log(yearsSet);
	console.log(rangeSet);
}


function checkForProblem(index) {
	var returnValue = false;	
  Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    .forEach((y) => {
    	var character = ((index > 5) ? "S" : "J");
    	var number = ((index > 5) ? (index - 5) : index);
    	if((rows[y] || []).join('').indexOf("Problem" + character + number) > -1){
    		console.log((rows[y] || []).join(''));
    		returnValue = true;
    	}
    });
    return returnValue;
}

function createPDFReader(index, file){
	parseCount++;
	var startPage, endPage;
	// console.log(problemSet[index - 1]);
	new pdfreader.PdfReader().parseFileItems("./pdf/" + file, function(err, item){
	  if(!item){
	  	if(!endPage){
	  		endPage = -1;
	  	}
	  	rangeSet[index - 1] = [startPage, endPage];
	  	parseCount--;
	  	console.log(parseCount);
	  	if(parseCount == 0){
	  		printRanges();
	  	}
	  	rows = {};
	  }else if (item.page) {
	  	//scapes starting page
	    if(checkForProblem(problemSet[index - 1])){
	    	// console.log('START PAGE:', item.page - 1);
	    	startPage = item.page - 1;
	    }
	    //scrapes ending page
	    if(checkForProblem(problemSet[index - 1] + 1)){
	    	// console.log('END PAGE:', item.page - 1);
	    	endPage = item.page - 1;
	    }
	    rows = {};
	  }else if (item.text) {
	    (rows[item.y] = rows[item.y] || []).push(item.text);
	  }
	});	
}


function findRangesForPDF(){
	fs.readdir("./pdf", function(err, files){
		files.forEach(function(file, index){
			if(path.extname(file) == ".pdf"){
				var currentPage;
				// console.log(index);
				createPDFReader(index, file);
			}
		});
	});
}

function fetchPDF (url){
	var localCount = pdfCount + 1;
	pdfCount++;

	var file = fs.createWriteStream("./pdf/test" + localCount + ".pdf");
	// console.log(url);
	https.get(url, function (response) {
		response.on("error", () =>{
			console.log("Error");
		})
		response.pipe(file);
		response.on("end", () => {
			pdfCount--;
			if(pdfCount == 0){
				// console.log("Fetched All Files");
				findRangesForPDF();
			}		
		})
     });
}

function randomizeProblems (args, callback){ 
	var problem_sets = [];
	var years = [];
	var min = ((args[2].charAt(0) == "J") ? 0 : 5) + parseInt(args[2].charAt(1));
	var max = ((args[3].charAt(0) == "J") ? 0 : 5) + parseInt(args[3].charAt(1));
	var min_year = args[4];
	var max_year = args[5];
	for (var i = 0; i < Math.min(size, ((max - min) + 1)); i++) {
		var problem_random = parseInt(Math.round(Math.random() * (max - min) + min));
		var year_random = parseInt(Math.round(Math.random() * (max_year - min_year) + min_year));
		if(problem_sets.indexOf(problem_random) == -1){
			problem_sets.push(problem_random);
			years.push(year_random);
		}else{
			i--;
		}
	}
	callback(problem_sets, years);
}

function generated(problem_sets, years){
	// console.log(problem_sets);
	// console.log(years);

	problemSet = problem_sets;
	yearsSet = years;

	for(var i = 0; i < years.length; i++){
		var currentYear = years[i];
		var currentProblem = problem_sets[i];
		var stage = (currentYear >= 2014 ? "stage 1" : "stage1");
		var level = (currentProblem > 5 ? "senior" : "junior");
		var format = (currentYear >= 2017 ? "EF" : "En");
		fetchPDF(base_url + currentYear + "/" + stage + "/" + level + format + ".pdf");
	}
}

randomizeProblems(args, generated);