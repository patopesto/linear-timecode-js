import { describe, it, assert, expect, test } from 'vitest';

import * as fs from 'fs';
import { WaveFile } from 'wavefile';

import { Encoder } from "../src/encoder";
import { Frame } from "../src/frame";
import { EventEmitter } from "events";


describe('Constructor tests', () => {

    test.skip('new Encoder()', () => {
        expect(new Encoder(44100)).toBe(Encoder);
    })

    test('Encoder.rate', () => {
        let encoder = new Encoder(44100);
        expect(encoder.rate).toBe(44100);

        encoder = new Encoder(48000);
        expect(encoder.rate).toBe(48000);
    })

    test.skip('no new still gets you Encoder()', () => {
        expect(Encoder(44100)).toBe(Encoder);
    })
})


describe('Encode samples', () => {

    test("1 frame @ 30 fps", () => {
        let frame = new Frame(30);
        frame.hours = 1;
        frame.minutes = 0;
        frame.seconds = 0;
        frame.frames = 0;

        let encoder = new Encoder(44100);
        let samples = encoder.encode(frame);
        let length = 44100 / 30;

        expect(samples).toHaveLength(length);
        expect(samples.includes(0)).toBe(false);
        expect(Math.max(...samples)).toEqual(127);
        expect(Math.min(...samples)).toEqual(-127);
    })

    test("1 frame @ 25 fps", () => {
        let frame = new Frame(25);
        frame.hours = 1;
        frame.minutes = 0;
        frame.seconds = 0;
        frame.frames = 0;

        let encoder = new Encoder(44100);
        let samples = encoder.encode(frame);
        let length = 44100 / 25;

        expect(samples).toHaveLength(length);
        expect(samples.includes(0)).toBe(false);
        expect(Math.max(...samples)).toEqual(127);
        expect(Math.min(...samples)).toEqual(-127);
    })

    test("1 frame @ 24 fps", () => {
        let frame = new Frame(24);
        frame.hours = 1;
        frame.minutes = 0;
        frame.seconds = 0;
        frame.frames = 0;

        let encoder = new Encoder(48000);
        let samples = encoder.encode(frame);
        let length = 48000 / 24;

        expect(samples).toHaveLength(length);
        expect(samples.includes(0)).toBe(false);
        expect(Math.max(...samples)).toEqual(127);
        expect(Math.min(...samples)).toEqual(-127);
    })

})