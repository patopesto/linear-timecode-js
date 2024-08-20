import { describe, it, assert, expect, test } from 'vitest';

import * as fs from 'fs';
import { WaveFile } from 'wavefile';

import { Decoder } from "../src/decoder";
import { Encoder } from "../src/encoder";
import { Frame } from "../src/frame";
import { EventEmitter } from "events";




const encode_decode = (fps, samplerate) => {

    test(`1 frame @ ${fps} fps (${samplerate}Hz)`, () => {
        let frame = new Frame(fps);
        frame.hours = 10;
        frame.minutes = 1;
        frame.seconds = 22;
        frame.frames = 9;

        let encoder = new Encoder(samplerate);
        let samples = encoder.encode(frame);

        let decoder = new Decoder(samplerate);
        decoder.decode(samples);
         // add an extra sample so the end of frame is triggered in the decoder
        decoder.decode([0]);

        expect(decoder.last_frame).toEqual(
            expect.objectContaining({
                hours: frame.hours,
                minutes: frame.minutes,
                seconds: frame.seconds,
                frames: frame.frames
        }));
    }) 
}


describe.each([
    [30, 44100],
    [24, 44100],
    [25, 44100],
    [30, 48000],
    [24, 48000],
    [25, 48000],
])('Intergration test: encode->decode', encode_decode);
