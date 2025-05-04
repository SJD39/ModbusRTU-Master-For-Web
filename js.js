function isValidNumber(num) {
    return (num !== null && num !== "" && !isNaN(Number(num)));
}