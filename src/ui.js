import { CODEC_OBJ, setShouldExportCollisions, setShouldExportMTL, setShouldExportModel } from './obj_exporter.js';
import { compileAnimation } from './animation_exporter.js';
export { EXPORT_FORM_ACTION, SEATS_FORM_ACTION };

const EXPORT_FORM_ACTION = new Action('kinetic_export_animobj', { name: 'Kinetic Data Export', icon: 'movie', description: 'Kinetic Data Exporter for Content-Packs', keybind: new Keybind({key: 'q', ctrl: true}),
    click: () => {
        const ANIMATIONS = Animation.all.slice();
        const HAS_ANIMATIONS = ANIMATIONS.length > 0;
        const MAIN_FORM = {
            export_obj_model: { label: "Export Model", type: 'checkbox', value: false },
            export_mtl_file: { label: "Export MTL", type: 'checkbox', value: false },
            export_animation: { label: `Export Animation ${HAS_ANIMATIONS ? `(Total: ${ANIMATIONS.length})` : "(No animations in the project)"}`, type: 'checkbox', value: false },
            exported_collisions_result: { label: "Export Collisions", type: 'textarea', nowrite: true, readonly: true },
            seatsBox: { label: "Export Seats", type: 'textarea', nowrite: true, readonly: true }
        };
        const MAIN_DIALOG = new Dialog({ id: 'kinetic_export', title: 'Main Exporter', form: MAIN_FORM, width: 1400,
            onFormChange() {
                $('dialog#kinetic_export textarea').val(CODEC_OBJ.compile(1)).addClass('code');
            },
            onConfirm(form_result) {
                MAIN_DIALOG.hide();
                if (form_result.export_obj_model || form_result.export_collisions_result) {
                    setShouldExportModel(form_result.export_obj_model);
                    setShouldExportMTL(form_result.export_mtl_file);
                    setShouldExportCollisions(form_result.export_collisions_result);
                    CODEC_OBJ.export();
                }

                /* Show animations dialog */
                if (form_result.exportAnimation && HAS_ANIMATIONS) {
                    const ANIM_FORM = {};
                    ANIMATIONS.forEach(animation => ANIM_FORM[animation.name.hashCode()] = {label: animation.name, type: 'checkbox', value: false});
                    const ANIM_DIALOG = new Dialog({ id: 'animation_export', title: 'Animation Exporter', form: ANIM_FORM,
                        onConfirm(anim_result) {
                            ANIM_DIALOG.hide();
                            const SELECTED_ANIMS = ANIMATIONS.filter(animation => anim_result[animation.name.hashCode()]);
                            SELECTED_ANIMS.forEach(animation => Blockbench.export({ resource_id: 'animation', type: 'ANIM', extensions: ['anim'], name: animation.name, content: compileAnimation(animation) }));
                        }
                    });
                    ANIM_DIALOG.show();
                }
            }
        });
        MAIN_DIALOG.show();
    }
});

const SEATS_FORM_ACTION = new Action('kinetic_seats_positions', { name: 'Setup Seats Positions', description: 'Setup the positions for all seats you want', keybind: new Keybind({key: 'a', ctrl: true}),
    click: () => {
        const SEATS_FORM = {
            seatID: {label: "Seat ID", type: 'number', step: '0.1'},
            x: {label: "X Position", type: 'number', step: '0.1'},
            y: {label: "Y Position", type: 'number', step: '0.1'},
            z: {label: "Z Position", type: 'number', step: '0.1'},
            rotation: {label: "Yaw Rotation", type: 'number', step: '0.1'}
        };
        const SEATS_DIALOG = new Dialog({ id: 'seats_positions', title: 'Seats Positions', form: SEATS_FORM, width: 540, singleButton: true, onConfirm() { SEATS_DIALOG.hide(); } });
        SEATS_DIALOG.show();
    }
});