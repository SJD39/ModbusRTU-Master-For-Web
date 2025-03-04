// 保存至cookie
function saveToCookie() {
    let json = {};
    
    let coilShows = document.getElementsByTagName('coil-show');
    let coilShowsJson = [];
    for (let i = 0; i < coilShows.length; i++) {
        let coilShowJson = {};
        coilShowJson.station = coilShows[i].station;
        coilShowJson.addr = coilShows[i].addr;
        coilShowJson.y = coilShows[i].style.top;
        coilShowJson.x = coilShows[i].style.left;
        coilShowsJson.push(coilShowJson);
    }
    json.coilShows = coilShowsJson;

    let textShows = document.getElementsByTagName('text-show');
    let textShowsJson = [];
    for (let i = 0; i < textShows.length; i++) {
        let textShowJson = {};
        textShowJson.y = textShows[i].style.top;
        textShowJson.x = textShows[i].style.left;
        textShowJson.value = textShows[i].text;
        textShowsJson.push(textShowJson);
    }
    json.textShows = textShowsJson;

    let coilCtrls = document.getElementsByTagName('coil-ctrl');
    let coilCtrlsJson = [];
    for (let i = 0; i < coilCtrls.length; i++) {
        let coilCtrlJson = {};
        coilCtrlJson.station = coilCtrls[i].station;
        coilCtrlJson.addr = coilCtrls[i].addr;
        coilCtrlJson.y = coilCtrls[i].style.top;
        coilCtrlJson.x = coilCtrls[i].style.left;
        coilCtrlsJson.push(coilCtrlJson);
    }
    json.coilCtrls = coilCtrlsJson;

    document.cookie = JSON.stringify(json);
    return JSON.stringify(json);
}

// 从cookie中读取数据
function readFromCookie() {
    // 清除原有dom
    body_content.innerHTML = "";

    // 生成dom
    let cookie = JSON.parse(document.cookie);

    for (let i = 0; i < cookie.coilShows.length; i++) {
        let coilShow = document.createElement('coil-show');
        coilShow.station = cookie.coilShows[i].station;
        coilShow.addr = cookie.coilShows[i].addr;
        coilShow.style.top = cookie.coilShows[i].y;
        coilShow.style.left = cookie.coilShows[i].x;
        body_content.append(coilShow);
    }

    for (let i = 0; i < cookie.textShows.length; i++) {
        let textShow = document.createElement('text-show');
        textShow.style.top = cookie.textShows[i].y;
        textShow.style.left = cookie.textShows[i].x;
        body_content.append(textShow);
        textShow.text = cookie.textShows[i].value;
        textShow.setText();
    }

    for (let i = 0; i < cookie.coilCtrls.length; i++) {
        let coilCtrl = document.createElement('coil-ctrl');
        coilCtrl.station = cookie.coilCtrls[i].station;
        coilCtrl.addr = cookie.coilCtrls[i].addr;
        coilCtrl.style.top = cookie.coilCtrls[i].y;
        coilCtrl.style.left = cookie.coilCtrls[i].x;
        body_content.append(coilCtrl);
    }

    return;
}