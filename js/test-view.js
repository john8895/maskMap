const dataJson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": "5901020554",
                "name": "師大藥局",
                "phone": "02 -23623479",
                "address": "台北市大安區師大路99號1樓",
                "mask_adult": 0,
                "mask_child": 42,
                "updated": "2020\/02\/16 18:15:04",
                "available": "星期一上午看診、星期二上午看診、星期三上午看診、星期四上午看診、星期五上午看診、星期六上午看診、星期日上午休診、星期一下午看診、星期二下午看診、星期三下午看診、星期四下午看診、星期五下午看診、星期六下午看診、星期日下午休診、星期一晚上看診、星期二晚上看診、星期三晚上看診、星期四晚上看診、星期五晚上看診、星期六晚上看診、星期日晚上休診",
                "note": "-",
                "custom_note": "",
                "website": "",
                "county": "臺北市",
                "town": "大安區",
                "cunli": "古風里",
                "service_periods": "NNNNNNYNNNNNNYNNNNNNY"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    121.528509,
                    25.02271
                ]
            }
        }
    ]
};
const data = dataJson.features;
let showMask = "";

getTodat();
updateStoreList('all');
UserChooseLocation();
getUserLocation();
btnShowMask();

// 取得今天日期
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

function UserChooseLocation() {
    // 選擇行政區插件
    new TwCitySelector();
}

// 成人、兒童口罩篩選
function btnShowMask() {
    let maskBtn = document.getElementById('fliterMask').getElementsByTagName('input');
    for (let i = 0; i < maskBtn.length; i++) {
        maskBtn[i].onclick = function () {
            switch (maskBtn[i].id) {
                case 'btn__adultMask':
                    updateStoreList('adult');
                    break;
                case 'btn__childMask':
                    updateStoreList('child');
                    break;
                default:
                    updateStoreList();
            }
        }
    }
}

// 篩選口罩數量，更新左側列表
function updateStoreList(showMask) {
    showMask = showMask ? showMask : 'all';
    let str = "";

    let maskStoreTotal = 0;
    let limit = 0;
    for (let i = 0; i < data.length; i++) {
        limit = 0;
        if (showMask && showMask === 'adult') {
            if (data[i].properties.mask_adult !== 0) {
                limit++;
            }
        } else if (showMask && showMask === 'child') {
            if (data[i].properties.mask_child !== 0) {
                limit++;
            }

        } else {
            limit++;
        }
        if (limit > 0) {
            if (data[i].properties.mask_adult + data[i].properties.mask_child === 0) {
                continue;
            }
            str += `<article>
                            <h4>${data[i].properties.name}</h4>
                                <ul>
                                    <li>${data[i].properties.address}</li>
                                    <li>${data[i].properties.phone}</li>
                    <!--                <li>今日營業時間：${data[i].properties.available}</li>-->
                                </ul>
                            <div class="sidebar__maskNum">
                                <div class="mask-type mask-adult ${data[i].properties.mask_adult === 0 ? 'noMask' : ' '} "><em>成人</em> ${data[i].properties.mask_adult}</div>
                                <div class="mask-type mask-child ${data[i].properties.mask_child === 0 ? 'noMask' : ' '}"><em>兒童</em> ${data[i].properties.mask_child}</div>
                            </div>
                            <span class="sidebar__updateTime">
                                ${data[i].properties.updated} 更新
                            </span>
                                  </article>`;
            maskStoreTotal++;
        }

    }
    document.getElementById('storeList').innerHTML = str;
    document.getElementById('maskMapTitle').getElementsByTagName('span')[0].innerText = maskStoreTotal;
}

