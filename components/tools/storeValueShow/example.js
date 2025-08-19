endian_dom.addEventListener("change", calculateStoreValue_Example);
byteSwap_dom.addEventListener("change", calculateStoreValue_Example);
// 计算示例值
function calculateStoreValue_Example() {
    let valueEndian = endian_dom.value;
    let valueSwap = byteSwap_dom.value;

    // 计算字节序示例
    let meanValue = "0x12345678";
    
    // 转换为10进制
    meanValue = parseInt(meanValue, 16);
    byteArray = bitConvert.uint32ToByte(meanValue);

    // 处理字节序
    if (valueEndian === "little") {
        byteArray = bitConvert.toLittle(byteArray);
    }

    // 处理字节交换
    if (valueSwap === "swap") {
        byteArray = bitConvert.byteSwap(byteArray);
    }

    // 显示
    storeValueExample_dom.innerText = "";
    for (let i = 0; i < byteArray.length; i++) {
        storeValueExample_dom.innerHTML += "0x" + byteArray[i].toString(16) + " ";
    }
}
calculateStoreValue_Example();