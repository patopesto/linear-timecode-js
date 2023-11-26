import { describe, it, assert, expect, test } from 'vitest';

import * as fs from 'fs';

import { Timecode } from "../src/timecode";


describe('Constructor tests', () => {

    test('new Timecode()', () => {
        expect(new Timecode()).toBeInstanceOf(Timecode);
    })

    test('timecode.framerate', () => {
        expect(new Timecode(25).framerate).toBe(25);

        expect(new Timecode(30).framerate).toBe(30);
    })

    test.skip('no new still gets you Decoder()', () => {
        let tc = Timecode();
        expect(tc).toBeInstanceOf(Timecode);
    })
})


describe('Frame parsing', () => {

    test('decode simple frame', () => {
        let frame = [0, 0, 0, 0, 0, 0, 1, 0, 252, 191]
        let tc = new Timecode();
        tc.decode_frame(frame);

        expect(tc).toEqual(
            expect.objectContaining({
                hours: 1,
                minutes: 0,
                seconds: 0,
                frames: 0
        }));
    })

    test('decode complex frame', () => {
        let frame = [1, 2, 4, 5, 9, 5, 3, 2, 252, 191]
        let tc = new Timecode();
        tc.decode_frame(frame);
        expect(tc).toEqual(
            expect.objectContaining({
                hours: 23,
                minutes: 59,
                seconds: 54,
                frames: 21
        }));
    })

    test('drop-frame flag', () => {
        let frame = [0, 0x04, 0, 0, 0, 0, 1, 0, 252, 191]
        let tc = new Timecode();
        tc.decode_frame(frame);
        expect(tc.dropframe).toEqual(true);
    })

    test('color-frame flag', () => {
        let frame = [0, 0x08, 0, 0, 0, 0, 1, 0, 252, 191]
        let tc = new Timecode();
        tc.decode_frame(frame);
        expect(tc.colorframe).toEqual(true);
    })

    test.todo("binary group flags")
    test.todo("user bits")
    test.todo("user bits @ 25fps")

})