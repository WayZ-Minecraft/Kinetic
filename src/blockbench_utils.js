export { getBlockBenchVersion, exportSingleFileOrZip };

function getBlockBenchVersion() {
    return Blockbench.version;
}

function getBlockBenchFormatVersion() {
    return "Unknown";
}

/**
 * Exports a single file or multiple files as a zip archive, depending on the number of files provided.
 * @param {*} files  An array of objects with the following structure: { name: 'filename', ext: 'extension',  content: 'file content', savetype: 'txt', 'zip', 'image' }
 */
function exportSingleFileOrZip(files) {
    if(isApp) {
        for(const file of files)
            Blockbench.export({ type: 'Text File', extensions: [file.ext], name: file.name, content: file.content, savetype: file.savetype || 'txt' });
    } else {
        const ARCHIVE = new JSZip();

		/* Add all files to the archive */
		for(const file of files) {
            if(file.savetype === 'image')
                ARCHIVE.file(file.name + '.' + file.ext, file.content.replace('data:image/png;base64,', ''), { base64: true });
            else
                ARCHIVE.file(file.name + '.' + file.ext, file.content);
        }

		/* Allow the user to save the as archive */
		ARCHIVE.generateAsync({type: 'blob'}).then(content => Blockbench.export({ type: 'Zip Archive', extensions: ['zip'], name: 'assets', content: content, savetype: 'zip' }));
    }
}