const fs = require('fs');
const path = require('path');

/**
 * @class Logger
 * @description A class to provide logging services for the application.
 * @author Jay Chauhan
 */
class Logger {
    /**
     * @constructor
     * @param {string|Object} options - Default file location (string) or configuration options (object)
     * @param {string} options.logDir - Custom log directory path (relative or absolute)
     */
    constructor(options) {
        // Handle string parameter as default file location
        if (typeof options === 'string') {
            this.defaultFileLocation = options;
            this.rootDir = path.resolve(process.cwd(), 'log');
        } else {
            // Handle object parameter or no parameter
            const opts = options || {};
            this.defaultFileLocation = null;
            const logPath = opts.logDir || 'log';
            this.rootDir = path.isAbsolute(logPath) ? logPath : path.resolve(process.cwd(), logPath);
        }
        
        // Check if log directory already exists, if not create it
        if (!fs.existsSync(this.rootDir)) {
            try {
                fs.mkdirSync(this.rootDir, { recursive: true });
            } catch (err) {
                console.error(`Error creating log directory ${this.rootDir}:`, err);
            }
        }
    }

    /**
     * @function write
     * @description Writes the log details to the specified file.
     * @param {string|object} details - The details to be written in the log file.
     * @param {string} fileLocation - The location within the date folder where the log file should be saved (format: {folder}/{fileName}).
     * @returns {void}
     */

    write(details, fileLocation) {
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');

        // Use provided fileLocation or default to 'default/default' or constructor default
        const finalLocation = fileLocation || this.defaultFileLocation || 'default/default';

        const dirName = path.dirname(finalLocation);
        const basePath = dirName === '.' ? '' : dirName;
        const logDir = basePath 
            ? path.join(this.rootDir, year, month, date, basePath)
            : path.join(this.rootDir, year, month, date);
        const logFile = path.join(logDir, `${path.basename(finalLocation)}.log`);

        // Ensure the directory exists
        if (!fs.existsSync(logDir)) {
            try {
                fs.mkdirSync(logDir, { recursive: true });
            } catch (err) {
                console.error(`Error creating directory ${logDir}:`, err);
                return;
            }
        }

        // Format the details as a string
        const logEntry = typeof details === 'string' ? details : JSON.stringify(details, null, 2);

        // Append details to the log file
        try {
            fs.appendFileSync(logFile, `${now.toISOString()} - ${logEntry}\n`, 'utf8');
        } catch (err) {
            console.error(`Error writing to log file ${logFile}:`, err);
        }
    }

    /**
     * @function cleanupLogs
     * @description Deletes log files and directories older than 7 days.
     * @returns {void}
     */
    cleanupLogs() {
        const deleteOldFiles = (dirPath) => {
            const files = fs.readdirSync(dirPath);

            files.forEach((file) => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                const now = Date.now();
                const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

                if (ageInDays > 7) {
                    if (stats.isDirectory()) {
                        // Recursively delete old directories
                        deleteOldFiles(filePath);
                        if (fs.readdirSync(filePath).length === 0) {
                            fs.rmdirSync(filePath);
                        }
                    } else {
                        // Delete old files
                        fs.unlinkSync(filePath);
                    }
                }
            });
        };

        // Start cleanup from the root log directory
        if (fs.existsSync(this.rootDir)) {
            deleteOldFiles(this.rootDir);
        }
    }
}

module.exports = Logger;
