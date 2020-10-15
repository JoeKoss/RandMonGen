var mysql = require('mysql');
var http = require('http');

//Creates a connection pool that is used for DB queries
var pool = mysql.createPool({
	connectionLimit : 10,
	host: 'randmongen.c3guhufae0gx.us-east-2.rds.amazonaws.com',
	user: 'datareader',
	password: 'datareader',
	database: "randmongen"
});

//Returns a promise obj with monSize data
function getMonSize(){
 	let sizeP = new Promise(function(resolve, reject){
 		pool.query("SELECT * FROM monSize", function(err, result){
			if(err)
				console.log(err);
			else{
				var randIndex = Math.floor(Math.random() * result.length);
				resolve(result[randIndex]);
	 		}
 		});
	});
	return sizeP;
}

//Return a promise obj with monType data
function getMonType(){
	let typeP = new Promise(function(resolve, reject){
 		pool.query("SELECT * FROM monType", function(err, result){
			if(err)
				console.log(err);
			else{
				var randIndex = Math.floor(Math.random() * result.length);
				resolve(result[randIndex]);
	 		}
 		});
	});
	return typeP;
}

//Returns a promise obj with monMovement data
function getMonMovement(monSizeID){
	let monMovementP = new Promise(function(resolve, reject){
		pool.query("SELECT * FROM monMovement WHERE sizeID <= '" + monSizeID + "'", function(err, result){
			if(err)
				console.log(err);
			else{
				var randIndex = Math.floor(Math.random() * result.length);
				resolve(result[randIndex]);
			}
		});
	});
	return monMovementP;
}

//Returns a promise obj with monStatParam data
function getMonStatParam(userIn){
	let statParamP = new Promise(function(resolve, reject){
		pool.query("SELECT * FROM monStatParam WHERE monCR = '" + userIn + "'", function(err,result){
			if(err)
				console.log(err);
			else{
				var randIndex = Math.floor(Math.random() * result.length);
				resolve(result[randIndex]);
			}
		});
	});
	return statParamP;
}

//Returns a promise obj containing an array of monsSkills data or a null value
function getMonSkills(){
	let monSkillsP = new Promise(function(resolve, reject){
		var numSkills = Math.floor(Math.random() * 3);

		if(numSkills == 0)
			resolve(null);
		else{
			pool.query("SELECT * FROM monSkills", function(err, result){
				if(err)
					console.log(err);
				else{
					let monSkillArr = [];
					while(numSkills != 0)
					{
						var randIndex = Math.floor(Math.random() * result.length);
						if(!monSkillArr.includes(result[randIndex])){
							monSkillArr.push(result[randIndex]);
							numSkills -= 1;
						}
					}
					resolve(monSkillArr);
				}
			});
		}
	});
	return monSkillsP;
}

//Returns a promise obj containing an array of monSenses data
function getMonSenses(){
	let monSenseP = new Promise(function(resolve, reject){
		let monSenseArr = [];
		var numSenses = Math.floor(Math.random() * 2);

		pool.query("SELECT * FROM monSenses", function(err, result){
			if(err)
				console.log(err);
			else{
				if(numSenses == 1){
					var randIndex = Math.floor(Math.random() * (result.length - 1) +1);
					monSenseArr.push(result[randIndex]);
				}
				monSenseArr.push(result[0]);
				resolve(monSenseArr);
			}
		});
	});
	return monSenseP;
}

