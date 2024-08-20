// import { EventEmitter } from "events";
import { Frame } from "./frame";


export function Encoder(sampleRate) {
    this.rate = sampleRate;
    this.framerate = 0;
    this.state = false;

    this.high_value = 127;
    this.low_value = -127;

    this.encode = function(frame) {

        let bytes = frame.encode();
        this.framerate = frame.framerate;
        
        let num_samples = this.rate / this.framerate;
        let samples_per_bit = num_samples / 80;
        const samples = new Int8Array(num_samples);
        let offset = 0;
        let sample_remainder = 0.5;

        for (const byte of bytes) {
            for (let bit = 0; bit < 8; bit++) {

                let value = byte >> bit & 0x01;
                
                if (value == 0) { // transition as start of bit time
                    let num = Math.floor(samples_per_bit) + Math.floor(sample_remainder);
                    sample_remainder = sample_remainder + samples_per_bit - num;

                    this.state = !this.state;
                    if (this.state) {
                        samples.fill(this.high_value, offset, offset + num);
                    }
                    else {
                        samples.fill(this.low_value, offset, offset + num);
                    }
                    offset += num;
                }
                else { // transitions at start and middle of bit time
                    // First half of bit time
                    let num = Math.floor(samples_per_bit / 2) + Math.floor(sample_remainder);
                    sample_remainder = sample_remainder + (samples_per_bit / 2) - num;

                    this.state = !this.state;
                    if (this.state) {
                        samples.fill(this.high_value, offset, offset + num);
                    }
                    else {
                        samples.fill(this.low_value, offset, offset + num);
                    }
                    offset += num;

                    // Second half of bit time
                    num = Math.floor(samples_per_bit / 2) + Math.floor(sample_remainder);
                    sample_remainder = sample_remainder + (samples_per_bit / 2) - num;

                    this.state = !this.state;
                    if (this.state) {
                        samples.fill(this.high_value, offset, offset + num);
                    }
                    else {
                        samples.fill(this.low_value, offset, offset + num);
                    }
                    offset += num;
                }

            }
        }

        return samples;
    }

}