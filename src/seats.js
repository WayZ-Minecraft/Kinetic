export { compileSeats, isSeatElement };

/* All the names that can be used to reference a seat element */
const SEAT_STRINGS = [
    "seat",
    "seats",
    "chair"
];

/**
 * This function checks if an element is a seat using the name of itself OR parent
 * (if it has only 1 cube, to avoid issues with groups that are used for organization and have "seat" in their name but aren't actually seats)
 * @param {*} element The element to check
 * @returns true if it's a seat, false otherwise
 */
function isSeatElement(element) {
    return SEAT_STRINGS.some(str => element.name.includes(str))
        || (element.parent?.cube?.count <= 1 && element.parent.name.includes("seat"))
    ;
}

function compileSeats() {
    let result = [];

    /* Get all seats vertices from meshes */
    scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
            console.debug("Found mesh checking for seat...");
            const element = OutlinerNode.uuids[child.name];
            if (element instanceof Cube && isSeatElement(element)) {
                const { from, to, inflate } = element;

                /* Add the seat */
                result.push({
                    _comment: element.name,
                    x: (from[0] + to[0]) / 2 / 16,
                    y: (from[1] + to[1]) / 2 / 16,
                    z: (from[2] + to[2]) / 2 / 16,
                    mountedHeightOffset: 0
                });

                console.debug("Added seat from element", element);
            }
        }
    });

    /* Strinfiy the result */
    return JSON.stringify(result, null, '\t');
}