// 功能描述：用户输入意义值，根据选择的参数，计算存储值

// 绑定更新方法
meanValue_dom.addEventListener("input", calculateStoreValue);
valueType_dom.addEventListener("change", calculateStoreValue);
endian_dom.addEventListener("change", calculateStoreValue);
byteSwap_dom.addEventListener("change", calculateStoreValue);

// 计算存储值
function calculateStoreValue() {
    let outputValue = new storeValue;

    getUserInput();
    // 全部转为Byte数组
    let byteArray = bitConvert.toByteArray(userInput.meanValue, userInput.type);

    // 处理字节序
    if (userInput.endian === "little") {
        byteArray = bitConvert.toLittle(byteArray);
    }

    // 处理字节交换
    if (userInput.swap === "swap") {
        byteArray = bitConvert.byteSwap(byteArray);
    }

    // 转换为对应进制
    for (let i = 0; i < byteArray.length; i++) {
        outputValue.bin += byteArray[i].toString(2).padStart(8, "0") + " ";
        outputValue.hex += byteArray[i].toString(16).padStart(2, "0") + " ";
    }

    if (byteArray.length === 2) {
        outputValue.dec = bitConvert.ByteToUint16(byteArray);
    } else if (byteArray.length === 4) {
        outputValue.dec = bitConvert.ByteToUint32(byteArray);
    }

    storeValues.sync = outputValue;
    updateShow();
}

