"use strict"

/**
 * Dependencies
 */
const CircularJSON = require("circular-json")
const chalk = require("chalk")


/**
 * Auxiliary Class for setting up blitz.js
 */
class Util {

    /**
     * Create Interface for global blitz object on parent and child
     */
    connect(node) {
        return new Promise((resolve, reject) => {
            process.on("message", msg => {

                // Save global blitz object in this new process
                if (msg.type === "setGlobal") {

                    // Set global blitz from parent process
                    global.blitz = this.deserialize(msg.data)

                    // Create new logger from class
                    blitz.log = eval("new " + blitz.log.class + "()")
                    resolve()
                }

                // Function is being called
                if (msg.type === "call") {
                    msg.value.args = this.deserialize(msg.value.args)
                    let args = []

                    // Convert args obj to array
                    for(let i in msg.value.args) {
                        args.push(msg.value.args[i])
                    }

                    // Call target function & return if function returns value
                    node[msg.value.method].apply(node, args)
                }
            })
        })
    }


    /**
     * Deserialize objects received via stdin from parent
     */
    deserialize(obj) {
        return CircularJSON.parse(obj, function(key, value) {
            if (typeof value != 'string') return value

            // Stringified function? (Not recommended)
            return (value.substring(0, 8) == 'function' || value.includes("=>")) ? eval('(' + value + ')') : value
        })
    }
}


module.exports = new Util()