//Returns a promise obj containing an array of monsResistances data or a null value
function getMonResistances(userIn){
	let monResP = new Promise(function(resolve, reject){
		var numRes = getNumRes(userIn);
		let monResArr = [];

		if(numRes == 0){
			resolve(null);
		}
		else{
			let monResIDs = [];
			pool.query("SELECT * FROM monResistances", function(err, result){
				if(err)
					console.log(err);
				else{
					while(numRes != 0){
						var randIndex = Math.floor(Math.random() * result.length);
						if(!monResArr.includes(result[randIndex])){
							//If resID 14 is picked but IDs 1, 2, or 3 were already chosen, do not add it.
							if(result[randIndex].resID == 14 && (monResIDs.includes(1) || monResIDs.includes(2) || monResIDs.includes(3))){
								//To decrease overall potential number of resistances, if it's already a resistance, decrease num of resistances
								numRes -=1;
							}
							//If ResID 1, 2, or 3 is picked but ResID 14 was already chosen, do not add it.
							else if((result[randIndex].resID == 1 || result[randIndex].resID == 2 || result[randIndex].resID == 3) && monResIDs.includes(14)){
								numRes -=1;
							}
							else{
								monResArr.push(result[randIndex]);
								monResIDs.push(result[randIndex].resID);
								numRes -= 1;
							}
						}
						else
							numRes -= 1;
					}

					//If resistance 14 is chosen, sort alphabetically and push it to the end of the array to make processing easier
					if(monResIDs.includes(14) && monResArr.length > 1){
						var tempIndex = monResIDs.indexOf(14);
						var temp = monResArr[tempIndex];
						monResArr.splice(tempIndex, 1);
						monResArr.sort(function(a, b) {
							if (a.resistance < b.resistance)
						 		return -1;
						  	if (a.resistance > b.resistance)
						    	return 1;
						  	return 0;
						});
						monResArr.push(temp);
					}
					//Otherwise, just sort alphabetically
					else if(monResArr.length > 1)
						monResArr.sort(function(a, b) {
							if (a.resistance < b.resistance)
						 		return -1;
						  	if (a.resistance > b.resistance)
						    	return 1;
						  	return 0;
						});
					resolve(monResArr);
				}
			});
		}
	});
	return monResP;
}

//Returns a promise obj containing an array of monsResistances data or a null value
function getMonDamageImmunities(monRes, userIn){
	let monResIDs = [];
	if(monRes != null)
		for(i=0; i<monRes.length; i++)
			monResIDs.push(monRes[i].resID);

	let monDamageImmunitiesP = new Promise(function(resolve, reject){
		var numImmune = getNumImmune(userIn);
		let monImmuneArr = [];

		if(numImmune == 0){
			resolve(null);
		}
		else{
			pool.query("SELECT * FROM monResistances", function(err, result){
				if(err)
					console.log(err);
				else{
					let monImmuneIDs = [];
					while(numImmune != 0){
						var randIndex = Math.floor(Math.random() * result.length);
						if(!monImmuneArr.includes(result[randIndex]) && !monResIDs.includes(result[randIndex].resID)){
							if(result[randIndex].resID == 14 && (monResIDs.includes(1) || monResIDs.includes(2) || monResIDs.includes(3))){
								//To decrease overall potential number of immunities, if it's already a resistance, decrease num of immunities
								numImmune -=1;
							}
							else if((result[randIndex].resID == 1 || result[randIndex].resID == 2 || result[randIndex].resID == 3) && monResIDs.includes(14)){
								numImmune -=1;
							}
							else{
								monImmuneArr.push(result[randIndex]);
								monResIDs.push(result[randIndex].resID);
								monImmuneIDs.push(result[randIndex].resID);
								numImmune -= 1;
							}
						}
						else
							numImmune -=1;
					}
					//If resistance 14 is chosen, sort alphabetically and push it to the end of the array to make processing easier
					if(monImmuneIDs.includes(14) && monImmuneArr.length > 1){
						var tempIndex = monImmuneIDs.indexOf(14);
						var temp = monImmuneArr[tempIndex];
						monImmuneArr.splice(tempIndex, 1);
						monImmuneArr.sort(function(a, b) {
							if (a.resistance < b.resistance)
						 		return -1;
						  	if (a.resistance > b.resistance)
						    	return 1;
						  	return 0;
						});
						monImmuneArr.push(temp);
					}
					//Otherwise just sort alphabetically
					else if(monImmuneArr.length > 1)
						monImmuneArr.sort(function(a, b) {
							if (a.resistance < b.resistance)
						 		return -1;
						  	if (a.resistance > b.resistance)
						    	return 1;
						  	return 0;
						});
				resolve(monImmuneArr);
				}
			});
		}
	});
	return monDamageImmunitiesP;
}

