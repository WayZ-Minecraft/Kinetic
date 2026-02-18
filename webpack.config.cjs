const path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'kinetic_niwer_engine_blockbench_exporter.js', // Exported file name
		path: path.resolve(__dirname, 'dist'),
	},
	mode: 'production',
	optimization: {
        usedExports: false, // Disable tree shaking to keep all code, even if it seems unused
        minimize: false     // Disable minification to preserve code readability and structure
    },
	externals: {
		three: 'THREE',
	}
};