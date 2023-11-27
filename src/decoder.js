import { EventEmitter } from "events";
import { Timecode } from "./timecode.js";

/*
LTC frequencies:
24fps: 0s = 960Hz,  1s=1920Hz
25fps: 0s = 1000Hz, 1s=2000Hz
30fps: 0s = 1200Hz, 1s=2400Hz

=> 1560 Hz is middle ground between max 0s frequency and min 1s frequency
*/


export function Decoder(sampleRate) {
    this.rate = sampleRate;
    this.framerate = 0;
    this.last_frame = null;
    var state = {
        prev_sample: null,
        counter: 0,             // count number of samples on same state
        middle_transition: 0,   // transition in the middle of a bit time occured (for 1s)
        bit_buffer: "",         // decoded bits stored as string to simplify lookup and conversion during parsing
    };

    // Supports any Signed buffer (Int8, Int16, Int32, Float32, Float64) with data normalised around 0
    this.decode = function(samples) {

        var bit_array = "";

        // restoring state
        var { prev_sample, counter, middle_transition } = state;
        if (prev_sample == null) {
            prev_sample = samples[0]; // start condition
        }

        samples.forEach((sample) => {
            // Maintaining same state
            if (prev_sample > 0 && sample > 0) {
                counter++;
            }
            else if (prev_sample < 0 && sample < 0) {
                counter++;
            }
            // Transition
            else {
                const freq = this.rate / counter / 2; // freq of state time is twice the bit frequency.
                // console.log("counter / freq: ", counter, freq);
                if (freq > 900 && freq <= 1560) {
                    bit_array += '0';
                }
                else if (freq > 1560 && freq < 3000) {
                    if (middle_transition) {
                        bit_array += '1';
                        middle_transition = 0;
                    }
                    else {
                        middle_transition = 1;
                    }
                }
                else {
                    // console.error("invalid frequency: ", freq, counter, this.rate);
                }
                counter = 0;
            }
            prev_sample = sample;
        });

        // saving state
        state = { ...state, ...{ prev_sample, counter, middle_transition } };

        // attempt to compute framerate based of bitrate
        var bitrate = bit_array.length / (samples.length / this.rate);
        this.framerate = Math.round(bitrate / 80) // 80 bits per LTC frame;
        // console.log("bitrate:", bitrate, "fps:", fps);


        // merge bit buffers for parsing
        state.bit_buffer = "".concat(state.bit_buffer, bit_array);
        while (state.bit_buffer.length >= 80) {
            if (!this.parse_bits(state.bit_buffer)) {
                // if we have 2 frames worth of samples, it should have been detected, discarding bits
                if (state.bit_buffer.length > 160) {
                    state.bit_buffer = state.bit_buffer.slice(160);
                }
                break;
            }
        }

    }

    this.parse_bits = function(bit_string) {

        var sync_word_idx = bit_string.indexOf('111111111111', 0); // x12 1s cannot be found anywhere else in packet
        if (!sync_word_idx) {
            return false;
        }

        // normal direction
        if ((bit_string.substring(sync_word_idx - 2, sync_word_idx) === "00") &&
            (bit_string.substring(sync_word_idx + 12, sync_word_idx + 14) === "01")) {

            // convert to byte array
            var bytes = [];
            for(var i = sync_word_idx - 66; i < sync_word_idx + 14; i += 8) {
                // grab and inverse bit order since LSB in bit_string but parseInt need MSB
                var bits = bit_string.substring(i, i + 8).split('').reverse().join('');
                var byte = parseInt(bits, 2);
                bytes.push(byte);
            }

            // handle error generation in the timecode packet
            var timecode = new Timecode(this.framerate);
            timecode.decode_frame(bytes);
            this.last_frame = timecode;

            // TBD how to properly handle decoded packets (events and/or callbacks)
            this.emit('frame', timecode);


            // pop bits from buffer
            state.bit_buffer = state.bit_buffer.slice(sync_word_idx + 14);
            return true;
        }
        else {
            // console.error("Unsupported direction");
            return false;
        }

        return false;

    }

    // Use the event emitter browser-side on custom object, enables on() and emit() event functions
    // https://stackoverflow.com/questions/47915770/how-to-call-eventemitter-on-an-existing-object
    Object.setPrototypeOf(this, EventEmitter.prototype);


}




