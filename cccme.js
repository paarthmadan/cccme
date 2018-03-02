var errors = require('./errors.js');
const args = process.argv;


if(args.length != 6 || errors.checkData(args) != 200){
	console.log("Error: Incorrect Input \n" + errors.message);
}