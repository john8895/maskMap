/*
 * -------------------
 * todo 待辦事項 ＆ bug
 * -------------------
 * todo:選擇行政區後，右側地圖只會更新一次
 */


/*
 * -------------------
 * 註冊地圖
 * -------------------
 */
var map = L.map('map', {
    center: [24.126471, 120.658887],
    zoom: 16
});

/*
 * -------------------
 * 引入圖專
 * -------------------
 */
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

/*
 * -------------------
 * 圖示
 * -------------------
 */
var greyIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var blueIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


/*
 * -------------------
 * 讀取遠端資料
 * -------------------
 */
var data;
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
xhr.send();

//progress loading效果
xhr.addEventListener('progress', function () {
    var loading = document.getElementById('progressLoading');
    loading.style.display = 'block';
})
//讀取資料
xhr.addEventListener('load', function () {
    var loading = document.getElementById('progressLoading');
    loading.removeAttribute('style');
    data = JSON.parse(xhr.responseText).features;
    updateMap();
});

/*
 * -------------------
 * 偵測使用者定位，設定地圖中心點
 * -------------------
 */
navigator.geolocation.getCurrentPosition(getPosition);

function getPosition(position) {
    // let myLocation = [position.coords.latitude, position.coords.longitude];
    var myLat = position.coords.latitude;
    var myLong = position.coords.longitude;
    map.setView(new L.LatLng(myLat, myLong), 15);
    L.marker([myLat, myLong], {icon: redIcon}).addTo(map)
        .bindPopup(`
                <div class="map__yourPosition">
                    <h3>所在位置</h3>
                </div>
        `);
    // .openPopup();
}

/*
 * -------------------
 * 新增圖層，marker群組
 * -------------------
 */
var markers = new L.MarkerClusterGroup().addTo(map);

//迴圈取得資料，並更新在右側地圖上
function updateMap() {
    var updateTime = document.getElementById('updateTime');
    updateTime.innerText = data[0].properties.updated;

    map.removeLayer(markers);  //一開始先移除marker

    for (var i = 0; i < data.length; i++) {
        //判斷有無口罩，無就給灰色圖示
        var iconColor = data[i].properties.mask_adult === 0 ? greyIcon : blueIcon;
        //新增圖層
        markers.addLayer(
            L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]],
                {icon: iconColor})
                .bindPopup(`
                        <div class="map__item__wrap">
                            <h1>${data[i].properties.name}</h1>
                            <ul class="map__item-info">
                                <li>
                                    <i class="fas fa-phone-square-alt"></i>
                                    <a title="撥打電話(行動裝置)" href="tel:${data[i].properties.phone}">${data[i].properties.phone}</a>
                                </li>
                                <li>
                                    <i class="fas fa-location-arrow"></i>
                                    <a title="前往 Google 地圖導航" href="https://www.google.com/maps/dir/?api=1&destination=${data[i].geometry.coordinates[1]},${data[i].geometry.coordinates[0]}" target="_blank">${data[i].properties.address}</a>
                                </li>
                                <li>
                                    <i class="fas fa-question-circle"></i>
                                    <span>${data[i].properties.note}</span>
                                </li>
                            </ul>
                            
                            <div class="sidebar__maskNum map__item__maskNum">
                                    <div class="mask-type mask-adult ${data[i].properties.mask_adult === 0 ? 'noMask' : ' '} "><em>成人</em> ${data[i].properties.mask_adult}</div>
                                    <div class="mask-type mask-child ${data[i].properties.mask_child === 0 ? 'noMask' : ' '}"><em>兒童</em> ${data[i].properties.mask_child}</div>
                                </div>
                                <span class="sidebar__updateTime">
                                ${data[i].properties.updated} 更新
                            </span>
                        </div>
                `))
    }
    map.addLayer(markers) //新增圖層到地圖
}

/*
 * -------------------
 * 選擇行政區
 * -------------------
 */
new TwCitySelector();
onload = function () {
    var select = document.getElementById('citySelector');
    var city = select.children[0];
    var district = select.children[1];
    district.onchange = function () {
        var temp_keyword = city.value + district.value;
        var temp_keyword1 = '';
        //不管輸入「臺」或「台」，都會轉出另一個台（臺），得到兩個keyword的數組
        if (temp_keyword.indexOf('台') >= 0) {
            temp_keyword1 = temp_keyword.replace('台', '臺');
        } else if (temp_keyword.indexOf('臺') >= 0) {
            temp_keyword1 = temp_keyword.replace('臺', '台');
        }
        var keywords = [temp_keyword, temp_keyword1];
        updateMaskList(keywords);
    }
}
var addrDataArr = [];

