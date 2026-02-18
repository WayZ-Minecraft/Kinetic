import { compileAnimation } from './animation_exporter.js';
import { compileCollisions } from './collisions.js';
import { compileModel } from './obj_exporter.js';
import { compileSeats } from './seats.js';
export { EXPORT_FORM_ACTION, SEATS_FORM_ACTION };

function isInMainEditor() {
    return Interface.getUIMode() === 'edit';
}

function setTextAreaContent(dialogId, elementId, content) {
    // Blockbench usually assigns the form key as the element's ID
    const $textarea = $(`dialog#${dialogId} #${elementId}`);
    
    if ($textarea.length > 0) {
        $textarea.val(content).addClass('code');
    } else {
        // Fallback: search for any textarea if ID fails
        console.error(`Could not find textarea with ID: ${elementId}`);
    }
}

const EXPORT_FORM_ACTION = new Action('kinetic_export_animobj', {
    name: 'Kinetic Data Export',
    icon: 'movie',
    description: 'Kinetic Data Exporter for Content-Packs',
    keybind: new Keybind({ key: 'q', ctrl: true }),
    click: () => {
        /* Prevent doing strange things */
        if (!isInMainEditor()) {
            Blockbench.showMessageBox({ title: "Error", message: "You can only export in the main editor.", type: "error" });
            return;
        }

        const ANIMATIONS = Animation.all.slice();
        const HAS_ANIMATIONS = ANIMATIONS.length > 0;
        const MAIN_FORM = {
            export_obj_model: { label: "Export Model", type: 'checkbox', value: false },
            export_mtl_file: { label: "Export MTL", type: 'checkbox', value: false },
            export_textures: { label: "Export Textures", type: 'checkbox', value: false },
            export_animation: { label: `Export Animation ${HAS_ANIMATIONS ? `(Total: ${ANIMATIONS.length})` : "(No animations in the project)"}`, type: 'checkbox', value: false },
            // export_animations: { label: "Select animations to export", type: 'select', options: { option1: "Option 1", option2: "Option 2" } },
            exported_collisions_result: { name: "exported_collisions_result", label: "Exported Collisions - Place it in your content-pack JSON", type: 'textarea', nowrite: true, readonly: true },
            exported_seats_result: { name: "exported_seats_result", label: "Exported Seats - Place it in your content-pack JSON", type: 'textarea', nowrite: true, readonly: true },
        };
        const MAIN_DIALOG = new Dialog({
            id: 'kinetic_export',
            title: 'Main Exporter',
            form: MAIN_FORM,
            width: 1400,
            onOpen() {
                setTextAreaContent('kinetic_export', 'exported_collisions_result', compileCollisions()); // Set the collision text area content
                setTextAreaContent('kinetic_export', 'exported_seats_result', compileSeats()); // Set the seats text area content
            },
            onConfirm(form_result) {
                this.hide(); // Hide this dialog, we don't need it anymore
                compileModel(form_result.export_obj_model, form_result.export_mtl_file, form_result.export_textures); // Compile the model first

                /* Show animations dialog */
                if (form_result.export_animation && HAS_ANIMATIONS) {

                    const ANIM_FORM = {
                        export_all_anims: { label: "Export All Animations", type: 'checkbox', value: false },
                    };
                    ANIMATIONS.forEach(animation => ANIM_FORM[animation.name.hashCode()] = {label: animation.name, type: 'checkbox', value: false});
                    // Put a checkbox for each anim, with the name as label and the hash of the name as key (to avoid issues with special characters in the name)

                    const ANIM_DIALOG = new Dialog({ id: 'animation_export', title: 'Animation Exporter', form: ANIM_FORM,
                        onConfirm(anim_result) {
                            this.hide();
                            const SELECTED_ANIMS = ANIMATIONS.filter(animation => anim_result[animation.name.hashCode()]);
                            SELECTED_ANIMS.forEach(animation => Blockbench.export({ resource_id: 'animation', type: 'ANIM', extensions: ['anim'], name: animation.name, content: compileAnimation(animation) }));
                        }
                    }).show();
                }
            }
        }).show();
    }
});

const SEATS_FORM_ACTION = new Action('kinetic_seats_positions', {
    name: 'Setup Seats Positions',
    description: 'Setup the positions for all seats you want',
    keybind: new Keybind({ key: '=', ctrl: true }),
    click: () => {
        /* Seats can only be edited while in the object editor */
        if (!isInMainEditor()) {
            Blockbench.showMessageBox({ title: "Error", message: "You can only edit in the main editor.", type: "error" });
            return;
        }

        const SEATS_FORM = {
            seatID: {label: "Seat ID", type: 'number', step: '0.1'},
            x: {label: "X Position", type: 'number', step: '0.1'},
            y: {label: "Y Position", type: 'number', step: '0.1'},
            z: {label: "Z Position", type: 'number', step: '0.1'},
            rotation: {label: "Yaw Rotation", type: 'number', step: '0.1'}
        };
        const SEATS_DIALOG = new Dialog({ id: 'seats_positions', title: 'Seats Positions', form: SEATS_FORM, width: 540, singleButton: true, onConfirm() { SEATS_DIALOG.hide(); } }).show();
    }
});