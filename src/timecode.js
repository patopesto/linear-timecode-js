
// https://en.wikipedia.org/wiki/Linear_timecode

export function Timecode(framerate) {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.frames = 0;

    if (typeof framerate == "number") {
        this.framerate = framerate;
    }
    else {
        this.framerate = 0;
    }

    this.dropframe = false;
    this.colorframe = false;

    this.user_bits = [0, 0, 0, 0, 0, 0, 0, 0];


    this.decode_frame = function(bytes) {

        if (bytes.length != 10) {
            console.error("Invalid LTC payload size: ", bytes.length);
            return;
        }

        const sync_code = (bytes[9] << 8) | bytes[8];
        if (sync_code != 0b1011111111111100) { // sync code in MSB format
            console.error("Invalid LTC sync code");
            return;
        }

        var frames_units = bytes[0] & 0x0F;
        var frames_tens = bytes[1] & 0x03;
        this.frames = frames_tens * 10 + frames_units;
        var seconds_units = bytes[2] & 0x0F;
        var seconds_tens = bytes[3] & 0x07;
        this.seconds = seconds_tens * 10 + seconds_units;
        var minutes_units = bytes[4] & 0x0F;
        var minutes_tens = bytes[5] & 0x07;
        this.minutes = minutes_tens * 10 + minutes_units;
        var hours_units = bytes[6] & 0x0F;
        var hours_tens = bytes[7] & 0x03;
        this.hours = hours_tens * 10 + hours_units;

        this.dropframe  = Boolean((bytes[1] >> 2) & 0x01);
        this.colorframe = Boolean((bytes[1] >> 3) & 0x01);

        // console.log(this.hours+":"+this.minutes+":"+this.seconds+":"+this.frames);

    }

    this.toString = function() {
        var string = "".concat(
            this.hours < 10 ? '0' : '',
            this.hours.toString(),
            ":",
            this.minutes < 10 ? '0' : '',
            this.minutes.toString(),
            ":",
            this.seconds < 10 ? '0' : '',
            this.seconds.toString(),
            ":",
            this.frames < 10 ? '0' : '',
            this.frames.toString(),
        );
        
        return string;
    }

}


