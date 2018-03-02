module.exports = {
	checkData: function(args){
		if(checkProblem(args[2]) == 200 && checkProblem(args[3]) == 200
			&& parseInt(args[4]) == args[4] && parseInt(args[5]) == args[5]){
			return 200;
		}else{
			return 404;
		}
	},
	message: "usage: node index [min problem] [max problem] [min year] [max year]\n -problems follow format \"J1\" where first letter indicates level. \n -years follow format \"2000\""
}
var checkProblem = function(problem){
	if((problem.toUpperCase().charAt(0) == "S" || problem.toUpperCase().charAt(0) == "J") 
		&& (problem.charAt(1) == parseInt(problem.charAt(1)) 
			&& parseInt(problem.charAt(1)) <= 5 && parseInt(problem.charAt(1)) >= 1)){
		return 200;
	}else{
		return 400;
	}
}	

