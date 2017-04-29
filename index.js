"use strict"

/**
 * Dependencies
 */
const BlitzGlobal = require("./lib/generateBlitzGlobal.js")

/**
 * Parent Class for API-Node
 */
class Util {
    generateBlitzGlobal(unserialized) {
        new BlitzGlobal(unserialized)
    }
}


module.exports = new Util()