//Returns a promise obj containing an array of monConditions data or a null value
function getMonConditionImmunities(userIn){
	let monCondP = new Promise(function(resolve, reject){
		var numCond = getNumImmune(userIn);
		let monCondArr = [];

		if(numCond == 0){
			resolve(null);
		}
		else{
			let monResIDs = [];
			pool.query("SELECT * FROM monConditions", function(err, result){
				if(err)
					console.log(err);
				else{
					while(numCond != 0){
						var randIndex = Math.floor(Math.random() * result.length);
						if(!monCondArr.includes(result[randIndex])){
								monCondArr.push(result[randIndex]);
								numCond -= 1;
							}
						else
							numCond -= 1;
					}
					monCondArr.sort(function(a, b) {
						if (a.condition < b.condition)
					 		return -1;
					  	if (a.condition > b.condition)
					    	return 1;
					  	return 0;
					});	
					resolve(monCondArr);
				}

			});
		}
	});
	return monCondP; 
}

//Returns a random value based on CR
function getNumRes(userIn){
	if(userIn == '1/8' || userIn == '1/4' || userIn == '1/2')
		return Math.floor(Math.random() * 2);
	if(userIn == '1' || userIn == '2')
		return Math.floor(Math.random() * 3);
}

//Returns a random value based on CR
function getNumImmune(userIn){
	if(userIn == '1/8' || userIn == '1/4')
		return 0;
	if(userIn == '1/2' || userIn == '1')
		return Math.floor(Math.random() * 2);
	if(userIn == '2')
		return Math.floor(Math.random() * 3);
}

//Returns a promise obj containing an array of monsAbilities data or a null value
function getMonAbilities(monSizeID, monMoveType, monSenses){
	let monAbilitiesP = new Promise(function(resolve,reject){
		var numAbilities = Math.floor(Math.random() * 3);

		if(numAbilities == 0)
			resolve(null);
		else{
			let abilityArr = [];
			let abilityIDs = [];
			pool.query("SELECT * FROM monAbilities", function(err, result){
				if(err)
					console.log(err);
				else{
					while(numAbilities != 0){
						var randIndex = Math.floor(Math.random() * result.length);
						if(!abilityArr.includes(result[randIndex]) && checkMonAbilityConditions(monSizeID, monMoveType, monSenses, abilityIDs, result[randIndex])){
							abilityArr.push(result[randIndex]);
							abilityIDs.push(result[randIndex].abilityID);
							numAbilities -=1;	
						}
					}
				}
				resolve(abilityArr);
			});
		}
	});
	return monAbilitiesP;
}

//Checks to ensure abilities meet monster parameters and eliminates ability overlap
function checkMonAbilityConditions(monSizeID, monMoveType, monSenses, abilityIDs, res){
	//Checks result for blank or no restrictions or if it matches monster parameters.
	var senseConditionsMet = res.senseRestrict == '' ||  res.senseRestrict == monSenses[0].sense;
	var movementConditionsMet = res.moveType == 0 || res.moveType == monMoveType;
	var sizeConditionsMet = res.sizeID == 0 || res.sizeID == monSizeID;

	//Checks result for Trampling Charge(17), Pounce(30), or Charge(10) and only includes it if any of them aren't already included.
	//Trampling Charge and Pounce determines attacks and Charge is functionally equivalent.
	var haveDependentAbilities = (res.abilityID == 17 || res.abilityID == 30 || res.abilityID == 10) && (abilityIDs.includes(30) || abilityIDs.includes(17) || abilityIDs.includes(10));

	//Checks for potential duplicate sense-related abilities and only includes it if any of them aren't already included. 
	//Keen Smell(3), Keen Hearing(4), Keen Sight(5), Keen Smell and Sight(6), Keen Hearing and Smell(7), Keen Hearing and Sight(8) 
	var smellDuplicate = (res.abilityID == 3 || res.abilityID == 6 || res.abilityID == 7) && (abilityIDs.includes(3) || abilityIDs.includes(6) || abilityIDs.includes(7));
	var hearingDuplicate = (res.abilityID == 4 || res.abilityID == 7 || res.abilityID == 8) && (abilityIDs.includes(4) || abilityIDs.includes(7) || abilityIDs.includes(8));
	var sightDuplicate = (res.abilityID == 5 || res.abilityID == 6 || res.abilityID == 8) && (abilityIDs.includes(4) || abilityIDs.includes(6) || abilityIDs.includes(8));
	var senseAbilityDuplicate = smellDuplicate && hearingDuplicate && sightDuplicate;

	//Checks for potential Hold Breath duplicates and only includes it if any of them aren't already included.
	var holdBreathDuplicate = (res.abilityID == 13 || res.abilityID == 14 || res.abilityID == 15) && (abilityIDs.includes(13) || abilityIDs.includes(14) || abilityIDs.includes(15));

	return senseConditionsMet && movementConditionsMet && sizeConditionsMet && !haveDependentAbilities && !senseAbilityDuplicate && !holdBreathDuplicate;
}

