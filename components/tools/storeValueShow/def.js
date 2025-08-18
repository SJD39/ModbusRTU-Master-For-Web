// 定义位转换类
class BitConvert {
    constructor() {
        this.buffer = new ArrayBuffer(4);
        this.view = new DataView(this.buffer);
    }

    int16ToByte(int16) {
        this.view.setInt16(0, int16);
        return [this.view.getUint8(0), this.view.getUint8(1)];
    }

    uint16ToByte(uint16) {
        this.view.setUint16(0, uint16);
        return [this.view.getUint8(0), this.view.getUint8(1)];
    }

    int32ToByte(int32) {
        this.view.setInt32(0, int32);
        return [this.view.getUint8(0), this.view.getUint8(1), this.view.getUint8(2), this.view.getUint8(3)];
    }

    uint32ToByte(uint32) {
        this.view.setUint32(0, uint32);
        return [this.view.getUint8(0), this.view.getUint8(1), this.view.getUint8(2), this.view.getUint8(3)];
    }

    floatToByte(float) {
        this.view.setFloat32(0, float);
        return [this.view.getUint8(0), this.view.getUint8(1), this.view.getUint8(2), this.view.getUint8(3)];
    }

    ByteToUint16(byteArray) {
        this.view.setUint8(0, byteArray[0], byteArray[1]);
        return this.view.getUint16(0);
    }

    ByteToUint32(byteArray) {
        this.view.setUint8(0, byteArray[0], byteArray[1], byteArray[2], byteArray[3]);
        return this.view.getUint32(0);
    }

    toLittle(byteArray) {
        let littleArray = [];
        for (let i = 0; i < byteArray.length; i++) {
            littleArray.push(byteArray[byteArray.length - 1 - i]);
        }

        return littleArray;
    }

    byteSwap(byteArray) {
        let swapArray = [];
        for (let i = 0; i < byteArray.length; i += 2) {
            swapArray.push(byteArray[i + 1], byteArray[i]);
        }
        return swapArray;
    }
}

// 定义存储值结构体
class storeValue {
    constructor() {
        this.bin = "";
        this.dec = "";
        this.hex = "";
    }
}