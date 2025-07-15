class Extend {
    // 判断数字是否有效
    isValidNumber(num) {
        return (num !== null && num !== "" && !isNaN(Number(num)));
    }

    // 数组对比
    arrayEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
}
var extend = new Extend();