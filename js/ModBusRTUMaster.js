// ver1.0.0
class ModBusRTUMaster {
    constructor() {
        this.port = null;

        this.taskQueue = [];
        this.taskRunning = false;

        this.funCodes = [1, 2, 3, 4, 5, 6, 15, 16];
        this.analysisEn = false;
    }

    // 变更状态为忙碌
    async busy() {
        while (this.taskRunning) {
            console.log("等待中。。。");
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.taskRunning = true;
    }

    // 01 读线圈
    async readCoilsAsync(id, addr, len) {
        await this.busy();

        // 写指令
        let data = [id, 1, addr >> 8, addr & 0xFFFF, len >> 8, len & 0xFFFF];
        let crc = this.crc(data);

        const writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([...data, ...crc]));
        writer.releaseLock();

        // 读返回值
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), 1000));
        const result = this.serialRead(id, 1);

        try {
            await Promise.race([result, timeoutPromise]);
        } catch (error) {
            throw new Error(`串口读取失败：${error}`);
        } finally {
            this.taskRunning = false;
        }

        return result[0] == 1 ? true : false;
    }

    // 03 读保持寄存器
    async readHoldingRegistersAsync(id, addr, len) {
        // 写指令
        let data = [id, 3, addr >> 8, addr & 0xFFFF, len >> 8, len & 0xFFFF];
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([...data, ...crc]));
        writer.releaseLock();

        // 读返回值
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), 1000));
        const result = this.serialRead(id, 3);

        try {
            await Promise.race([result, timeoutPromise]);
        } catch (error) {
            throw new Error(`串口读取失败：${error}`);
        } finally {
            this.taskRunning = false;
        }

        return result;
    }

    // 串口读取
    async serialRead(expectId, expectFun) {
        // 获取读取器
        let reader;
        try {
            reader = this.port.readable.getReader();
        } catch (error) {
            throw new Error("获取读取器失败");
        }

        // 以下为modbus主站响应实现
        let originalData = [];
        let id;
        let fun;
        let dataLen;
        let data = [];

        let step = 0;
        let dataCount = 0;
        while (true) {
            const { value, done } = await reader.read();

            try {
                // 串口数据
                for (let i = 0; i < value.length; i++) {
                    originalData.push(value[i]);
                }
                console.log(originalData);

                // ModBus指令解析
                // 解析站号
                if (step == 0) {
                    id = originalData[dataCount];
                    if (expectId != id) {
                        throw new Error(`站号错误：${id}`);
                    }
                    console.log(`站号：${id}`);

                    dataCount++;
                    step++;
                }

                // 解析功能码
                if (step == 1 && (originalData.length - dataCount > 0)) {
                    fun = originalData[dataCount];
                    if (expectFun != fun) {
                        throw new Error(`功能码错误:${fun}`);
                    }
                    console.log(`功能码：${fun}`);

                    dataCount++;
                    step++;
                }

                // 解析数据
                if (step == 2 && (originalData.length - dataCount > 0)) {
                    if ([1, 2, 3, 4].includes(expectFun)) {
                        dataLen = originalData[dataCount];
                        console.log(`数据长度：${dataLen}`);

                        dataCount++;
                        step++;
                    }
                }

                if (step == 3 && (originalData.length - dataCount >= dataLen)) {
                    for (let i = 0; i < dataLen; i++) {
                        data.push(originalData[dataCount]);
                        dataCount++;
                    }
                    console.log(`数据：${data}`);

                    step = 10;
                }

                // crc校验
                if (step == 10 && (originalData.length - dataCount >= 2)) {
                    let crc = this.crc(originalData.slice(0, originalData.length - 2));

                    if (this.arrayEqual(crc, [originalData[dataCount], originalData[dataCount + 1]])) {
                        reader.releaseLock();
                        console.log("校验成功！");
                        return data;
                    } else {
                        throw new Error("crc校验失败");
                    }
                }
            } catch (error) {
                reader.releaseLock();
                throw new Error(`串口读取失败：${error}`);
            }
        }
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
    async WriteSingleRegister(id, addr, value) {
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



    // crc校验生成
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