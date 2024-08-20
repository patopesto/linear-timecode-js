import { describe, it, assert, expect, test } from 'vitest';

import * as fs from 'fs';

import { Frame } from "../src/frame";


describe('Constructor tests', () => {

    test('new Frame()', () => {
        expect(new Frame()).toBeInstanceOf(Frame);
    })

    test('frame.framerate', () => {
        expect(new Frame(25).framerate).toBe(25);

        expect(new Frame(30).framerate).toBe(30);
    })

    test.skip('no new still gets you Frame()', () => {
        let tc = Frame();
        expect(tc).toBeInstanceOf(Frame);
    })
})


describe('Frame parsing', () => {

    test('decode simple frame', () => {
        let frame = [0, 0, 0, 0, 0, 0, 1, 0, 252, 191];
        let tc = new Frame();
        tc.decode(frame);

        expect(tc).toEqual(
            expect.objectContaining({
                hours: 1,
                minutes: 0,
                seconds: 0,
                frames: 0
        }));
    })

    test('decode complex frame', () => {
        let frame = [1, 2, 5, 5, 9, 5, 3, 2, 252, 191];
        let tc = new Frame();
        tc.decode(frame);
        expect(tc).toEqual(
            expect.objectContaining({
                hours: 23,
                minutes: 59,
                seconds: 55,
                frames: 21
        }));
    })

    test('drop-frame flag', () => {
        let frame = [0, 0x04, 0, 0, 0, 0, 1, 0, 252, 191];
        let tc = new Frame();
        tc.decode(frame);
        expect(tc.dropframe).toEqual(true);
    })

    test('color-frame flag', () => {
        let frame = [0, 0x08, 0, 0, 0, 0, 1, 0, 252, 191];
        let tc = new Frame();
        tc.decode(frame);
        expect(tc.colorframe).toEqual(true);
    })

    test('polarity correction bit @ 25 fps', () => {
        let frame = [1, 0, 0, 0, 0, 0, 1, 8, 252, 191];
        let tc = new Frame(25);
        tc.decode(frame);
        expect(tc.polarity_correction).toEqual(true);
    })

    test('polarity correction bit @ 24 fps', () => {
        let frame = [1, 0, 0, 8, 0, 0, 1, 0, 252, 191];
        let tc = new Frame(24);
        tc.decode(frame);
        expect(tc.polarity_correction).toEqual(true);
    })

    test('polarity correction bit @ 30 fps', () => {
        let frame = [1, 0, 0, 8, 0, 0, 1, 0, 252, 191];
        let tc = new Frame(30);
        tc.decode(frame);
        expect(tc.polarity_correction).toEqual(true);
    })

    test.todo("binary group flags")
    test.todo("user bits")
    test.todo("user bits @ 25fps")

})