//Returns a promise obj with monAtk data
function getMonAtks(userIn, monAbilities){
 	let atksP = new Promise(function(resolve, resject){
 		let atkArr = [];
 		let abilIDs = [];
 		var numAtks = Math.floor(Math.random() * 2 + 1);

 		if(monAbilities != null)
 			for(i=0; i<monAbilities.length; i++)
 				abilIDs.push(monAbilities[i].abilityID);

		if(abilIDs.includes(17)){
			atkArr.push(getTramplingChargeAtk(userIn));
			numAtks -= 1;

			atkArr[0].then(data => {
				if((data.atkName == 'Hooves') == false)
					atkArr.push(getHoovesAtk(userIn));	
				else if(numAtks == 1)
					atkArr.push(getRandomAtk(userIn, numAtks, Promise.all(atkArr)));

				resolve(Promise.all(atkArr).then(data => {
					return data;
				}));
			});

		}	
		else if(abilIDs.includes(30)){
			atkArr.push(getPounceAtks(userIn));
			resolve(atkArr);
			
		}
		else{
			while(numAtks > 0){
				atkArr.push(getRandomAtk(userIn,numAtks, atkArr));
				numAtks -= 1;
			}
			resolve(Promise.all(atkArr).then(data => {
				return data;
			}));
		}	
	});
	return atksP;
}

//Gets the attacks required for the Trampling Charge ability
function getTramplingChargeAtk(userIn){
	let tChargeAtk1P = new Promise(function(resolve, reject){
		pool.query("SELECT * FROM monAttacks WHERE monCR = '" + userIn + "' AND (atkName = 'Ram' OR atkName = 'Hooves' OR " + 
			"atkName = 'Tusk' OR atkName = 'Gore')", function(err, result){
			if(err)
				console.log(err);
			else{
				var randIndex = Math.floor(Math.random() * result.length);
				resolve(result[randIndex]);
			}
		});
	});
	return tChargeAtk1P;
}

//Gets a Hooves attack, used with getTramplingChargeAtk
function getHoovesAtk(userIn){
	let tChargeAtk2P = new Promise(function(resolve, reject){
		pool.query("SELECT * FROM monAttacks WHERE monCR = '" + userIn + "' AND atkName = 'Hooves'", function(err, result){
			if(err)
				console.log(err);
			else{
				var randIndex = Math.floor(Math.random() * result.length);
				resolve(result[randIndex]);
			}
		});
	});
	return tChargeAtk2P;
}

//Gets the attacks required for the Charge ability
function getPounceAtks(userIn){
	var atkArr = [];
	let pounceAtkP = new Promise(function(resolve,reject){
		pool.query("SELECT * FROM monAttacks WHERE monCR = '" + userIn + "' AND atkName = 'Claw'", function(err, result){
			if(err)
				console.log(err);
			else{
				var randIndex = Math.floor(Math.random() * result.length);
				atkArr.push(result[randIndex]);
				pool.query("SELECT * FROM monAttacks WHERE monCR = '" + userIn + "' AND atkName = 'Bite' AND atkMulti = 0 AND atkEffect IS null", function(err, result){
					if(err)
						console.log(err);
					else{
						randIndex = Math.floor(Math.random() * result.length);
						atkArr.push(result[randIndex]);
						resolve(atkArr);
		 			}
		 			
		 		});
			}
		});
	});
	return pounceAtkP;
}

