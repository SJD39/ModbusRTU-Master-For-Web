endian_dom.addEventListener("change", calculateStoreValue_Example);
byteSwap_dom.addEventListener("change", calculateStoreValue_Example);

// 计算示例值
function calculateStoreValue_Example() {
    // 转换为10进制
    let meanValue = parseInt("0x12345678", 16);
    byteArray = bitConvert.uint32ToByte(meanValue);

    // 处理字节序
    if (userInput.endian === "little") {
        byteArray = bitConvert.toLittle(byteArray);
    }
    if (userInput.swap === "swap") {
        byteArray = bitConvert.byteSwap(byteArray);
    }

    // 显示
    storeValues.example = "";
    for (let i = 0; i < byteArray.length; i++) {
        storeValues.example += "0x" + byteArray[i].toString(16) + " ";
    }
    
    updateShow();
}
calculateStoreValue_Example();