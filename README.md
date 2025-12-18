# @morphsync/logger

> A simple and efficient logging utility with automatic file organization and cleanup.

[![npm version](https://img.shields.io/npm/v/@morphsync/logger.svg)](https://www.npmjs.com/package/@morphsync/logger)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- 📁 Automatic directory structure (year/month/date/category)
- 📝 Supports string and object logging
- 🧹 Automatic cleanup of logs older than 7 days
- ⏰ ISO timestamp for each log entry
- 🚀 Zero configuration required
- 💾 Lightweight with no external dependencies

## Installation

```bash
npm install @morphsync/logger
```

## Quick Start

```javascript
const Logger = require('@morphsync/logger');

// CASE 1: With default file location
const logger = new Logger('folder/file');
logger.write('Message to be write in log file');
// => log/2025/01/15/folder/file.log

logger.write('Message to be write in log file specified file', 'folder-1/file-1');
// => log/2025/01/15/folder-1/file-1.log

// CASE 2: Without default file location
const logger2 = new Logger();
logger2.write('Message to be write in log file');
// => log/2025/01/15/default/default.log

logger2.write('Message with specific location', 'app/info');
// => log/2025/01/15/app/info.log
```

## Usage

### Basic Logging

```javascript
const Logger = require('@morphsync/logger');

const logger = new Logger();

// String logging
logger.write('User logged in successfully', 'auth/info');
logger.write('Payment processed', 'payment/success');
logger.write('API request failed', 'api/error');

// Object logging
logger.write({
    userId: 123,
    action: 'purchase',
    amount: 99.99,
    timestamp: new Date()
}, 'transactions/log');
```

### Default File Location

```javascript
const Logger = require('@morphsync/logger');

// Set default file location in constructor
const logger = new Logger('errors/critical');

// Write without specifying location (uses default)
logger.write('Error occurred');
// => log/2025/01/15/errors/critical.log

// Override default location for specific log
logger.write('Info message', 'info/general');
// => log/2025/01/15/info/general.log
```

### Custom Log Directory

```javascript
const Logger = require('@morphsync/logger');

// Default: './log' in project root
const logger1 = new Logger();

// Custom relative directory
const logger2 = new Logger({ logDir: './logs' });
const logger3 = new Logger({ logDir: '../../log' });

// Custom absolute directory
const logger4 = new Logger({ logDir: '/var/log/myapp' });
const logger5 = new Logger({ logDir: 'C:\\logs\\myapp' }); // Windows

// If directory exists, it will be used; otherwise, it will be created
```

### Express.js Integration

```javascript
const express = require('express');
const Logger = require('@morphsync/logger');

const app = express();
const logger = new Logger();

// Log all requests
app.use((req, res, next) => {
    logger.write(`${req.method} ${req.path}`, 'requests/access');
    next();
});

// Log errors
app.use((err, req, res, next) => {
    logger.write({
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    }, 'requests/error');
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => {
    logger.write('Server started on port 3000', 'server/info');
});
```

### Error Logging

```javascript
const Logger = require('@morphsync/logger');
const logger = new Logger();

try {
    // Your code here
    throw new Error('Something went wrong');
} catch (error) {
    logger.write({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    }, 'errors/critical');
}
```

### Database Operations Logging

```javascript
const Logger = require('@morphsync/logger');
const logger = new Logger();

class UserService {
    static async createUser(userData) {
        try {
            logger.write(`Creating user: ${userData.email}`, 'database/info');
            // Database operation
            const user = await db.users.create(userData);
            logger.write(`User created successfully: ${user.id}`, 'database/success');
            return user;
        } catch (error) {
            logger.write({
                error: 'Failed to create user',
                details: error.message,
                userData: userData
            }, 'database/error');
            throw error;
        }
    }
}
```

### Cleanup Old Logs

```javascript
const Logger = require('@morphsync/logger');
const logger = new Logger();

// Manually cleanup logs older than 7 days
logger.cleanupLogs();

// Schedule automatic cleanup (using node-cron)
const cron = require('node-cron');

// Run cleanup every day at midnight
cron.schedule('0 0 * * *', () => {
    logger.write('Running log cleanup', 'system/maintenance');
    logger.cleanupLogs();
    logger.write('Log cleanup completed', 'system/maintenance');
});
```

## API Reference

### Constructor

#### `new Logger(options)`

Creates a new Logger instance.

**Parameters:**
- `options` (string | object, optional): Default file location (string) or configuration options (object)
  - If string: Sets default file location (e.g., `'folder/file'`)
  - If object:
    - `logDir` (string, optional): Custom log directory path (relative or absolute). Default: `'log'`
  - If not provided: Uses `'default/default'` as default file location

**Examples:**
```javascript
// No parameter - uses 'default/default' when fileLocation not provided
const logger = new Logger();
logger.write('Message'); // => log/2025/01/15/default/default.log

// String parameter - sets default file location
const logger = new Logger('app/error');
logger.write('Message'); // => log/2025/01/15/app/error.log
logger.write('Message', 'custom/file'); // => log/2025/01/15/custom/file.log

// Object parameter - custom log directory
const logger = new Logger({ logDir: './logs' });
const logger = new Logger({ logDir: '/var/log/myapp' });
```

### Methods

#### `write(details, fileLocation)`

Writes a log entry to the specified file.

**Parameters:**
- `details` (string | object): The log message or object to log
- `fileLocation` (string, optional): The file path within the date folder (format: `category/filename`)
  - If not provided, uses the default file location from constructor
  - If no default was set, uses `'default/default'`

**Returns:** void

**Examples:**
```javascript
// With file location specified
logger.write('User logged in', 'auth/info');
logger.write({ userId: 123 }, 'users/activity');

// Without file location (uses default)
const logger = new Logger('app/error');
logger.write('Error occurred'); // => log/2025/01/15/app/error.log

// Without file location and no default
const logger2 = new Logger();
logger2.write('Message'); // => log/2025/01/15/default/default.log
```

**Log File Path:**
```
log/YYYY/MM/DD/category/filename.log
```

#### `cleanupLogs()`

Deletes log files and directories older than 7 days.

**Returns:** void

**Example:**
```javascript
logger.cleanupLogs();
```

## Log Structure

Logs are automatically organized in a hierarchical structure:

```
log/
└── 2025/                    # Year
    └── 01/                  # Month
        └── 15/              # Day
            ├── app/
            │   ├── info.log
            │   └── error.log
            ├── auth/
            │   ├── login.log
            │   └── logout.log
            └── database/
                ├── queries.log
                └── errors.log
```

## Log Format

Each log entry includes an ISO timestamp:

```
2025-01-15T10:30:45.123Z - User logged in successfully
2025-01-15T10:31:12.456Z - {"userId": 123, "action": "purchase"}
```

## Best Practices

### 1. Use Descriptive Categories

```javascript
// Good
logger.write('Payment processed', 'payments/success');
logger.write('User not found', 'auth/error');
logger.write('Database query slow', 'performance/warning');

// Avoid
logger.write('Something happened', 'log');
```

### 2. Log Structured Data

```javascript
// Good
logger.write({
    event: 'user_login',
    userId: 123,
    ip: '192.168.1.1',
    timestamp: new Date()
}, 'auth/activity');

// Less useful
logger.write('User 123 logged in from 192.168.1.1', 'auth/activity');
```

### 3. Separate Log Categories

```javascript
logger.write('Info message', 'app/info');
logger.write('Warning message', 'app/warning');
logger.write('Error message', 'app/error');
logger.write('Debug message', 'app/debug');
```

### 4. Schedule Regular Cleanup

```javascript
const cron = require('node-cron');

// Daily cleanup at 2 AM
cron.schedule('0 2 * * *', () => {
    logger.cleanupLogs();
});
```

## Performance

- Synchronous file operations for reliability
- Automatic directory creation only when needed
- Efficient cleanup algorithm
- Minimal memory footprint

## Dependencies

None! This package uses only Node.js built-in modules:
- `fs` - File system operations
- `path` - Path manipulation

## License

ISC

## Author

Morphsync

## Related Packages

- [@morphsync/http-request](https://www.npmjs.com/package/@morphsync/http-request) - HTTP client with automatic error logging

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/morphsync/logger).
#
