class Extend {
    // 判断数字是否有效
    isValidNumber(num) {
        return (num !== null && num !== "" && !isNaN(Number(num)));
    }
}


var extend = new Extend();
