var bitConvert = new BitConvert();

// 定义存储值类
var storeValues = {
    sync: new storeValue(),
    cache: [
        new storeValue(),
        new storeValue()
    ]
}

// 绑定更新方法
storeValueShowInput.addEventListener("input", calculateStoreValue);
storeValueShowType.addEventListener("change", calculateStoreValue);

storeValueShowEndian.addEventListener("change", calculateStoreValue);
storeValueShowEndian.addEventListener("change", calculateStoreValue_Example);

storeValueShowByteSwap.addEventListener("change", calculateStoreValue);
storeValueShowByteSwap.addEventListener("change", calculateStoreValue_Example);

// 计算示例值
function calculateStoreValue_Example() {
    let inputEndian = storeValueShowEndian.value;
    let inputSwap = storeValueShowByteSwap.value;

    // 计算字节序示例
    let endianExample = 305419896;
    exampleByteArray = bitConvert.uint32ToByte(endianExample);

    // 处理字节序
    if (inputEndian === "little") {
        exampleByteArray = bitConvert.toLittle(exampleByteArray);
    }

    // 处理字节交换
    if (inputSwap === "swap") {
        exampleByteArray = bitConvert.byteSwap(exampleByteArray);
    }

    // 显示
    storeValueShowEndianExample.innerText = "";
    for (let i = 0; i < exampleByteArray.length; i++) {
        storeValueShowEndianExample.innerHTML += "0x" + exampleByteArray[i].toString(16) + " ";
    }
}
calculateStoreValue_Example();

// 计算存储值
function calculateStoreValue() {
    let inputValue = storeValueShowInput.value;
    let inputType = storeValueShowType.value;
    let inputEndian = storeValueShowEndian.value;
    let inputSwap = storeValueShowByteSwap.value;
    let outputValue = new storeValue;

    // 计算存储值
    // 全部转为uint16或uint32
    let byteArray;
    if (inputType === "int16") {
        byteArray = bitConvert.int16ToByte(inputValue);
    } else if (inputType === "uint16") {
        byteArray = bitConvert.uint16ToByte(inputValue);
    } else if (inputType === "int32") {
        byteArray = bitConvert.int32ToByte(inputValue);
    } else if (inputType === "uint32") {
        byteArray = bitConvert.uint32ToByte(inputValue);
    } else if (inputType === "float") {
        byteArray = bitConvert.floatToByte(inputValue);
    }

    // 处理字节序
    if (inputEndian === "little") {
        byteArray = bitConvert.toLittle(byteArray);
    }

    // 处理字节交换
    if (inputSwap === "swap") {
        byteArray = bitConvert.byteSwap(byteArray);
    }

    // 转换为对引进制
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
    storeValueShowBin_sync.innerText = storeValues.sync.bin;
    storeValueShowDec_sync.innerText = storeValues.sync.dec;
    storeValueShowHex_sync.innerText = storeValues.sync.hex;
}

// 缓存
function cacheStoreValue(index) {
    storeValues.cache[index] = storeValues.sync;

    storeValueShowBin_cache1.innerText = storeValues.cache[0].bin;
    storeValueShowDec_cache1.innerText = storeValues.cache[0].dec;
    storeValueShowHex_cache1.innerText = storeValues.cache[0].hex;

    storeValueShowBin_cache2.innerText = storeValues.cache[1].bin;
    storeValueShowDec_cache2.innerText = storeValues.cache[1].dec;
    storeValueShowHex_cache2.innerText = storeValues.cache[1].hex;
}
