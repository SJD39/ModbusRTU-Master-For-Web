// 定义位转换类
class BitConvert {
    constructor() {
        this.buffer = new ArrayBuffer(4);
        this.view = new DataView(this.buffer);

        this.valueTypeData = {
            int16: {
                byteLen: 2,
                range:{
                    max: 32767,
                    min: -32768
                }
            },
            uint16: {
                byteLen: 2,
                range:{
                    max: 65535,
                    min: 0
                }
            },
            int32: {
                byteLen: 4,
                range:{
                    max: 2147483647,
                    min: -2147483648
                }
            },
            uint32: {
                byteLen: 4,
                range:{
                    max: 4294967295,
                    min: 0
                }
            },
            float: {
                byteLen: 4,
                range:{
                    max: 3.40282347E+38,
                    min: -3.40282347E+38
                }
            }
        }
    }

    // 数据类型转Byte
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

    // byte转数据类型
    ByteToUint16(byteArray) {
        this.view.setUint8(0, byteArray[0]);
        this.view.setUint8(1, byteArray[1]);
        return this.view.getUint16(0);
    }

    ByteToInt16(byteArray) {
        this.view.setUint8(0, byteArray[0]);
        this.view.setUint8(1, byteArray[1]);
        return this.view.getInt16(0);
    }

    ByteToUint32(byteArray) {
        this.view.setUint8(0, byteArray[0]);
        this.view.setUint8(1, byteArray[1]);
        this.view.setUint8(2, byteArray[2]);
        this.view.setUint8(3, byteArray[3]);
        return this.view.getUint32(0);
    }

    ByteToInt32(byteArray) {
        this.view.setUint8(0, byteArray[0]);
        this.view.setUint8(1, byteArray[1]);
        this.view.setUint8(2, byteArray[2]);
        this.view.setUint8(3, byteArray[3]);
        return this.view.getInt32(0);
    }

    ByteToFloat(byteArray) {
        this.view.setUint8(0, byteArray[0]);
        this.view.setUint8(1, byteArray[1]);
        this.view.setUint8(2, byteArray[2]);
        this.view.setUint8(3, byteArray[3]);
        return this.view.getFloat32(0);
    }

    // 字节序转换
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

    //  
    toByteArray(value, valueType) {
        let byteArray = [];
        if (valueType === "int16") {
            byteArray = bitConvert.int16ToByte(value);
        } else if (valueType === "uint16") {
            byteArray = bitConvert.uint16ToByte(value);
        } else if (valueType === "int32") {
            byteArray = bitConvert.int32ToByte(value);
        } else if (valueType === "uint32") {
            byteArray = bitConvert.uint32ToByte(value);
        } else if (valueType === "float") {
            byteArray = bitConvert.floatToByte(value);
        }
        return byteArray;
    }

    // 字节数组转数据类型
    toValue(byteArray, valueType) {
        let value;
        if (valueType === "int16") {
            value = bitConvert.ByteToInt16(byteArray);
        } else if (valueType === "uint16") {
            value = bitConvert.ByteToUint16(byteArray);
        } else if (valueType === "int32") {
            value = bitConvert.ByteToInt32(byteArray);
        } else if (valueType === "uint32") {
            value = bitConvert.ByteToUint32(byteArray);
        } else if (valueType === "float") {
            value = bitConvert.ByteToFloat(byteArray);
        }
        return value;
    }
}
var bitConvert = new BitConvert();
