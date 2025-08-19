var bitConvert = new BitConvert();

// 定义存储值类
var storeValues = {
    sync: new storeValue(),
    cache: [
        new storeValue(),
        new storeValue()
    ]
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

