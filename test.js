var muscle = [abdominals,
	abductors,
	adductors,
	biceps,
	calves,
	chest,
	forearms,
	glutes,
	hamstrings,
	lats,
	lowerback, middleback,
	neck,
	quadriceps,
	traps,
	triceps]

var m = neck;

for (i = 0,i < muscle.length, i++) {
	if (m in muscle) {
		console.log("T");
	} else {
		console.log("F");
	}
}