//Gets a random attack
function getRandomAtk(userIn, numAtks, atkArr){
	let randomAtkP = new Promise(function(resolve, reject){
		if(numAtks == 1){
			if(atkArr.length > 0)
				atkArr[0].then(data =>{
					pool.query("SELECT * FROM monAttacks WHERE monCR = '" + userIn + "' AND atkMulti = 0 AND " + "(atkName != '" + data.atkName + "' " + 
						"AND atkName != '" + data.atkName + "s')", function(err, result){
						if(err)
							console.log(err);
						else{
							var randIndex = Math.floor(Math.random() * result.length);
							resolve(result[randIndex]);
						}
			 		});
				});
			else{
				pool.query("SELECT * FROM monAttacks WHERE monCR = '" + userIn + "' AND atkMulti = 0", function(err, result){
					if(err)
						console.log(err);
					else{
						var randIndex = Math.floor(Math.random() * result.length);
						resolve(result[randIndex]);
					}
				});
			}
		}
		else{
			pool.query("SELECT * FROM monAttacks WHERE monCR = '" + userIn + "'", function(err, result){
				if(err)
					console.log(err);
				else{
					var randIndex = Math.floor(Math.random() * result.length);
					resolve(result[randIndex]);
				}
			});
		}
	});
	return randomAtkP;
}

//Sends a response to the client with the requested data
function main(){
	var server = http.createServer((req, res) => {
		console.log('Got server request');
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Access-Control-Allow-Origin', '*');

		//Browsers send another request for the favicon. This code prevents double queries.
		if(req.url == '/favicon.ico') {
	    }
	    if (req.url == '/gimmeMon' && req.method === 'POST'){
	    	console.log('/gimmeMon request received');
			var userIn = '';

			//Get data from the request
	    	req.on('data', function(data) {
	    		userIn += data;
	    	});

	    	//Use data from the request
	    	req.on('end', function(){
				let promArr = [];

	    		//Add promises to an array of promises
	    		promArr.push(getMonSize());
	    		console.log('Monsize');
	    		promArr.push(getMonType());
	    		console.log('Montype');
		    	promArr.push(promArr[0].then(data =>{
		    		return getMonMovement(data.sizeID);
		    	}));
		    	console.log('Monmovement');
		    	promArr.push(getMonStatParam(userIn));
		    	console.log('Monstats');
		    	promArr.push(getMonSkills());
		    	console.log('Monskills');
		    	promArr.push(getMonSenses());
		    	console.log('Monsenses');
		    	promArr.push(getMonResistances(userIn));
		    	console.log('Monresistances');
	    		promArr.push(promArr[6].then(function(data){
	    			return getMonDamageImmunities(data, userIn);
	    		}));
	    		console.log('Mondamageimmune');
	    		promArr.push(getMonConditionImmunities(userIn));
	    		console.log('Monconditionimmune');
				promArr.push(Promise.all(promArr).then(function(data){
	    			return getMonAbilities(data[0].sizeID, data[2].moveType, data[5]);
	    		}));
	    		console.log('Monabilities');
				//getMonAtks returns a promise containing a promise, so store this in a temp variable
		    	var monAtkP = promArr[9].then(function(data){
		    		return getMonAtks(userIn, data);
		    	});
		    	console.log('Monatks');
		    	//we want to get the promise contained inside of the promise, so read the promise and push the promise inside of it
		    	promArr.push(monAtkP.then(function(prom){
		    		return Promise.all(prom);
		    	}));
		    	console.log('Monatks Pushed');

				Promise.all(promArr).then(function(response){
					console.log('Reading proimise array');
					var monster = {
						monSize: response[0],
						monType: response[1],
						monMovement: response[2],
						monStats: response[3],
						monSkills: response[4],
						monSenses: response[5],
						monResistances: response[6],
						monDamageImmunities: response[7],
						monCondImmunities: response[8],
						monAbilities: response[9],
						monAtks: response[10]
					}
					console.log('Sending data');
					res.end(JSON.stringify(monster));
				});
	    	});
		}
	});

	server.listen(8080, '0.0.0.0', () => {
		console.log('Server running!');
	});
}

main();