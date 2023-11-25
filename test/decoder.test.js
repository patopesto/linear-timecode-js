import { describe, it, assert, expect, test } from 'vitest';

import * as fs from 'fs';
import * as wav from 'node-wav';

import { Decoder } from "../src/decoder";
import { Timecode } from "../src/timecode";
import { EventEmitter } from "events";


describe('Constructor tests', () => {

    test.skip('new Decoder()', () => {
        expect(new Decoder(44100)).toBe(EventEmitter);
    })

    test('decoder.rate', () => {
        let decoder = new Decoder(44100);
        expect(decoder.rate).toBe(44100);

        decoder = new Decoder(48000);
        expect(decoder.rate).toBe(48000);
    })

    test.skip('no new still gets you Decoder()', () => {
        expect(Decoder(44100)).toBe(Decoder);
    })
})


// reusable function for describe.each()
const decode_samples = (file, fps) => {
    // let buffer = fs.readFileSync('./test/audio/LTC_01000000_1mins_30fps_44100x8.wav');
    let buffer = fs.readFileSync(`./test/audio/${file}`);
    let result = wav.decode(buffer);

    test(`1 frame @ ${fps} fps`, () => {
        let decoder = new Decoder(result.sampleRate);

        // const length = 1471; // length of one LTC packet @ 30fps (+1 sample to ensure last transition is detected)
        const length = Math.ceil((result.sampleRate / fps) + 1); // length of one LTC packet @ 30fps (+1 sample to ensure last transition is detected)
        const samples = result.channelData[0].slice(0, length);
        decoder.decode(samples);

        expect(decoder.last_frame).toEqual(
            expect.objectContaining({
                hours: 1,
                minutes: 0,
                seconds: 0,
                frames: 0
        }));
        expect(decoder.framerate).toEqual(fps);
    })

    test(`2 frames @ ${fps} fps`, () => {
        let decoder = new Decoder(result.sampleRate);

        // 1rst frame
        const length = Math.ceil((result.sampleRate / fps) + 1);
        var samples = result.channelData[0].slice(0, length);
        decoder.decode(samples);
        
        expect(decoder.last_frame).toEqual(
            expect.objectContaining({
                hours: 1,
                minutes: 0,
                seconds: 0,
                frames: 0
        }));

        // 2nd frame
        samples = result.channelData[0].slice(length, length*2);
        decoder.decode(samples);

        expect(decoder.last_frame).toEqual(
            expect.objectContaining({
                hours: 1,
                minutes: 0,
                seconds: 0,
                frames: 1
        }));
        expect(decoder.framerate).toEqual(fps);
    })

    test('samples length is not a full LTC frame', () => {
        let decoder = new Decoder(result.sampleRate);

        const length = 1000;
        var samples = result.channelData[0].slice(0, length);
        decoder.decode(samples);

        // not enough samples to decode a frame
        expect(decoder.last_frame).toBe(null);

        samples = result.channelData[0].slice(length, length*2);
        decoder.decode(samples);

        // frame should be decoded
        expect(decoder.last_frame).toEqual(
            expect.objectContaining({
                hours: 1,
                minutes: 0,
                seconds: 0,
                frames: 0
        }));
        expect(decoder.framerate).toEqual(fps);
    })
}

describe.each([
    ["LTC_01000000_1mins_30fps_44100x8.wav", 30],
    ["LTC_01000000_1mins_24fps_44100x8.wav", 24],
    ["LTC_01000000_1mins_25fps_44100x8.wav", 25],
])('Decode samples', decode_samples);