//根據選擇城市、區域，進行數據篩選
function updateMaskList(keywords) {
    var storeList = document.getElementById('storeList');
    var maskLeftTitle = document.getElementById('maskLeftTitle');
    var maskLeftNum = 0;
    var str = '';
    //-------------------------
    var result_temp = [];
    //將關鍵字篩選數據，取得result結果
    keywords.forEach(function (kv, ki) {
        result_temp[ki] = data.filter(function (value) {
            return value.properties.address.indexOf(kv) !== -1 ? kv : false;
        })
    });

    var result = result_temp[0].concat(result_temp[1]);

    //循環輸出結果
    for (var i = 0; i < result.length; i++) {
        str += `<article>
                            <h4><a title="定位地圖到此機構位置" href="" onclick="event.preventDefault();clickChangeCenter(this)" index="${i}">${result[i].properties.name}</a></h4>
                                <ul class="sidebar__itemInfo">
                                    <li>
                                        <i class="fas fa-map-marked-alt"></i>
                                        <a title="連結到 Google 地圖" href="https://www.google.com/maps/place/${result[i].properties.address}" target="_blank">${result[i].properties.address}</a>

                                    </li>
                                    <li>
                                        <i class="fas fa-phone-square-alt"></i>
                                        <a title="撥打電話" href="tel:${result[i].properties.phone}">${result[i].properties.phone}</a>
                                    </li>
                    <!--                <li>今日營業時間：${result[i].properties.available}</li>-->
                                </ul>
                            <div class="sidebar__maskNum">
                                <div class="mask-type mask-adult ${result[i].properties.mask_adult === 0 ? 'noMask' : ' '} "><em>成人</em> ${result[i].properties.mask_adult}</div>
                                <div class="mask-type mask-child ${result[i].properties.mask_child === 0 ? 'noMask' : ' '}"><em>兒童</em> ${result[i].properties.mask_child}</div>
                            </div>
                                  </article>`;
        maskLeftNum++; //口罩剩餘數量計數
        // addrDataArr.push(result[i]);
    }
    addrDataArr = result;
    storeList.innerHTML = str; //更新左側藥局清單
    maskLeftTitle.innerText = `尚有庫存店家 共 ${maskLeftNum} 筆`; //更新 尚有庫存店家筆數
    //改變地圖中心點為數據第一筆
    var k_lat = addrDataArr[0].geometry.coordinates[1];
    var k_long = addrDataArr[0].geometry.coordinates[0];
    // map.panTo(new L.LatLng(k_lat, k_long));
    //移動地圖中心點，改變縮放級別
    map.setView(new L.LatLng(k_lat, k_long), 16);


    var block = document.getElementById('silder__maskFilterBlock');
    block.classList.add(addrDataArr.length !== 0 ? 'on' : '');

    var btnObj = document.getElementById('fliterMask').children[0];
    btnObj.className = 'active';
}

/*
 * -------------------
 * 篩選地址，點選左側店家名稱
 * 移動地圖中心點 / 改變縮放級別
 * -------------------
 */
function clickChangeCenter(element) {
    var lat, lon;
    var index = element.getAttribute('index');
    lat = addrDataArr[index].geometry.coordinates[1];
    lon = addrDataArr[index].geometry.coordinates[0];
    //移動地圖中心點
    // map.panTo(new L.LatLng(lat, lon), {animate: true});
    //移動地圖中心點，改變縮放級別
    map.setView(new L.LatLng(lat, lon), 25, {animate: true});
}

/*
 * -------------------
 * 根據 所有口罩、成人、兒童，進行口罩篩選
 * -------------------
 */
var adultBtn = document.getElementById('btn__adultMask');
var childBtn = document.getElementById('btn__childMask');
var alldBtn = document.getElementById('btn__allMask');

adultBtn.onclick = filterMaskAdult;
childBtn.onclick = filterMaskChild;
alldBtn.onclick = filterMaskAll;

