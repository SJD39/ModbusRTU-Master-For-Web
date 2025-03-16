// ver1.0.0
class ModBusRTUMaster {
    constructor() {
        this.port = null;

        this.taskQueue = [];
        this.taskRunning = false;

        this.funCodes = [1, 2, 3, 4, 5, 6, 15, 16];
        this.analysisEn = false;
    }

    // 01 读线圈
    async readCoilsAsync(id, addr, length) {
        while (this.taskRunning) {
            console.log("等待中。。。");
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        console.log("开始执行");
        this.taskRunning = true;

        // 写指令
        let addrH = addr >> 8;
        let addrL = addr & 0xFFFF;
        let lengthH = length >> 8;
        let lengthL = length & 0xFFFF;

        let data = new Uint8Array([id, 1, addrH, addrL, lengthH, lengthL]);
        let crc = this.crc(data);

        let writer;
        try {
            writer = this.port.writable.getWriter();
        } catch (error) {
            this.taskRunning = false;
            throw new Error("获取写入器失败");
        }

        await writer.write(new Uint8Array([id, 1, addrH, addrL, lengthH, lengthL, crc[0], crc[1]]));
        writer.releaseLock();

        // 读返回值
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), 1000));
        const result = this.serialRead(id, 1);

        try{
            return await Promise.race([result, timeoutPromise]);
        }catch(error){
            throw new Error(`串口读取失败：${error}`);
        }finally{
            this.taskRunning = false;
        }
    }

    // 串口读取
    async serialRead(id, funCode) {
        // 获取读取器
        let reader;
        try {
            reader = this.port.readable.getReader();
        } catch (error) {
            throw new Error("获取读取器失败");
        }

        // 以下为modbus主站响应实现
        let step = 0;
        let data = [];
        let dataLen;
        let dataCount = 0;
        let result = [];
        while (true) {
            const { value, done } = await reader.read();

            // 串口数据
            for (let i = 0; i < value.length; i++) {
                data.push(value[i]);
            }
            console.log(data);

            // ModBus指令解析
            // 解析站号
            if (step == 0) {
                if (id != data[dataCount]) {
                    console.log(`站号错误：${data[dataCount]}`);
                    throw new Error("站号错误");
                }
                console.log(`站号：${data[dataCount]}`);

                dataCount++;
                step++;
            }

            // 解析功能码
            if (step == 1 && (data.length - dataCount > 0)) {
                if (funCode != data[dataCount]) {
                    console.log(`功能码错误： ${funCode},${data[dataCount]}`);
                    throw new Error("功能码错误");
                }
                console.log(`功能码：${data[dataCount]}`);

                dataCount++;
                step++;
            }

            // 解析数据
            if (step == 2 && (data.length - dataCount > 0)) {
                if ([1, 2, 3, 4].includes(funCode)) {
                    dataLen = data[dataCount];
                    console.log(`数据长度：${data[dataCount]}`);

                    dataCount++;
                    step++;
                }
            }

            if (step == 3 && (data.length - dataCount >= dataLen)) {
                console.log(`数据：`);
                for (let i = 0; i < dataLen; i++) {
                    console.log(`${data[dataCount]}`);
                    result.push(data[dataCount]);
                    dataCount++;
                }
                step = 10;
            }

            // crc校验
            if (step == 10 && (data.length - dataCount >= 2)) {
                let crc = this.crc(data.slice(0, data.length - 2));

                if (this.arrayEqual(crc, [data[dataCount], data[dataCount + 1]])) {
                    console.log("校验成功！");
                    reader.releaseLock();
                    return result;
                } else {
                    console.log("校验失败！");
                    reader.releaseLock();
                    throw new Error("crc校验失败");
                }
            }
        }
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