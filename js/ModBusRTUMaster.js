// ver1.0.0
class ModBusRTUMaster {
    constructor() {
        this.port = null;
    }

    // 01 读线圈
    async readCoilsAsync(id, addr, length) {
        // 写指令
        let addrH = addr >> 8;
        let addrL = addr & 0xFFFF;
        let lengthH = length >> 8;
        let lengthL = length & 0xFFFF;

        let data = new Uint8Array([id, 1, addrH, addrL, lengthH, lengthL]);
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([id, 1, addrH, addrL, lengthH, lengthL, crc[0], crc[1]]));
        writer.releaseLock();

        // 读返回值
        let reader = this.port.readable.getReader();
        let readValues = [];
        while (true) {
            const { value, done } = await reader.read();

            for (let i = 0; i < value.length; i++) {
                readValues.push(value[i]);
            }

            if (readValues.length >= 3) {
                if (readValues.length == readValues[2] + 5) {
                    reader.releaseLock();
                    break;
                }
            }
        }

        // crc校验
        let calcCrc = this.crc(readValues.slice(0, readValues.length - 2));
        let readCrc = readValues.slice(readValues.length - 2, readValues.length);
        if (!this.arrayEqual(calcCrc, readCrc)) {
            console.log("crc校验失败！");
            return;
        }

        // 输出
        let result = [];
        for (let i = 0; i < readValues[2]; i++) {
            let readValue = readValues[3 + i].toString(2).padStart(8, "0");
            for (let ii = 7; ii >= 0; ii--) {
                result.push(readValue[ii] == 1 ? true : false);
                if (result.length >= length) {
                    break;
                }
            }
        }

        return result;
    }

    // 03 读保持寄存器
    async readHoldingRegistersAsync(id, addr, length) {
        // 写指令
        let addrH = addr >> 8;
        let addrL = addr & 0xFFFF;
        let lengthH = length >> 8;
        let lengthL = length & 0xFFFF;

        let data = new Uint8Array([id, 3, addrH, addrL, lengthH, lengthL]);
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([id, 3, addrH, addrL, lengthH, lengthL, crc[0], crc[1]]));
        writer.releaseLock();

        // 读返回值
        let reader = this.port.readable.getReader();
        let readValues = [];
        while (true) {
            const { value, done } = await reader.read();

            for (let i = 0; i < value.length; i++) {
                readValues.push(value[i]);
            }

            if (readValues.length >= 3) {
                if (readValues.length == readValues[2] + 5) {
                    reader.releaseLock();
                    break;
                }
            }
        }

        // crc校验
        let calcCrc = this.crc(readValues.slice(0, readValues.length - 2));
        let readCrc = readValues.slice(readValues.length - 2, readValues.length);
        if (!this.arrayEqual(calcCrc, readCrc)) {
            console.log("crc校验失败！");
            return;
        }

        // 输出
        let result = [];
        for (let i = 0; i < readValues[2]; i = i + 2) {
            result.push([readValues[3 + i], readValues[3 + i + 1]]);
        }

        console.log(result);
        return result;
    }

    // 04 读输入寄存器
    async ReadInputRegistersAsync(id, addr, length) {
        // 写指令
        let addrH = addr >> 8;
        let addrL = addr & 0xFFFF;
        let lengthH = length >> 8;
        let lengthL = length & 0xFFFF;

        let data = new Uint8Array([id, 4, addrH, addrL, lengthH, lengthL]);
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([id, 4, addrH, addrL, lengthH, lengthL, crc[0], crc[1]]));
        writer.releaseLock();

        // 读返回值
        let reader = this.port.readable.getReader();
        let readValues = [];
        while (true) {
            const { value, done } = await reader.read();

            for (let i = 0; i < value.length; i++) {
                readValues.push(value[i]);
            }

            if (readValues.length >= 3) {
                if (readValues.length == readValues[2] + 5) {
                    reader.releaseLock();
                    break;
                }
            }
        }

        // crc校验
        let calcCrc = this.crc(readValues.slice(0, readValues.length - 2));
        let readCrc = readValues.slice(readValues.length - 2, readValues.length);
        if (!this.arrayEqual(calcCrc, readCrc)) {
            console.log("crc校验失败！");
            return;
        }

        // 输出
        let result = [];
        for (let i = 0; i < readValues[2]; i = i + 2) {
            result.push([readValues[3 + i], readValues[3 + i + 1]]);
        }

        console.log(result);
        return result;
    }

    // 05 写单个线圈
    async writeSingleCoilAsync(id, addr, value) {
        let addrH = addr >> 8;
        let addrL = addr & 0xFFFF;

        let data = new Uint8Array([id, 5, addrH, addrL, value ? 0xff : 0, 0]);
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([id, 5, addrH, addrL, value ? 0xff : 0, 0, crc[0], crc[1]]));
        writer.releaseLock();
        return;
    }

    // 06 写单个保持寄存器
    async WriteSingleRegister(id, addr, value){
        let addrH = addr >> 8;
        let addrL = addr & 0xFFFF;
        let valueH = value >> 8;
        let valueL = value & 0xFFFF;

        let data = new Uint8Array([id, 6, addrH, addrL, valueH, valueL]);
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([id, 6, addrH, addrL, valueH, valueL, crc[0], crc[1]]));
        writer.releaseLock();
        return;
    }

    crc(data) {
        let crcValue = 0xFFFF;

        for (let i = 0; i < data.length; i++) {
            crcValue = (crcValue & 0xFFFF) ^ data[i];
            for (let ii = 0; ii < 8; ii++) {
                if (crcValue & 0x0001) {
                    crcValue = crcValue >> 1;
                    crcValue = crcValue ^ 0xA001;
                } else {
                    crcValue = crcValue >> 1;
                }
            }
        }

        return [crcValue & 0xFF, crcValue >> 8];
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