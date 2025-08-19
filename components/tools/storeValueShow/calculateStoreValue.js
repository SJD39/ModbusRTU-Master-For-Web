// 绑定更新方法
meanValue_dom.addEventListener("input", calculateStoreValue);
valueType_dom.addEventListener("change", calculateStoreValue);
endian_dom.addEventListener("change", calculateStoreValue);
byteSwap_dom.addEventListener("change", calculateStoreValue);

// 计算存储值
function calculateStoreValue() {
    let meanValue = meanValue_dom.value;
    let valueType = valueType_dom.value;
    let valueEndian = endian_dom.value;
    let valueSwap = byteSwap_dom.value;
    let outputValue = new storeValue;

    // 计算存储值
    // 全部转为Byte数组
    let byteArray;
    if (valueType === "int16") {
        byteArray = bitConvert.int16ToByte(meanValue);
    } else if (valueType === "uint16") {
        byteArray = bitConvert.uint16ToByte(meanValue);
    } else if (valueType === "int32") {
        byteArray = bitConvert.int32ToByte(meanValue);
    } else if (valueType === "uint32") {
        byteArray = bitConvert.uint32ToByte(meanValue);
    } else if (valueType === "float") {
        byteArray = bitConvert.floatToByte(meanValue);
    }

    // 处理字节序
    if (valueEndian === "little") {
        byteArray = bitConvert.toLittle(byteArray);
    }

    // 处理字节交换
    if (valueSwap === "swap") {
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

// 更新显示
function updateShow() {
    storeValueBin_sync_dom.value = storeValues.sync.bin;
    storeValueDec_sync_dom.value = storeValues.sync.dec;
    storeValueHex_sync_dom.value = storeValues.sync.hex;
}