// TODO: 2020.02.14 change時要取得value，然後篩選資料，輸出店家名單，最後再重輸出到地圖上====================
function getUserLocation() {
    let cityBtn = document.getElementById('citySelectorBtn').onclick = function () {
        const county = document.getElementById('citySelector').getElementsByTagName('select')[0];
        const district = document.getElementById('citySelector').getElementsByClassName('district')[0];
        if (county.value && district.value) {
            let keyword = county.value + district.value;
            let result = dataJson.features.filter(item => item.properties.address.indexOf(keyword) !== -1 ? keyword : false);
            console.log(result);
            let str = '';
            let maskStoreTotal = 0;
            if (!result) {
                maskStoreTotal++;
                return;
            }
            for (let i = 0; i < result.length; i++) {
                // console.log(result[i]);
                str += `<article>
                            <h4>${result[i].properties.name}</h4>
                                <ul>
                                    <li>${result[i].properties.address}</li>
                                    <li>${result[i].properties.phone}</li>
                    <!--                <li>今日營業時間：${result[i].properties.available}</li>-->
                                </ul>
                            <div class="sidebar__maskNum">
                                <div class="mask-type mask-adult ${result[i].properties.mask_adult === 0 ? 'noMask' : ' '} "><em>成人</em> ${result[i].properties.mask_adult}</div>
                                <div class="mask-type mask-child ${result[i].properties.mask_child === 0 ? 'noMask' : ' '}"><em>兒童</em> ${result[i].properties.mask_child}</div>
                            </div>
                            <span class="sidebar__updateTime">
                                ${result[i].properties.updated} 更新
                            </span>
                                  </article>`;
                maskStoreTotal++;

            }
            document.getElementById('storeList').innerHTML = str;
            document.getElementById('maskMapTitle').getElementsByTagName('span')[0].innerText = maskStoreTotal;

            // TODO: 2020.02.17 把篩選後的資料，輸出marker到地圖上
            // TODO: 2020.02.18 地圖已經初始化，所以再次執行getMap會出現錯誤，要先移除再重新初始化
            // map.invalidateSize();
            // getMap();
            // L.marker(myLocation ? myLocation : [25.061285, 121.565481], {icon: redIcon}).addTo(map)
            //     .bindPopup('<h1>我的位置</h1>');
        }

    }

}

getMap();
// 產生地圖
function getMap() {
    let myLoc = [25.02271, 121.528509];

    let map = L.map('map', {
        center: myLoc,
        zoom: 16
    });
    // const getMapSuccess = true;
    // 註冊API
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 20,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1Ijoiam9objg4OTUiLCJhIjoiY2s2ZjBpbnRlMDQxNTNlbXQzcGRmd3g0ZSJ9.CZhZ2p1dMuFgIPard8rqwg'
    }).addTo(map);

    // ICON
    let greenIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    let blueIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    let greyIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    let redIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    // 群組 marker
    // if (!getMapSuccess) {
    //     return;
    // }
    L.marker(myLoc, {icon: redIcon}).addTo(map)
        .bindPopup('<h1>我的位置</h1>');


    // let markers = new L.MarkerClusterGroup().addTo(map);
    // // 循環取得遠端資料
    // for (let i = 0; i < data.length; i++) {
    //     let lat = data[i].geometry.coordinates[1];
    //     let lng = data[i].geometry.coordinates[0];
    //     let info = data[i].properties;
    //     // 如果口罩數量為0，則不顯示marker
    //     if (info.mask_adult + info.mask_child === 0) {
    //         continue;
    //     }
    //     markers.addLayer(L.marker([lat, lng], {icon: info.mask_adult + info.mask_child !== 0 ? blueIcon : greyIcon})
    //         .bindPopup(
    //             `<h1>${info.name}</h1>
    //              <em>${info.updated} 更新</em>
    //              <div class='sidebar__maskNum map__maskNum'>
    //                  <div class="mask-type mask-adult ${data[i].properties.mask_adult === 0 ? 'noMask' : ' '} "><em>成人</em> ${data[i].properties.mask_adult}</div>
    //                  <div class="mask-type mask-child ${data[i].properties.mask_child === 0 ? 'noMask' : ' '}"><em>兒童</em> ${data[i].properties.mask_child}</div>
    //              </div>`))
    //         .openPopup();
    // }
    // map.addLayer(markers);
}