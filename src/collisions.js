export { compileCollisions, isCollisionElement };

/* All the names that can be used to reference a collision element */
const COLLISION_STRINGS = [
    "collision",
    "hitbox",
    "hurtbox",
    "boundingbox",
    "bbox",
    "physic",
    "physics",
    "collider",
    "colliders"
];
const COLLISION_VERTEX_PROCESSOR = new THREE.Vector3();

/**
 * This function checks if an element is a collision using the name of itself OR parent
 * (if it has only 1 cube, to avoid issues with groups that are used for organization and have "collision" in their name but aren't actually collisions)
 * @param {*} element The element to check
 * @returns true if it's a collision, false otherwise
 */
function isCollisionElement(element) {
    return COLLISION_STRINGS.some(str => element.name.includes(str))
        || (element.parent?.cube?.count <= 1 && element.parent.name.includes("collision"))
    ;
}

function getCollisiionVertex(x, y, z, element) {
    COLLISION_VERTEX_PROCESSOR.set(x - element.origin[0], y - element.origin[1], z - element.origin[2]);
    COLLISION_VERTEX_PROCESSOR.divideScalar(16);
    return { x: COLLISION_VERTEX_PROCESSOR.x, y: COLLISION_VERTEX_PROCESSOR.y, z: COLLISION_VERTEX_PROCESSOR.z };
}

function compileCollisions() {
    const COLLISIONS = [];
    let result = [];


    /* Get all collision vertices from meshes */
    scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
            console.debug("Found mesh checking for collisions...");
            const element = OutlinerNode.uuids[child.name];
            if (element instanceof Cube && isCollisionElement(element)) {
                const { from, to, inflate } = element;
                const VERTICES = [
                    [to[0] + inflate, to[1] + inflate, to[2] + inflate],
                    [to[0] + inflate, to[1] + inflate, from[2] - inflate],
                    [to[0] + inflate, from[1] - inflate, to[2] + inflate],
                    [to[0] + inflate, from[1] - inflate, from[2] - inflate],
                    [from[0] - inflate, to[1] + inflate, from[2] - inflate],
                    [from[0] - inflate, to[1] + inflate, to[2] + inflate],
                    [from[0] - inflate, from[1] - inflate, from[2] - inflate],
                    [from[0] - inflate, from[1] - inflate, to[2] + inflate],
                ];
                COLLISIONS.push({
                    vertices: VERTICES.map(v => getCollisiionVertex(...v, element)),
                    element: element
                });
                console.debug("Added collision from element", element);
            }
        }
    });

    /* For each calculated collision */
    for(const COLLISION of COLLISIONS) {
        /* Calculate bounding box */
        const bounds = COLLISION.vertices.reduce((acc, v) => ({
            minX: Math.min(acc.minX, v.x),
            minY: Math.min(acc.minY, v.y),
            minZ: Math.min(acc.minZ, v.z),
            maxX: Math.max(acc.maxX, v.x),
            maxY: Math.max(acc.maxY, v.y),
            maxZ: Math.max(acc.maxZ, v.z),
        }), { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity });

        /* Creating the result */
        result.push({
            _comment: COLLISION.element.name,
            mesh: "", // The mesh name for which the collision is. (The collison will follow the animation of this mesh). If empty, it will be considered as a static collision.
            minX: bounds.minX,
            minY: bounds.minY,
            minZ: bounds.minZ,
            maxX: bounds.maxX,
            maxY: bounds.maxY,
            maxZ: bounds.maxZ,
            offset: {
                x: COLLISION.element.origin[0] / 16,
                y: COLLISION.element.origin[1] / 16,
                z: COLLISION.element.origin[2] / 16
            },
            rotation: {
                x: COLLISION.element.rotation[0],
                y: COLLISION.element.rotation[1],
                z: COLLISION.element.rotation[2]
            }
        });
    }

    /* Strinfiy the result */
    return JSON.stringify(result, null, '\t');
}