class ModBusRTUMaster {
    constructor() {
        this.port = null;
        this.reader;
        this.writer;

        this.funCodes = [1, 2, 3, 4, 5, 6, 15, 16];

        this.mdBuffer = [];
        this.mdParseStep

        this.onReadCallback = () => { };
    }

    // 启动主站
    async startMaster(options) {
        try {
            await this.port.open(options);
            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();
        } catch {
            throw new Error(`串口初始化失败:${error}`);
        }

        await this.serialRead();
        return;
    }

    // 串口读取
    async serialRead() {
        let data = [];
        while (true) {
            data = [];
            const { value, done } = await this.reader.read();

            // 串口数据
            for (let i = 0; i < value.length; i++) {
                data.push(value[i]);
            }

            // 串口数据解析
            this.mdParse(data);

            // 回调
            this.onReadCallback(Date.now(), data);
        }
    }

    // 串口读取
    async mdParse(data) {



        let originalData = [];
        let id;
        let fun;
        let dataLen;
        let data = [];

        let step = 0;
        let dataCount = 0;
        while (true) {
            const { value, done } = await reader.read();

            // 串口数据
            for (let i = 0; i < value.length; i++) {
                originalData.push(value[i]);
            }
            console.log(originalData);

            // ModBus指令解析
            // 解析站号
            if (step === 0) {
                id = originalData[dataCount];
                if (expectId != id) {
                    reader.releaseLock();
                    throw new Error(`异常的站号，期望：${expectId}，接收：${id}`);
                }
                console.log(`站号：${id}`);

                dataCount++;
                step++;
            }

            // 解析功能码
            if (step === 1 && (originalData.length - dataCount) >= 2) {
                fun = originalData[dataCount];
                if (fun === expectFun + 0x80) {
                    let exceptionCode = originalData[dataCount + 1];
                    reader.releaseLock();
                    throw new Error(`异常功能码：${fun}，异常码:${exceptionCode}`);
                } else if (expectFun != fun) {
                    reader.releaseLock();
                    throw new Error(`未知的功能码：${fun}`);
                }
                console.log(`功能码：${fun}`);

                dataCount++;
                step++;
            }

            // 解析数据
            if (step === 2 && (originalData.length - dataCount) > 0) {
                if ([1, 2, 3, 4].includes(expectFun)) {
                    dataLen = originalData[dataCount];
                    console.log(`数据长度：${dataLen}`);

                    dataCount++;
                    step++;
                }
            }

            if (step === 3 && (originalData.length - dataCount) >= dataLen) {
                for (let i = 0; i < dataLen; i++) {
                    data.push(originalData[dataCount]);
                    dataCount++;
                }
                console.log(`数据：${data}`);

                step = 10;
            }

            // crc校验
            if (step === 10 && (originalData.length - dataCount >= 2)) {
                let crc = this.crc(originalData.slice(0, originalData.length - 2));

                if (this.arrayEqual(crc, [originalData[dataCount], originalData[dataCount + 1]])) {
                    reader.releaseLock();
                    console.log("校验成功！");
                    return data;
                } else {
                    reader.releaseLock();
                    throw new Error("crc校验失败");
                }
            }
        }
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

        return result[0] === 1 ? true : false;
    }

    // 03 读保持寄存器
    async readHoldingRegistersAsync(id, addr, len) {
        await this.busy();

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

    // 04 读输入寄存器
    async ReadInputRegistersAsync(id, addr, len) {
        await this.busy();

        // 写指令
        let data = [id, 4, addr >> 8, addr & 0xFFFF, len >> 8, len & 0xFFFF];
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([...data, ...crc]));
        writer.releaseLock();

        // 读返回值
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), 1000));
        const result = this.serialRead(id, 4);

        try {
            await Promise.race([result, timeoutPromise]);
        } catch (error) {
            throw new Error(`串口读取失败：${error}`);
        } finally {
            this.taskRunning = false;
        }

        return result;
    }

    // 05 写单个线圈
    async writeSingleCoilAsync(id, addr, value) {
        await this.busy();

        let data = [id, 5, addr >> 8, addr & 0xFFFF, value ? 0xff : 0, 0];
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([...data, ...crc]));
        writer.releaseLock();
        return;
    }

    // 06 写单个保持寄存器
    async WriteSingleRegister(id, addr, value) {
        await this.busy();

        let data = [id, 6, addr >> 8, addr & 0xFFFF, value >> 8, value & 0xFFFF];
        let crc = this.crc(data);

        let writer = this.port.writable.getWriter();
        await writer.write(new Uint8Array([...data, ...crc]));
        writer.releaseLock();
        return;
    }

    // modbus响应数据解析
    MDResAnal(data) {
        // 判断响应数据是否完整
        if (data.length < 5) {
            return false;
        }

        if ([1, 2, 3, 4].includes(data[1])) {

        }


        // 如果响应数据完整返回true，返之false
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