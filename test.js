/*jshint multistr: true ,node: true*/
"use strict";

let 
    JsonReader  = require('./reader');


let reader = new JsonReader(require.resolve('./data.json'));

reader.read(json => {
    console.log(json);
    /* Do something async and resolve to make the reader read more*/
    return new Promise(function(resolve, reject){
        setTimeout(() => {
            resolve();
        }, 100);
    });
}, totalObjects => {
    console.log("totalObjects", totalObjects);
    reader.printUsage();
});
