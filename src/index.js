import { CODEC_OBJ } from './obj_exporter.js';
import { EXPORT_FORM_ACTION, SEATS_FORM_ACTION } from './ui.js';

const textAreaStyle = `dialog#kinetic_export textarea { tab-size: 40px; min-height: 250px; }`;

/**
 * Utility function to remove an action from the menu bar and clean up its references.
 * @param {*} action The action to remove
 */
function removeAction(action) {
    // MenuBar.removeAction(action); // Remove the action from the menu bar
    action.delete(); // Call the delete method to clean up any references and event listeners associated with the action
}

/* Entry point */
(function() {
    Plugin.register('kinetic_niwer_engine_blockbench_exporter', {
        title: 'Kinetic Importer/Exporter',
        author: 'Niwer',
        icon: 'movie',
        version: '2.0.0',
        variant: 'both',
        description: 'This plugin allow you to import/export : OBJ (MTL optional), ANIM file, collisions/seats for JSON, and more!',
        onload() {
            /* Add all actions */
            MenuBar.addAction(EXPORT_FORM_ACTION, 'file.export');
            MenuBar.addAction(SEATS_FORM_ACTION, 'filter');

            /* Add CSS */
            Blockbench.addCSS(textAreaStyle);

            /* Add OBJ import drag handler */
            Blockbench.addDragHandler("obj_drag_n_drop", {
                extensions: ['obj']
            }, (files) => {
                for(file of files) CODEC_OBJ.load(file);
            });
        },
        onunload() {
            /* Remove all actions */
            removeAction(EXPORT_FORM_ACTION);
            removeAction(SEATS_FORM_ACTION);

            /* Remove OBJ import drag handler */
            Blockbench.removeDragHandler("obj_drag_n_drop");
        }
    });
})();