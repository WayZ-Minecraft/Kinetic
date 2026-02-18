export { compileAnimation };

/**
 * Fix the loop mode to the mod's stringified format
 * @param {*} mode The mode to fix
 * @returns The fixed mode
 */
function fixLoopMode(mode) {
    return { once: "ONCE", hold: "HOLD_ON_LAST", loop: "LOOP" }[mode] || "ONCE";
}

/**
 * Compile the animation to a JSON string
 * @param {*} animation The animation to compile
 * @returns The JSON string
 */
function compileAnimation(animation) {
	const animators = animation.animators;
	let objectForJson = { "loop": fixLoopMode(animation.loop), "startDelay": animation.startDelay, "timelines": [], "events": {} };

	for (let uuid in animators) {
		let animator = animators[uuid];
		let keyframes = animator.keyframes;
		
		if(animator instanceof BoneAnimator) {
			const hasGroup = animator.getGroup() != null;
			const origin = hasGroup ? {
				x: animator.getGroup().origin[0],
				y: animator.getGroup().origin[1],
				z: animator.getGroup().origin[2]
			} : { x: 0, y: 0, z: 0 };
			let object = {
				"objectName": hasGroup ? animator.getGroup().name : animator.name,
				"pivotPoint": origin,
				"parent": hasGroup ? animator.getGroup().parent.name : null,
			};
			let frames = new Map();

			/* Compile the keyframes */
			keyframes.forEach(kf => {
				let time = kf.getTimecodeString();
				if (!frames.has(time))
					frames.set(time, { "time": time });

				let frame = frames.get(time);
				switch (kf.channel) {
					case "position":
						frame.position = {
							x: kf.getArray()[0],
							y: kf.getArray()[1],
							z: kf.getArray()[2]
						}
						break;
					case "rotation":
						frame.rotation = {
							x: kf.getArray()[0],
							y: kf.getArray()[1],
							z: kf.getArray()[2]
						}
						break;
					case "scale":
						frame.scale = {
							x: kf.getArray()[0],
							y: kf.getArray()[1],
							z: kf.getArray()[2]
						}
						break;
				}
			});

			object.frames = Array.from(frames.values()); // Add the frames to the object
			objectForJson.timelines.push(object); // Add the object to the timelines
		} else // Add events
			keyframes.forEach(kf => {
				const time = kf.getTimecodeString();
				if (!objectForJson.events[time]) objectForJson.events[time] = [];
				objectForJson.events[time].push({ "type": kf.channel, "path": kf.data_points[0].effect, "locator": kf.data_points[0].locator, "volume": 1.0, "pitch": 1.0 });
			});
	}

	return JSON.stringify(objectForJson, null, '\t');
}