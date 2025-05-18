class Extend {
    // 判断数字是否有效
    isValidNumber(num) {
        return (num !== null && num !== "" && !isNaN(Number(num)));
    }

    // 数组对比
    arrayEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
}
var extend = new Extend();

class BitConvert { 
    constructor() {
        this.buffer = new ArrayBuffer(4);
        this.view = new DataView(this.buffer);
    }
    floatToUint32(float) {
        this.view.setFloat32(0, float);
        return this.view.getUint32(0);
    }
    uint32ToFloat(uint32) {
        this.view.setUint32(0, uint32);
        return this.view.getFloat32(0);
    }
    floatToUint16(float) {
        this.view.setFloat32(0, float);
        return [this.view.getUint16(0), this.view.getUint16(2)];
    }
    uint16ToFloat(uint16) {
        this.view.setUint16(0, uint16[0]);
        this.view.setUint16(2, uint16[1]);
        return this.view.getFloat32(0);
    }
}
var bitConvert  = new BitConvert();