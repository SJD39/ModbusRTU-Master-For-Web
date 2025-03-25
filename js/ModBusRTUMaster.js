class ModBusRTUMaster {
    constructor() {
        this.port = null;
        this.reader;
        this.writer;

        this.funCodes = [1, 2, 3, 4, 5, 6, 15, 16];

        // md解析
        this.mdBuffer = [];
        this.mdOriginal = [];

        this.onReadCallback = () => { };
        this.onMdParseCallback = () => { };
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

            // 推入处理缓冲区
            this.mdBuffer = [...this.mdBuffer, ...data];

            // 回调
            this.onReadCallback(Date.now(), data);
        }
    }

    // 01 读线圈
    async readCoilsAsync(id, addr, len) {
        await this.busy();

        // 写指令
        let data = [id, 1, addr >> 8, addr & 0xFFFF, len >> 8, len & 0xFFFF];
        let crc = this.crc(data);

        this.mdBuffer = [];
        await this.writer.write(new Uint8Array([...data, ...crc]));

        // 读返回值
        let result;
        let timer = setTimeout(() => { throw new Error(`超时`) }, 1000);

        try {
            result = await this.mdParse(id, 1, addr, len);
        } catch {
            throw new Error(`modbus解析错误：${error}`);
        } finally {
            clearTimeout(timer);
            this.taskRunning = false;
        }

        return result["data"];
    }

    // 03 读保持寄存器
    async readHoldingRegistersAsync(id, addr, len) {
        await this.busy();

        // 写指令
        let data = [id, 3, addr >> 8, addr & 0xFFFF, len >> 8, len & 0xFFFF];
        let crc = this.crc(data);

        this.mdBuffer = [];
        await this.writer.write(new Uint8Array([...data, ...crc]));

        // 读返回值
        let result;
        let timer = setTimeout(() => { throw new Error(`超时`) }, 1000);

        try {
            result = await this.mdParse(id, 3, addr, len);
        } catch {
            throw new Error(`modbus解析错误：${error}`);
        } finally {
            clearTimeout(timer);
            this.taskRunning = false;
        }

        return result["data"];
    }

    // 04 读输入寄存器
    async ReadInputRegistersAsync(id, addr, len) {
        await this.busy();

        // 写指令
        let data = [id, 4, addr >> 8, addr & 0xFFFF, len >> 8, len & 0xFFFF];
        let crc = this.crc(data);

        this.mdBuffer = [];
        await writer.write(new Uint8Array([...data, ...crc]));

        // 读返回值
        let result;
        let timer = setTimeout(() => { throw new Error(`超时`) }, 1000);

        try {
            result = await this.mdParse(id, 4, addr, len);
        } catch {
            throw new Error(`modbus解析错误：${error}`);
        } finally {
            clearTimeout(timer);
            this.taskRunning = false;
        }

        return result;
    }

    // 05 写单个线圈
    async writeSingleCoilAsync(id, addr, value) {
        await this.busy();

        let data = [id, 5, addr >> 8, addr & 0xFFFF, value ? 0xff : 0, 0];
        let crc = this.crc(data);

        this.mdBuffer = [];
        this.writer.write(new Uint8Array([...data, ...crc]));

        // 读返回值
        let result;
        let timer = setTimeout(() => { throw new Error(`超时`) }, 1000);

        try {
            result = await this.mdParse();
        } catch {
            throw new Error(`modbus解析错误：${error}`);
        } finally {
            clearTimeout(timer);
            this.taskRunning = false;
        }

        return result["数据"];
    }

    // 06 写单个保持寄存器
    async WriteSingleRegister(id, addr, value) {
        await this.busy();

        let data = [id, 6, addr >> 8, addr & 0xFFFF, value >> 8, value & 0xFFFF];
        let crc = this.crc(data);

        this.mdBuffer = [];
        this.writer.write(new Uint8Array([...data, ...crc]));

        // 读返回值
        let result;
        let timer = setTimeout(() => { throw new Error(`超时`) }, 1000);

        try {
            result = await this.mdParse();
        } catch {
            throw new Error(`modbus解析错误：${error}`);
        } finally {
            clearTimeout(timer);
            this.taskRunning = false;
        }

        return;
    }

    // MD解析
    async mdParse(outId, outFunCode, outAddr, outDataLen) {
        let mdParseStep = 0;
        let mdOriginal = [];
        let mdParseResult = {};

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 10));

            if (this.mdBuffer.length === 0) {
                continue;
            }

            // 读取站号
            if (mdParseStep === 0) {
                mdParseResult["站号"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["站号"]);

                mdParseStep = 1;
            }

            // 读取功能码
            if (mdParseStep === 1) {
                mdParseResult["功能码"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["功能码"]);

                if (mdParseResult["功能码"] > 128) {
                    // 读错误码
                    mdParseStep = 2;
                } else if ([1, 2, 3, 4].includes(mdParseResult["功能码"])) {
                    // 有数据长度
                    mdParseStep = 3;
                } else if ([5, 6, 21, 22].includes(mdParseResult["功能码"])) {
                    // 无数据长度
                    mdParseStep = 4;
                } else {
                    throw new Error(`未知的功能码：${mdParseResult["功能码"].toString(16).padStart(2, '0')}`);
                }
            }

            // 读取错误码
            if (mdParseStep === 2) {
                mdParseResult["异常码"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["异常码"]);

                mdParseStep = 20;
            }

            // 读取数据长度
            if (mdParseStep === 3) {
                mdParseResult["数据长度"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["数据长度"]);

                mdParseStep = 10;
            }

            // 读取数据
            if (mdParseStep === 4) {
                if (this.mdBuffer.length < 4) {
                    continue;
                }
                mdParseResult["数据"] = this.mdBuffer.splice(0, 4);
                mdOriginal.push(...mdParseResult["数据"]);

                mdParseStep = 20;
            }

            // 根据长度读数据
            if (mdParseStep === 10) {
                if ([1, 2].includes(mdParseResult["功能码"])) {
                    if (this.mdBuffer.length < mdParseResult["数据长度"]) {
                        continue;
                    }
                    mdParseResult["数据"] = this.mdBuffer.splice(0, mdParseResult["数据长度"]);
                } else if ([3, 4].includes(mdParseResult["功能码"])) {
                    if (this.mdBuffer.length < (mdParseResult["数据长度"] * 2)) {
                        continue;
                    }
                    mdParseResult["数据"] = this.mdBuffer.splice(0, mdParseResult["数据长度"] * 2);
                }
                mdOriginal.push(...mdParseResult["数据"]);

                mdParseStep = 20;
            }

            // crc校验
            if (mdParseStep === 20) {
                if (this.arrayEqual(this.crc(mdOriginal), [this.mdBuffer[0], this.mdBuffer[1]])) {
                    break;
                } else {
                    throw new Error("crc校验失败");
                }
            }
        }

        this.onMdParseCallback(Date.now(), mdParseResult);
        return mdParseResult;
    }

    // 变更状态为忙碌
    async busy() {
        while (this.taskRunning) {
            console.log("等待中。。。");
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.taskRunning = true;
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

    // 发送MD指令
    sendMd(data) {

    }
    // 生成MD指令
    generateMD(id, funCode) {
        let result = [];

        return result;
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