// @ts-check
const fs = require('fs');
const path = require('path');

/**
 * @param {string} directory 
 */
const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.log(`Created directory: ${directory}`);
    }
};

/**
 * @param {String[]} directories
 */
const ensureDirectoriesExist = (directories) => {
    directories.forEach(ensureDirectoryExists);
};


/**
 * @param {String[]} filepaths
 */
const ensureFilesExist = (filepaths) => {
    filepaths.forEach(ensureFileExists);
};

/**
 * @param {string} filepath
 */
const ensureFileExists = (filepath) => {
    if (!fs.existsSync(filepath)) {
        const directory = path.dirname(filepath);
        ensureDirectoryExists(directory);
        fs.writeFileSync(filepath, '');
        console.log(`Created file: ${filepath}`);
    }
};

module.exports={
    ensureDirectoryExists,
    ensureDirectoriesExist,
    ensureFileExists,
    ensureFilesExist,
}