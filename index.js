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
     * Set up uncaughtException listener for each worker
     */
    constructor() {
        process.on('uncaughtException', err => {
            if (blitz.config.local.environment.toLowerCase() === "production") {
                console.error(err)
            } else {
                throw err
            }
        })
        process.on("unhandledRejection", err => {
            if (blitz.config.local.environment.toLowerCase() === "production") {
                console.error(err)
            } else {
                throw err
            }
        })
    }


    /**
     * Listen for global blitz config object
     */
    setGlobal() {
        return new Promise(resolve => {
            process.on("message", msg => {
                if (msg.type === "setGlobal") {

                    // Set global blitz from parent process
                    global.blitz = this.deserialize(msg.data)

                    // Create new logger from class
                    blitz.log = eval("new " + blitz.log.class + "()")
                    resolve()
                }
            })
        })
    }


    /**
     * Create Interface for global blitz object on parent and child
     */
    expose(node) {
        process.on("message", msg => {

            // Function is being called
            if (msg.type === "call") {
                msg.value.args = this.deserialize(msg.value.args)
                let args = []

                // Convert args obj to array
                for (let i in msg.value.args) {
                    args.push(msg.value.args[i])
                }

                // Call target function & return if function returns value
                node[msg.value.method].apply(node, args)
            }
        })
    }


    /**
     * Deserialize objects received via stdin from parent
     */
    deserialize(obj) {
        return CircularJSON.parse(obj, (key, value) => {
            if (typeof value != 'string') return value

            // Stringified function? (Not recommended)
            if (value.substring(0, 8) == 'function' || value.includes(" => ")) {
                return eval("(" + value + ")")
            }

            // Primitive datatype
            else {
                return value
            }
        })
    }
}


module.exports = new Util()
