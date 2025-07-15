class BitConvert {
    constructor() {
        this.buffer = new ArrayBuffer(4);
        this.view = new DataView(this.buffer);
    }
    floatToUint32(float) {
        this.view.setFloat32(0, float);
        return this.view.getUint32(0);
    }
    floatToByte(float) {
        this.view.setFloat32(0, float);
        return [this.view.getUint8(0), this.view.getUint8(1), this.view.getUint8(2), this.view.getUint8(3)];
    }
    uint32ToFloat(uint32) {
        this.view.setUint32(0, uint32);
        return this.view.getFloat32(0);
    }
    uint32ToByte(uint32) {
        this.view.setUint32(0, uint32);
        return [this.view.getUint8(0), this.view.getUint8(1), this.view.getUint8(2), this.view.getUint8(3)];
    }
    byteToFloat(byte) {
        this.view.setUint8(0, byte[0]);
        this.view.setUint8(1, byte[1]);
        this.view.setUint8(2, byte[2]);
        this.view.setUint8(3, byte[3]);
        return this.view.getFloat32(0);
    }
    byteToUint32(byte) {
        this.view.setUint8(0, byte[0]);
        this.view.setUint8(1, byte[1]);
        this.view.setUint8(2, byte[2]);
        this.view.setUint8(3, byte[3]);
        return this.view.getUint32(0);
    }
}
var bitConvert = new BitConvert();