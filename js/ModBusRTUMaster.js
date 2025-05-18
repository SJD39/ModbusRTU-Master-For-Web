class ModBusRTUMaster {
    constructor() {
        this.taskRunning = false;
        this.port = null;
        this.reader;
        this.writer;

        this.funCodes = [1, 2, 3, 4, 5, 6, 15, 16];

        // md解析
        this.mdBuffer = [];
        this.mdOriginal = [];
        this.timer;

        this.onWriteCallback = () => { };
        this.onReadCallback = () => { };
        this.onMdParseCallback = () => { };
    }
    async writeSerial(data) {
        if (this.port === null || this.port.readable === null || this.port.writable === null) {
            throw new Error(`串口未打开`);
        }

        try {
            await this.writer.write(data);
            this.onWriteCallback(Date.now(), data);
        } catch (error) {
            throw new Error(`串口写入失败:${error}`);
        }
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
            this.mdBuffer.push(...data);
            // 回调
            this.onReadCallback(Date.now(), data);
        }
    }
    // 01 读线圈
    async readCoils(id, addr, len) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 1, "addr": addr, "num": len })));
    }
    // 02 读离散
    async readDiscrete(id, addr, len) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 2, "addr": addr, "num": len })));
    }
    // 03 读保持寄存器
    async readHoldingRegisters(id, addr, len) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 3, "addr": addr, "num": len })));
    }
    // 04 读输入寄存器
    async ReadInputRegisters(id, addr, len) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 4, "addr": addr, "num": len })));
    }
    // 05 写单个线圈
    async writeSingleCoil(id, addr, value) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 5, "addr": addr, "val": value ? 0xff00 : 0 })));
    }
    // 06 写单个保持寄存器
    async WriteSingleRegister(id, addr, value) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 6, "addr": addr, "val": value })));
    }
    // 0F 写多个线圈
    async writeMultipleCoils(id, addr, len, values) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 15, "addr": addr, "num": len, "val": values })));
    }
    // 16 写多个寄存器
    async writeMultipleRegisters(id, addr, len, values) {
        return await this.mdFunAchieve(new Uint8Array(
            this.generateCommand({ "id": id, "fun": 16, "addr": addr, "num": len, "val": values })));
    }
    async mdFunAchieve(data) {
        await this.busy();
        // 写指令
        this.mdBuffer = [];
        await this.writeSerial(data);
        // 读返回值
        let result = await this.mdParse();
        return result;
    }
    // MD解析
    async mdParse() {
        let mdParseStep = 0;
        let mdOriginal = [];
        let mdParseResult = {};

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 0));
            if (this.mdBuffer.length === 0) {
                continue;
            }
            // 读取站号、功能码
            if (mdParseStep === 0 && this.mdBuffer.length >= 2) {
                mdParseResult["slave"] = this.mdBuffer.shift();
                mdParseResult["funCode"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["slave"], mdParseResult["funCode"]);

                if (mdParseResult["funCode"] > 128) {
                    mdParseStep = 2;    // 读错误码
                } else if ([1, 2, 3, 4].includes(mdParseResult["funCode"])) {
                    mdParseStep = 3;    // 有数据长度
                } else if ([5, 6, 15, 16].includes(mdParseResult["funCode"])) {
                    mdParseStep = 4;    // 无数据长度
                } else {
                    throw new Error(`未知的功能码：${mdParseResult["funCode"].toString(16).padStart(2, '0')}`);
                }
            }
            // 读取错误码
            if (mdParseStep === 2) {
                mdParseResult["exceptionCode"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["exceptionCode"]);
                mdParseStep = 20;
            }
            // 读取数据长度
            if (mdParseStep === 3) {
                mdParseResult["byteCount"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["byteCount"]);
                mdParseStep = 10;
            }
            // 读取数据
            if (mdParseStep === 4) {
                if (this.mdBuffer.length < 4) {
                    continue;
                }
                mdParseResult["value"] = this.mdBuffer.splice(0, 4);
                mdOriginal.push(...mdParseResult["value"]);
                mdParseStep = 20;
            }
            // 根据长度读数据
            if (mdParseStep === 10) {
                if (this.mdBuffer.length < mdParseResult["byteCount"]) {
                    continue;
                }
                mdParseResult["value"] = this.mdBuffer.splice(0, mdParseResult["byteCount"]);

                // 格式化数据
                mdParseResult["formatValue"] = [];
                if ([1, 2].includes(mdParseResult["funCode"])) {
                    for (let i = 0; i < mdParseResult["value"].length; i++) {
                        let mdValue = mdParseResult["value"][i].toString(2).padStart(8, '0');
                        for (let j = 7; j >= 0; j--) {
                            mdParseResult["formatValue"].push(mdValue[j] === '1' ? true : false);
                        }
                    }
                } else if ([3, 4].includes(mdParseResult["funCode"])) {
                    const buffer = new ArrayBuffer(16);
                    const view = new DataView(buffer);
                    for (let i = 0; i < mdParseResult["value"].length; i += 2) {
                        view.setUint8(0, mdParseResult["value"][i]);
                        view.setUint8(1, mdParseResult["value"][i + 1])
                        mdParseResult["formatValue"].push(view.getUint16(0));
                    }
                }

                mdOriginal.push(...mdParseResult["value"]);
                mdParseStep = 20;
            }
            // crc校验
            if (mdParseStep === 20) {
                if (extend.arrayEqual(this.crc(mdOriginal), [this.mdBuffer[0], this.mdBuffer[1]])) {
                    break;
                } else {
                    console.log(mdParseResult);
                    throw new Error("crc校验失败");
                }
            }
        }

        this.onMdParseCallback(Date.now(), mdParseResult);
        clearTimeout(this.timer);
        this.taskRunning = false;
        return mdParseResult;
    }
    // 生成MD指令
    generateCommand(d) {
        let result = [];
        if ([1, 2, 3, 4].includes(d.fun)) {
            result = [d.id, d.fun, d.addr >> 8, d.addr & 0xFF, d.num >> 8, d.num & 0xFF];
        } else if ([5, 6].includes(d.fun)) {
            result = [d.id, d.fun, d.addr >> 8, d.addr & 0xFF, d.val >> 8, d.val & 0xFF];
        } else if ([15].includes(d.fun)) {
            result = [d.id, d.fun, d.addr >> 8, d.addr & 0xFF, d.num >> 8, d.num & 0xFF, Math.ceil(d.num / 8)];
            result.push(...d.val);
        } else if ([16].includes(d.fun)) {
            result = [d.id, d.fun, d.addr >> 8, d.addr & 0xFF, d.num >> 8, d.num & 0xFF, d.num * 2];
            const buffer = new ArrayBuffer(16);
            const view = new DataView(buffer);
            for(let i = 0; i < d.num; i++){
                view.setUint16(0, d.val[i]);
                result.push(view.getUint8(0), view.getUint8(1));
            }
        }
        return [...result, ...this.crc(result)];
    }
    // 变更状态为忙碌
    async busy() {
        while (this.taskRunning) {
            console.log("等待中。。。");
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.taskRunning = true;
        this.timer = setTimeout(() => {
            this.taskRunning = false;
            throw new Error(`timeout`);
        }, 1000);
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
    // 十六进制字符串转十进制数组
    hexStrToArray(str) {
        let result = [];
        for (let i = 0; i < str.length; i += 2) {
            result.push(parseInt(str.substr(i, 2), 16));
        }
        return result;
    }
}