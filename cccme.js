var errors = require('./errors.js');
const args = process.argv;
var size = 5;

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
	console.log(problem_sets);
	console.log(years);
}

randomizeProblems(args, generated);