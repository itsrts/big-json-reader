# big-json-reader

> Read json from large files by using native fs read calls.

Require `require('big-json-reader')`


## Install

```
npm install big-json-reader
```

## API

Create new instance of JsonReader
```js
let reader = new JsonReader(filepath)
```

Start reading the file

```js
reader.read(json => {
        /*return a promise*/
    }, totalObjects => {
        /*totalObjects processed*/
    });
```
The first argument expects a function which should return a promise.<br>
The reader stops reading the file after it has found a valid json, and waits for the promise to fulfill.<br>
It counts a json a process successfully if the promise was resolved. Even if the promise is rejected, the reader continues to read the file.

## Usage

```js
let JsonReader  = require('./reader');
/* provide a full path to the file to be read */
let reader = new JsonReader(require.resolve('./data.json'));

reader.read(json => {
    console.log(json);
    /* Do something async and resolve to make the reader continue*/
    return new Promise(function(resolve, reject){
        setTimeout(() => {
            resolve();
        }, 100);
    });
}, totalObjects => {
    /* totalObjects is the number of successfull objects read from the file*/
    console.log("totalObjects", totalObjects);
    /* printUsage will print the current memory used by the application*/
    reader.printUsage();
});

```

