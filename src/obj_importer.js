export { importOBJFromFile };
import { toVector } from './math.js';

/**
 * Function to import OBJ model from .obj file
 * @param {*} file The file object containing the content of the .obj file to import
 */
function importOBJFromFile(file) {
    const {content} = file;
    const lines = content.split(/[\r\n]+/);

    let mesh;
    let vertices = [];
    let vertex_keys = {};
    let vertex_textures = [];
    let vertex_normals = [];
    let meshes = [];
    let current_texture;

    const ROTATION_VECTOR = new THREE.Vector3();
    const PIVOT = new THREE.Vector3();

    /* Init the ability to undo, allowing to undo after the model has been imported */
    Undo.initEdit({outliner: true, elements: meshes, selection: true});

    lines.forEach(line => {
        if (line.substr(0, 1) == '#' || !line) return;

        const args = line.split(/\s+/).filter(arg => typeof arg !== 'undefined' && arg !== '');
        switch (args.shift()) {
            /* For groups and objects, Create new mesh */
            case 'o':
            case 'g':
                mesh = new Mesh({ name: args[0], vertices: {} })
                vertex_keys = {};
                meshes.push(mesh);
                break;
            
            /* For each vertex, texture coord and normal */
            case 'v':
                if (!mesh) {
                    mesh = new Mesh({ name: 'unknown', vertices: {} })
                    vertex_keys = {};
                    meshes.push(mesh);
                }
                vertices.push(toVector(args).map(v => v * 16)); // Force scale to 16 (Default Blockbench scale)
                break;
            case 'vt':
                vertex_textures.push(toVector(args))
                break;
            case 'vn':
                vertex_normals.push(toVector(args))
                break;

            /* For each face */
            case 'f':
                let f = { vertices: [], vertex_textures: [], vertex_normals: [], }
                args.forEach((triplet, i) => {
                    if (i >= 4) return; // Ignore faces with more than 4 vertices for now, as they are not supported by Blockbench and would require triangulation

                    const [V, VT, VN] = triplet.split('/').map(v => parseInt(v));
                    if (!vertex_keys[ V-1 ]) vertex_keys[ V-1 ] = mesh.addVertices(vertices[V-1])[0];
                    f.vertices.push(vertex_keys[ V-1 ]);
                    f.vertex_textures.push(vertex_textures[ VT-1 ]);
                    f.vertex_normals.push(vertex_normals[ VN-1 ]);
                })
                
                /* Gather UVs in the UV list from the face */
                let uv = {};
                f.vertex_textures.forEach((vt, i) => {
                    const UV_POS = f.vertices[i];
                    if (vt instanceof Array) uv[UV_POS] = [ vt[0] * Project.texture_width, (1-vt[1]) * Project.texture_width ];
                    else uv[UV_POS] = [0, 0];
                })

                /* Create and add the face to the mesh */
                const FACE = new MeshFace(mesh, { vertices: f.vertices, uv, texture: current_texture })
                if (f.vertex_normals.find(v => v)) {
                    ROTATION_VECTOR.fromArray(FACE.getNormal());
                    PIVOT.fromArray(f.vertex_normals[0]);

                    const ANGLE = ROTATION_VECTOR.angleTo(PIVOT);
                    if (ANGLE > Math.PI / 2) FACE.invert();
                }
                mesh.addFaces(FACE);
                break;
        }
    })
    meshes.forEach(mesh => mesh.init())

    /* Marking the undo as finished */
    Undo.finishEdit('Import OBJ');
}