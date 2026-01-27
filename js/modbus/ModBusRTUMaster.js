class ModBusRTUMaster {
    constructor() {
        this.working = false;
        this.taskRunning = false;
        this.port = null;
        this.port_options = null;
        this.reader;
        this.writer;

        this.funCodes = [1, 2, 3, 4, 5, 6, 15, 16];

        // md解析
        this.dataBuffer = [];
        this.mdOriginal = [];
        this.byteOrder = 'little-endian';
        this.timer;

        this.onWriteCallback = () => { };
        this.onReadCallback = () => { };
        this.onMdParseCallback = () => { };

        // 启动主循环
        this.run();
    }

    // 主循环
    async run() {
        while (true) {
            if (this.working === false) {
                await new Promise(resolve => setTimeout(resolve, 0));
                continue;
            }

            await this.serialRead();
        }
    }

    // 启动主站
    async startMaster(port) {
        try {
            this.port = port;
        } catch (e) {
            throw new Error(`串口初始化失败:${e}`);
        }
        this.working = true;

        return;
    }

    // 停止主站
    async stopMaster() {
        // 停止主站
        this.working = false;

        this.dataBuffer = [];
    }

    // 串口读取
    async serialRead() {
        let read_result;

        this.reader = this.port.readable.getReader();
        try {
            read_result = await this.reader.read();
        } catch (e) {
            throw new Error(`串口读取失败:${e}`);
        } finally {
            await this.reader.releaseLock();
        }

        this.dataBuffer.push(...read_result.value);
        this.onReadCallback(Date.now(), read_result.value);
    }

    // 串口写入
    async writeSerial(data) {
        this.writer = this.port.writable.getWriter();
        try {
            await this.writer.write(data);
        } catch (error) {
            throw new Error(`串口写入失败:${error}`);
        } finally {
            await this.writer.releaseLock();
        }

        this.onWriteCallback(Date.now(), data);
    }

    // 01 读线圈
    async readCoils(id, addr, len) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 1, "addr": addr, "num": len }));
    }
    // 02 读离散
    async readDiscrete(id, addr, len) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 2, "addr": addr, "num": len }));
    }
    // 03 读保持寄存器
    async readHoldingRegisters(id, addr, len) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 3, "addr": addr, "num": len }));
    }
    // 04 读输入寄存器
    async ReadInputRegisters(id, addr, len) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 4, "addr": addr, "num": len }));
    }
    // 05 写单个线圈
    async writeSingleCoil(id, addr, value) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 5, "addr": addr, "val": value ? 0xff00 : 0 }));
    }
    // 06 写单个保持寄存器
    async WriteSingleRegister(id, addr, value) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 6, "addr": addr, "val": value }));
    }
    // 0F 写多个线圈
    async writeMultipleCoils(id, addr, len, values) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 15, "addr": addr, "num": len, "val": values }));
    }
    // 16 写多个寄存器
    async writeMultipleRegisters(id, addr, len, values) {
        return await this.action(
            this.build_Command({ "id": id, "fun": 16, "addr": addr, "num": len, "val": values }));
    }
    async action(data) {
        await this.busy();
        this.dataBuffer = [];

        // 写指令
        await this.writeSerial(data);

        // 读返回值
        let result = await this.parse_data();

        return result;
    }

    // 变更状态为忙碌
    async busy() {
        while (this.taskRunning) {
            console.log("等待中。。。");
            await new Promise(resolve => setTimeout(resolve, 5));
        }
        this.taskRunning = true;
    }

    // MD解析
    async parse_data() {
        let parse_Step = 0;
        let index = 0;
        let result = {};
        let parse_timeout = false;
        let parse_timer = setTimeout(() => {
            parse_timeout = true;
            result = { "error": "timeout" };
        }, 100);

        while (!parse_timeout) {
            // 读取站号、功能码
            if (parse_Step === 0 && this.dataBuffer.length >= 2 + index) {
                result["slave"] = this.dataBuffer[index];
                index++;

                result["funCode"] = this.dataBuffer[index];
                index++;

                if (result["funCode"] > 128) {
                    parse_Step = 2;    // 读错误码
                } else if ([1, 2, 3, 4].includes(result["funCode"])) {
                    parse_Step = 3;    // 有数据长度
                } else if ([5, 6, 15, 16].includes(result["funCode"])) {
                    parse_Step = 4;    // 无数据长度
                } else {
                    throw new Error(`未知的功能码：${result["funCode"].toString(16).padStart(2, '0')}`);
                }
            }

            // 读取错误码
            if (parse_Step === 2 && this.dataBuffer.length >= 1 + index) {
                result["exceptionCode"] = this.dataBuffer[index];
                index++;

                parse_Step = 20;
            }

            // 读取数据长度
            if (parse_Step === 3 && this.dataBuffer.length >= 1 + index) {
                result["byteCount"] = this.dataBuffer[index];
                index++;

                parse_Step = 10;
            }

            // 读取数据
            if (parse_Step === 4 && this.dataBuffer.length >= 4 + index) {
                result["value"] = this.dataBuffer.slice(index, index + 4);
                index += 4;

                parse_Step = 20;
            }

            // 根据长度读数据
            if (parse_Step === 10 && this.dataBuffer.length >= result["byteCount"] + index) {
                result["value"] = this.dataBuffer.slice(index, index + result["byteCount"]);
                index += result["byteCount"];

                parse_Step = 20;
            }

            // crc校验
            if (parse_Step === 20 && this.dataBuffer.length >= 2 + index) {
                if (extend.arrayEqual(this.crc(this.dataBuffer.slice(0, index)), [this.dataBuffer[index], this.dataBuffer[index + 1]])) {
                    break;
                } else {
                    throw new Error("crc校验失败");
                }
            }

            await new Promise(resolve => setTimeout(resolve, 0));
        }

        clearTimeout(parse_timer);

        this.onMdParseCallback(Date.now(), result);

        return result;
    }

    // 生成modbus指令
    build_Command(param) {
        let command = [];

        if ([1, 2, 3, 4].includes(param.fun)) {
            // 读线圈、读离散、读保持寄存器、读输入寄存器
            command = [param.id, param.fun, param.addr >> 8, param.addr & 0xFF, param.num >> 8, param.num & 0xFF];
        } else if ([5, 6].includes(param.fun)) {
            // 写单个线圈、写单个寄存器
            command = [param.id, param.fun, param.addr >> 8, param.addr & 0xFF, param.val >> 8, param.val & 0xFF]
        } else if ([15].includes(param.fun)) {
            // 写多个线圈
            command = [param.id, param.fun, param.addr >> 8, param.addr & 0xFF, param.num >> 8, param.num & 0xFF, Math.ceil(param.num / 8)];
            command.push(...param.val);
        } else if ([16].includes(param.fun)) {
            // 写多个寄存器
            command = [param.id, param.fun, param.addr >> 8, param.addr & 0xFF, param.num >> 8, param.num & 0xFF, param.num * 2];
            const buffer = new ArrayBuffer(16);
            const view = new DataView(buffer);
            for (let i = 0; i < param.num; i++) {
                view.setUint16(0, param.val[i]);
                command.push(view.getUint8(0), view.getUint8(1));
            }
        }

        return new Uint8Array([...command, ...this.crc(command)]);
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