describe('Frame encoding', () => {

    test('encode simple frame', () => {
        let tc = new Frame(30);
        tc.hours = 1;
        tc.minutes = 0;
        tc.seconds = 0;
        tc.frames = 0;
        let frame = tc.encode();
        let expected = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 0, 252, 191]);

        expect(frame).toStrictEqual(expected);
    })

    test('encode complex frame', () => {
        let tc = new Frame(30);
        tc.hours = 23;
        tc.minutes = 59;
        tc.seconds = 55;
        tc.frames = 21;
        let frame = tc.encode();
        let expected = new Uint8Array([1, 2, 5, 5, 9, 5, 3, 2, 252, 191]);

        expect(frame).toStrictEqual(expected);
    })

    test('drop-frame flag', () => {
        let tc = new Frame(30);
        tc.hours = 1;
        tc.minutes = 0;
        tc.seconds = 0;
        tc.frames = 1;
        tc.dropframe = true;
        let frame = tc.encode();
        let expected = new Uint8Array([1, 0x04, 0, 0, 0, 0, 1, 0, 252, 191]);

        expect(frame).toStrictEqual(expected);
    })

    test('color-frame flag', () => {
        let tc = new Frame(30);
        tc.hours = 1;
        tc.minutes = 0;
        tc.seconds = 0;
        tc.frames = 0;
        tc.colorframe = true;
        let frame = tc.encode();
        let expected = new Uint8Array([0, 0x08, 0, 8, 0, 0, 1, 0, 252, 191]);

        expect(frame).toStrictEqual(expected);
    })

    test('polarity correction bit @ 25 fps', () => {
        let tc = new Frame(25);
        tc.hours = 1;
        tc.minutes = 0;
        tc.seconds = 0;
        tc.frames = 1;
        let frame = tc.encode();
        let expected = new Uint8Array([1, 0, 0, 0, 0, 0, 1, 8, 252, 191]);

        expect(frame).toStrictEqual(expected);
    })

    test('polarity correction bit @ 24 fps', () => {
        let tc = new Frame(24);
        tc.hours = 1;
        tc.minutes = 0;
        tc.seconds = 0;
        tc.frames = 1;
        let frame = tc.encode();
        let expected = new Uint8Array([1, 0, 0, 8, 0, 0, 1, 0, 252, 191]);

        expect(frame).toStrictEqual(expected);
    })

    test('polarity correction bit @ 30 fps', () => {
        let tc = new Frame(30);
        tc.hours = 1;
        tc.minutes = 0;
        tc.seconds = 0;
        tc.frames = 1;
        let frame = tc.encode();
        let expected = new Uint8Array([1, 0, 0, 8, 0, 0, 1, 0, 252, 191]);

        expect(frame).toStrictEqual(expected);
    })

    test.todo("binary group flags")
    test.todo("user bits")
    test.todo("user bits @ 25fps")

})


describe('Round trip', () => {

    test('frame @ 24 fps enc->dec', () => {
        let frame1 = new Frame(24);
        frame1.hours = 23;
        frame1.minutes = 59;
        frame1.seconds = 55;
        frame1.frames = 21;
        let bytes = frame1.encode();

        let frame2 = new Frame(24);
        frame2.decode(bytes);

        expect(JSON.stringify(frame2)).toEqual(JSON.stringify(frame1));
    })

    test('frame @ 25 fps enc->dec', () => {
        let frame1 = new Frame(25);
        frame1.hours = 23;
        frame1.minutes = 59;
        frame1.seconds = 55;
        frame1.frames = 21;
        let bytes = frame1.encode();

        let frame2 = new Frame(25);
        frame2.decode(bytes);

        expect(JSON.stringify(frame2)).toEqual(JSON.stringify(frame1));
    })

    test('frame @ 30 fps enc->dec', () => {
        let frame1 = new Frame(30);
        frame1.hours = 23;
        frame1.minutes = 59;
        frame1.seconds = 55;
        frame1.frames = 21;
        let bytes = frame1.encode();

        let frame2 = new Frame(30);
        frame2.decode(bytes);

        expect(JSON.stringify(frame2)).toEqual(JSON.stringify(frame1));
    })

    test('frame @ 24 fps dec->enc', () => {
        let bytes1 = new Uint8Array([1, 2, 5, 5, 9, 5, 3, 2, 252, 191]);
        let frame = new Frame(24);
        frame.decode(bytes1);

        let bytes2 = frame.encode();

        expect(bytes1).toEqual(bytes2);
    })

    test('frame @ 25 fps dec->enc', () => {
        let bytes1 = new Uint8Array([1, 2, 5, 5, 9, 5, 3, 2, 252, 191]);
        let frame = new Frame(25);
        frame.decode(bytes1);

        let bytes2 = frame.encode();

        expect(bytes1).toEqual(bytes2);
    })

    test('frame @ 30 fps dec->enc', () => {
        let bytes1 = new Uint8Array([1, 2, 5, 5, 9, 5, 3, 2, 252, 191]);
        let frame = new Frame(30);
        frame.decode(bytes1);

        let bytes2 = frame.encode();

        expect(bytes1).toEqual(bytes2);
    })

})