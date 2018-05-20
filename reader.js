/*jshint multistr: true ,node: true*/
"use strict";

let 
    fs          = require('fs');

let 
    OPEN    = '{',
    CLOSE   = '}';

class CharReader {

    constructor(filepath) {
        this.filepath   = filepath;
        this.offset     = 0;
        this.position   = -1;
        this.eof        = false;
        this.buffer     = new Buffer(this.MAX_BUFFER);
        this.str        = '';
        this.fd         = fs.openSync(this.filepath, 'r');
    }

    isEof() {
        return this.eof;
    }

    fillBuffer() {
        let length = fs.readSync(this.fd, this.buffer, this.offset, this.MAX_BUFFER, null);
        if(length == 0) {
            this.eof = true;
        }
        return length;
    }

    getNextChar() {
        if(this.eof) {
            return false;
        }
        this.position++;
        let char = this.buffer[this.position];
        if(char === 0 || char === undefined) {
            // we have empty buffer
            this.fillBuffer();
            this.position = -1;
            return this.getNextChar();
        }
        char = String.fromCharCode(char);
        return char;
    }


}
CharReader.prototype.MAX_BUFFER = 1024;

class LineReader extends CharReader {

    constructor(filepath) {
        super(filepath);
    }

    getNextLine(trim = true) {
        let line = '';
        while(!this.eof) {
            let char = this.getNextChar();
            if(char == '\n') {
                if(trim) {
                    line = line.trim();
                }
                return line;
            }
            line += char;
        }
    }

}
/**
 * 
 * @param {JSON} json 
 * @returns {Promise}
 */
function onJson(json) {
}
/**
 * 
 * @param {number} totalObjects 
 */
function onEnd(totalObjects) {
}

function callback(onJSON, onEnd) {
}

class JsonReader extends CharReader {

    constructor(filepath) {
        super(filepath);
        this.json           = '';
        this.counter        = 0;
        this.totalObjects   = 0;
        this.regOpen        = new RegExp(OPEN, "g");
        this.regClose       = new RegExp(CLOSE, "g");
    }

    reset() {
        this.json = '';
        this.counter = 0;
    }

    count() {
        let open    = (this.json.match(this.regOpen) || []).length;
        let close   = (this.json.match(this.regClose) || []).length;
        return open > 0 && open == close;
    }
    
    printUsage() {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`\n\nThe script uses approximately ${Math.round(used * 100) / 100} MB`);
    }

    jsonFound() {
        return this.counter != 0;
    }

    isValid() {
        return this.counter == 0 && this.json != '' && this.count();
    }

    /**
     * 
     * @param {onJson} onJson 
     * @param {onEnd} onEnd 
     */
    read(onJson, onEnd) {
        while(!this.eof) {
            let char = this.getNextChar();
            if(char == OPEN) {
                this.counter++;
            }
            // if we have started a valide json
            if(this.jsonFound()) {
                this.json += char;
            }

            if(char == CLOSE) {
                this.counter--;
            }

            // if we have got a copmlete valid json
            if(this.isValid()) {
                try {
                    this.json = JSON.parse(this.json);
                } catch (error) {
                    this.reset();
                    return;
                }
                onJson(this.json)
                .then(() => {
                    this.totalObjects++;
                    this.reset();
                    this.read(onJson, onEnd);
                }).catch(() => {
                    this.reset();
                    this.read(onJson, onEnd);
                });
                return;
            }
        }
        if(this.eof && onEnd) {
            onEnd(this.totalObjects);
        }
    }
}

module.exports = JsonReader;