// 定义存储值结构体
class storeValue {
    constructor() {
        this.bin = "";
        this.dec = "";
        this.hex = "";
    }
}

// 定义显示存储值类
var storeValues = {
    meanValue: "",
    sync: new storeValue(),
    example: "",
    cache: [
        new storeValue(),
        new storeValue()
    ]
}

// 更新显示
function updateShow() {
    meanValue_dom.value = storeValues.meanValue;

    storeShowBin_sync_dom.value = storeValues.sync.bin;
    storeShowDec_sync_dom.value = storeValues.sync.dec;
    storeShowHex_sync_dom.value = storeValues.sync.hex;

    storeShowBin_cache1_dom.innerText = storeValues.cache[0].bin;
    storeShowDec_cache1_dom.innerText = storeValues.cache[0].dec;
    storeShowHex_cache1_dom.innerText = storeValues.cache[0].hex;

    storeShowBin_cache2_dom.innerText = storeValues.cache[1].bin;
    storeShowDec_cache2_dom.innerText = storeValues.cache[1].dec;
    storeShowHex_cache2_dom.innerText = storeValues.cache[1].hex;

    storeValueExample_dom.innerText = storeValues.example;
}

// 定义用户输入结构体
class UserInput {
    constructor() {
        this.meanValue;
        this.type;
        this.endian;
        this.swap;
        this.storeValueBin;
        this.storeValueDec;
        this.storeValueHex;
    }
}
var userInput = new UserInput();

// 获取用户输入
function getUserInput() {
    userInput.meanValue = meanValue_dom.value;
    storeValues.meanValue = meanValue_dom.value;

    userInput.type = valueType_dom.value;
    userInput.endian = endian_dom.value;
    userInput.swap = byteSwap_dom.value;

    userInput.storeValueBin = storeShowBin_sync_dom.value;
    userInput.storeValueDec = storeShowDec_sync_dom.value;
    userInput.storeValueHex = storeShowHex_sync_dom.value;
}

// 缓存
function cacheStoreValue(index) {
    storeValues.cache[index] = storeValues.sync;

    updateShow();
}

// 调整用户输入限制
function inputLimt(max, min) {
    if (meanValue_dom.value > max) {
        meanValue_dom.value = max;
    } else if (meanValue_dom.value < min) {
        meanValue_dom.value = min;
    }
}

// 设置用户输入限制
function setInputLimt() {
    let max = bitConvert.valueTypeData[valueType_dom.value].range.max;
    let min = bitConvert.valueTypeData[valueType_dom.value].range.min;

    inputLimt(max, min);
}

valueType_dom.addEventListener("change", setInputLimt);
meanValue_dom.addEventListener("input", setInputLimt);
setInputLimt();