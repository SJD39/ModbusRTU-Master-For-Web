// // 存储值转意义值

// storeValueBin_sync_dom.addEventListener("input", (e) => calculateMeanValue(e.target.value, "bin"));
// storeValueDec_sync_dom.addEventListener("input", (e) => calculateMeanValue(e.target.value, "dec"));
// storeValueHex_sync_dom.addEventListener("input", (e) => calculateMeanValue(e.target.value, "hex"));

// function calculateMeanValue(value, type) {
//     let meanType = valueType_dom.value;

//     // 去除value字符串空格
//     value = value.replace(/\s/g, '');

//     // 统一为16进制
//     let hexValue;
//     if (type === "bin") {
//         hexValue = parseInt(value, 2).toString(16);
//     } else if (type === "dec") {
//         hexValue = parseInt(value, 10).toString(16);
//     }else{
//         hexValue = value;
//     }

//     // 补零
//     if (hexValue.length % 2 !== 0) {
//         hexValue = "0" + hexValue;
//     }

//     // 生成字节数组
//     let byteArray = [];
//     for (let i = 0; i < hexValue.length; i += 2) {
//         byteArray.push(hexValue.substr(i, 2));
//     }

//     // 补字节
//     if(["int16", "uint16"].includes(meanType)){
//         while (byteArray.length < 2) {
//             byteArray.unshift("00");
//         }
//     }else if(["int32", "uint32", "float"].includes(meanType)){
//         while (byteArray.length < 4) {
//             byteArray.unshift("00");
//         }
//     }

//     // 处理字节序
//     if (endian_dom.value === "little") {
//         byteArray = bitConvert.toLittle(byteArray);
//     }

//     // 处理字节交换
//     if (byteSwap_dom.value === "swap") {
//         byteArray = bitConvert.byteSwap(byteArray);
//     }

//     // 转换为十进制
//     for(let i = 0; byteArray.length > i; i++){
//         byteArray[i] = parseInt(byteArray[i], 16);
//     }

//     // 计算意义值
//     switch (meanType) {
//         case "int16":
//             meanValue = bitConvert.ByteToInt16(byteArray);
//             break;
//         case "uint16":
//             meanValue = bitConvert.ByteToUint16(byteArray);
//             break;
//         case "int32":
//             meanValue = bitConvert.ByteToInt32(byteArray);
//             break;
//         case "uint32":
//             meanValue = bitConvert.ByteToUint32(byteArray);
//             break;
//         case "float":
//             meanValue = bitConvert.ByteToFloat(byteArray);
//             break;
//     }

//     meanValue_dom.value = meanValue;
//     return meanValue;
// }