//篩選成人口罩
function filterMaskAdult() {


    //active顯示
    var btnObj = document.getElementById('fliterMask').children;
    console.log(addrDataArr);


    for (var i = 0; i < btnObj.length; i++) {
        btnObj[i].removeAttribute('class');
    }
    this.className = 'active';
    addrDataUpdateList('adult', addrDataArr);
}

//篩選兒童口罩
function filterMaskChild() {
    //active顯示
    var btnObj = document.getElementById('fliterMask').children;
    for (var i = 0; i < btnObj.length; i++) {
        btnObj[i].removeAttribute('class');
    }
    this.className = 'active';
    addrDataUpdateList('child', addrDataArr);
}

//篩選所有口罩
function filterMaskAll() {
    //active顯示
    var btnObj = document.getElementById('fliterMask').children;
    for (var i = 0; i < btnObj.length; i++) {
        btnObj[i].removeAttribute('class');
    }
    this.className = 'active';
    addrDataUpdateList('all', addrDataArr);
}

/*
 * -------------------
 * 篩選行政區讀取資料
 * -------------------
 */
function addrDataUpdateList(filterType, dataSource) {
    var storeList = document.getElementById('storeList');
    var maskLeftTitle = document.getElementById('maskLeftTitle');
    var maskLeftNum = 0;
    var str = '';
    var limit = 0;
    for (var i = 0; i < dataSource.length; i++) {
        switch (filterType) {
            case 'adult':
                if (dataSource[i].properties.mask_adult !== 0) {
                    limit++;
                    maskLeftNum++;
                }
                break;
            case 'child':
                if (dataSource[i].properties.mask_child !== 0) {
                    limit++;
                    maskLeftNum++;
                }
                break;
            default:
                limit++;
                maskLeftNum++;
        }
        if (limit > 0) {
            str += `<article>
                            <h4><a title="定位地圖到此機構位置" href="" onclick="event.preventDefault();clickChangeCenter(this)" index="${i}">${dataSource[i].properties.name}</a></h4>
                                <ul class="sidebar__itemInfo">
                                    <li>
                                        <i class="fas fa-map-marked-alt"></i>
                                        <a title="連結到 Google 地圖" href="https://www.google.com/maps/place/${dataSource[i].properties.address}" target="_blank">${dataSource[i].properties.address}</a>

                                    </li>
                                    <li>
                                        <i class="fas fa-phone-square-alt"></i>
                                        <a title="撥打電話" href="tel:${dataSource[i].properties.phone}">${dataSource[i].properties.phone}</a>
                                    </li>
                    <!--                <li>今日營業時間：${dataSource[i].properties.available}</li>-->
                                </ul>
                            <div class="sidebar__maskNum">
                                <div class="mask-type mask-adult ${dataSource[i].properties.mask_adult === 0 ? 'noMask' : ' '} "><em>成人</em> ${dataSource[i].properties.mask_adult}</div>
                                <div class="mask-type mask-child ${dataSource[i].properties.mask_child === 0 ? 'noMask' : ' '}"><em>兒童</em> ${dataSource[i].properties.mask_child}</div>
                            </div>
                                  </article>`;
        }
    }
    storeList.innerHTML = str; //更新左側藥局清單
    maskLeftTitle.innerText = `尚有庫存店家 共 ${maskLeftNum} 筆`; //更新 尚有庫存店家筆數
}

/*
 * -------------------
 * 取得今天日期
 * -------------------
 */

// getTodat();
function getTodat() {
    let Today = new Date();
    let weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    let nowWeek = weekDay[Today.getDay()];
    let str = "";
    if (Today.getDay() === 0) {
        //星期日
        str = `<h1>${nowWeek}</h1>不限身份證字號都可以買口罩`;
    } else if (Today.getDay() % 2 === 0) {
        //偶數
        str = `<h1>${nowWeek}</h1>身份證<span class="id-last">最後一碼為</span><div><span class="idNum">2、4、6、8、0</span> 的人可以買口罩！</div>`;
    } else {
        //奇數
        str = `<h1>${nowWeek}</h1>身份證<span class="id-last">最後一碼為</span><div><span class="idNum">1、3、5、7、9</span> 的人可以買口罩！</div>`;
    }
    document.getElementById('whoCanBuy').innerHTML = str;
    let todayDate = Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日";
    document.getElementById('todayDate').append(todayDate);
}