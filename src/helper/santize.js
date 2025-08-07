const sanitizeFileName = (filename) => {
    return filename
        .replace(/\s+/g, '_')       // spaces to underscore
        .replace(/[^a-zA-Z0-9._-]/g, '') // remove special chars except ._- 
}

module.exports = { sanitizeFileName }