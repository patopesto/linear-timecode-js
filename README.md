# Linear Timecode

A pure javascript implementation of a LTC encoder/decoder.


## Features

- [x] LTC decoder
    - [x] Support for 24, 25 and 30 fps
    - [ ] Support for 29.97 fps
    - [x] Support for drop-frame and color-frame
    - [ ] Support for user bits
- [ ] LTC encoder



## Usage

### Installation

- Package is not yet published to `npm`.

```shell
npm install gitlab:patopest/linear-timecode-js
```

### Decoding

- Dependencies to read timecode from a `.wav` file
```shell
npm install -D node-wav
```

```javascript
import * as fs from 'fs';
import * as wav from 'node-wav';
import { Decoder } from "linear-timecode";

// Open wav file
let buffer = fs.readFileSync('files/timecode.wav');
let result = wav.decode(buffer);

let decoder = new Decoder(result.sampleRate);

// "frame" event emitted when LTC frame is detected
decoder.on("frame", (timecode) => {
    console.log(timecode.toString());
})

const length = 2000;
for(var i = 0; i < result.channelData[0].length; i += length) {
    let samples = result.channelData[0].slice(i, i + length);
    decoder.decode(samples) // Fead <length> samples in the decoder
}
```

## Development

- Install dependencies

```shell
npm install
```

- Run tests

```shell
npm test
```

- Build library

```shell
npm build
```


## Useful links

- Linear Timecode [wikipedia](https://en.wikipedia.org/wiki/Linear_timecode).
- Linear Timecode [specification](https://ieeexplore.ieee.org/document/7291029).