
// https://en.wikipedia.org/wiki/Linear_timecode

export function Frame(framerate) {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.frames = 0;

    if (typeof framerate == "number") {
        this.framerate = framerate;
    }
    else {
        this.framerate = 30;
    }

    this.dropframe = false;
    this.colorframe = false;

    this.user_bits = [0, 0, 0, 0, 0, 0, 0, 0];

    this.polarity_correction = false;


    this.decode = function(bytes) {

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

         if (this.framerate == 25) { // PCb is bit 59 at 25fps
            this.polarity_correction = Boolean((bytes[7] >> 3) & 0x01);
        }
        else { // PCb is bit 27 at other fps
            this.polarity_correction = Boolean((bytes[3] >> 3) & 0x01);
        }

        // console.log(this.hours+":"+this.minutes+":"+this.seconds+":"+this.frames);
    }

    this.encode = function() {

        const bytes = new Uint8Array(10);

        var frames_tens = this.frames / 10;
        var frames_units = this.frames % 10;
        var seconds_tens = this.seconds / 10;
        var seconds_units = this.seconds % 10;
        var minutes_tens = this.minutes / 10;
        var minutes_units = this.minutes % 10;
        var hours_tens = this.hours / 10;
        var hours_units = this.hours % 10;

        bytes[0] = frames_units & 0x0F;
        bytes[1] = frames_tens & 0x03;
        bytes[2] = seconds_units & 0x0F;
        bytes[3] = seconds_tens & 0x07;
        bytes[4] = minutes_units & 0x0F;
        bytes[5] = minutes_tens & 0x07;
        bytes[6] = hours_units & 0x0F;
        bytes[7] = hours_tens & 0x03;

        bytes[1] |= (this.dropframe << 2);
        bytes[1] |= (this.colorframe << 3);

        bytes[8] = 0b11111100; // Sync word
        bytes[9] = 0b10111111;
        
        let total_bits = 0;
        for (const byte of bytes) {
            total_bits += bitCount(byte);
        }

        if (!isEven(total_bits)) { // Set Polarity Correction bit
            this.polarity_correction = true;
            if (this.framerate == 25) { // PCb is bit 59 at 25fps
                bytes[7] |= (0x01 << 3);
            }
            else { // PCb is bit 27 at other fps
                bytes[3] |= (0x01 << 3);
            }
        }

        return bytes;
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
            this.dropframe ? ";" : ":",
            this.frames < 10 ? '0' : '',
            this.frames.toString(),
        );
        
        return string;
    }

}



// From https://stackoverflow.com/a/43122214
function bitCount(n) {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}


function isEven(n) {
   return n % 2 == 0;
}


