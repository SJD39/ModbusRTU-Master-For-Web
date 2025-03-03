// 从dom生成json
function getJsonFromDom() {
    let json = {};
    
    let coilShows = document.getElementsByTagName('coil-show');
    let coilShowsJson = [];
    for (let i = 0; i < coilShows.length; i++) {
        let coilShow = coilShows[i];
        let coilShowJson = {};
        coilShowJson.station = coilShow.station;
        coilShowJson.addr = coilShow.addr;
        coilShowJson.y = coilShow.style.top;
        coilShowJson.x = coilShow.style.left;
        coilShowsJson.push(coilShowJson);
    }
    json.coilShows = coilShowsJson;

    return JSON.stringify(json);
}