// 存储值转意义值
storeShowBin_sync_dom.addEventListener("input", (e) => calculateMeanValue(e.target.value, "bin"));
storeShowDec_sync_dom.addEventListener("input", (e) => calculateMeanValue(e.target.value, "dec"));
storeShowHex_sync_dom.addEventListener("input", (e) => calculateMeanValue(e.target.value, "hex"));

function calculateMeanValue(value, type) {
    getUserInput();

    // 去除value字符串空格
    value = value.replace(/\s/g, '');

    // 转换为字节数组
    let byteArray;
    let byteArrayType = ["uint16", "int16"].includes(userInput.type) ? "uint16" : "uint32";

    if (type === "bin") {
        byteArray = bitConvert.toByteArray(parseInt(value, 2), byteArrayType);
    } else if (type === "dec") {
        byteArray = bitConvert.toByteArray(parseInt(value, 10), byteArrayType);
    } else if (type === "hex") {
        byteArray = bitConvert.toByteArray(parseInt(value, 16), byteArrayType);
    }

    // 处理字节序
    if (endian_dom.value === "little") {
        byteArray = bitConvert.toLittle(byteArray);
    }
    if (byteSwap_dom.value === "swap") {
        byteArray = bitConvert.byteSwap(byteArray);
    }

    // 转换为数据类型
    storeValues.meanValue = bitConvert.toValue(byteArray, userInput.type);

    updateShow();
    calculateStoreValue();
}