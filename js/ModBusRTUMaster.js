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
        if(this.port === null || this.port.readable === null || this.port.writable === null){
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
    async readCoilsAsync(id, addr, len) {
        await this.busy();
        // 写指令
        this.mdBuffer = [];
        await this.writeSerial(new Uint8Array(this.generateCommand(id, 1, addr, len)));
        // 读返回值
        let result = await this.mdParse(id, 1, addr, len);
        return result["data"];
    }
    // 02 读离散
    async readDiscreteAsync(id, addr, len) {
        await this.busy();
        // 写指令
        this.mdBuffer = [];
        await this.writeSerial(new Uint8Array(this.generateCommand(id, 2, addr, len)));
        // 读返回值
        let result = await this.mdParse(id, 2, addr, len);
        return result["data"];
    }
    // 03 读保持寄存器
    async readHoldingRegistersAsync(id, addr, len) {
        await this.busy();
        // 写指令
        this.mdBuffer = [];
        await this.writeSerial(new Uint8Array(this.generateCommand(id, 3, addr, len)));
        // 读返回值
        let result = await this.mdParse(id, 3, addr, len);
        return result["data"];
    }
    // 04 读输入寄存器
    async ReadInputRegistersAsync(id, addr, len) {
        await this.busy();
        // 写指令
        this.mdBuffer = [];
        await this.writeSerial(new Uint8Array(this.generateCommand(id, 4, addr, len)));
        // 读返回值
        let result = await this.mdParse(id, 4, addr, len);
        return result;
    }
    // 05 写单个线圈
    async writeSingleCoilAsync(id, addr, value) {
        await this.busy();
        // 写指令
        this.mdBuffer = [];
        await this.writeSerial(new Uint8Array(this.generateCommand(id, 5, addr, value ? 0xff : 0)));
        // 读返回值
        let result = await this.mdParse();
        return result["数据"];
    }
    // 06 写单个保持寄存器
    async WriteSingleRegister(id, addr, value) {
        await this.busy();
        // 写指令
        this.mdBuffer = [];
        await this.writeSerial(new Uint8Array(this.generateCommand(id, 6, addr, value)));
        // 读返回值
        let result = await this.mdParse();
        return;
    }
    // 用户输入指令
    async sendUserCommand(command) {
        // 解析指令
        // 站号
        let slaveId = parseInt(command.slice(0, 2), 16);
        this.checkId(slaveId);
        // 功能码
        let funCode = parseInt(command.slice(2, 4), 16);
        this.checkFunCode(funCode);
        if (funCode === 1) {
            // 读线圈
            let addr = parseInt(command.slice(4, 8), 16);
            let len = parseInt(command.slice(8, 12), 16);
            if (len > 2000) {
                throw new Error(`线圈长度不能超过2000`);
            }
            let result = await this.readCoilsAsync(slaveId, addr, len);
        }
    }
    // MD解析
    async mdParse() {
        let mdParseStep = 0;
        let mdOriginal = [];
        let mdParseResult = {};

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 10));
            if (this.mdBuffer.length === 0) {
                continue;
            }
            // 读取站号
            if (mdParseStep === 0 && this.mdBuffer.length >= 2) {
                mdParseResult["站号"] = this.mdBuffer.shift();
                mdParseResult["功能码"] = this.mdBuffer.shift();
                mdOriginal.push(mdParseResult["站号"], mdParseResult["功能码"]);

                this.checkId(mdParseResult["站号"]);

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
        clearTimeout(this.timer);
        this.taskRunning = false;
        return mdParseResult;
    }

    // 生成MD指令
    generateCommand(id, funCode, addr, num, value, byteNum) {
        let result = [];

        if ([1, 2, 3, 4].includes(funCode)) {
            result = [id, funCode, addr >> 8, addr & 0xFFFF, num >> 8, num & 0xFFFF];
        } else if ([5, 6].includes(funCode)) {
            result = [id, funCode, addr >> 8, addr & 0xFFFF, value >> 8, value & 0xFFFF];
        } else if ([15, 16].includes(funCode)) { }

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

    // 校验站号
    checkId(id) {
        if (id < 1 || id > 247) {
            throw new Error(`错误的站号：${id}`);
        }
    }
    // 校验功能码
    checkFunCode(funCode) {
        if (![1, 2, 3, 4, 5, 6, 15, 16].includes(funCode)) {
            throw new Error(`错误的功能码：${funCode}`);
        }
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