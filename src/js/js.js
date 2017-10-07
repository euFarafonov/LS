var reviews = []; // массив всех отзывов
//var markers = [];
var markerCluster;
var map;
var popup = document.querySelector('.popup');
var popupTitle = popup.querySelector('.popup_title');
var popupList = popup.querySelector('.popup_list');
var popupName = popup.querySelector('[name="name"]');
var popupPlace = popup.querySelector('[name="place"]');
var popupText = popup.querySelector('textarea');
var popupBtn = popup.querySelector('.popup_form_btn');
var popupClose = popup.querySelector('.popup_close');
var paranja = document.querySelector('.paranja');
var popupW = popup.clientWidth / 2;
var popupH = popup.clientHeight / 2;
var popupOpen = 0; // 0 - нет открытых попапов, 1 - попап открыт
var place = null; // точка центровки карты

popup.style = 'display: none;';

function initMap() {
    place = (localStorage.place) ? JSON.parse(localStorage.place) : {lat: 46.96739732, lng: 31.98102951};
    // создание карты
    map = new google.maps.Map(document.getElementById('map'), {
        center: place,
        zoom: 15
    });
    // центровка карты, если пользователь разрешил узнать его геолокацию
    if (!localStorage.place && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            place = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            map.setCenter(place);
            localStorage.place = JSON.stringify(place);
        });
    }
    
    var geocoder = new google.maps.Geocoder;
    
    // если ранее были добавлены отзывы - показать их на карте
    if (localStorage.reviews) {
        reviews = JSON.parse(localStorage.reviews);
        // функция отображения маркеров на карте
        showMarkers(reviews);
    }
    
    // если будет клик по карте
    map.addListener('click', function(event){
        if (popupOpen) {
            popup.classList.add('errorAnim');
            setTimeout(function(){
                popup.classList.remove('errorAnim');
            }, 500);
            
            return false;
        }
        
        popupOpen = 1;
        clearFormInput();
        
        var latlng = event.latLng;
        
        var promise = new Promise(function(resolve, reject) {
            // получение геокода адреса
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        resolve(results[0].formatted_address);
                    } else {
                        reject('Результат геокодинга не получен');
                    }
                } else {
                    reject('Ошибка геокодинга: ' + status);
                }
            });
        });
        
        promise
            .then(function(result){
                var address = formatAddress(result);
                popupTitle.textContent = address;
                showPopup(event);
                
                popupBtn.addEventListener('click', saveReview.bind(null, latlng, address));
                popupClose.addEventListener('click', hidePopup);
            })
            .catch(function(error){
                alert(error);
            });
    });
}
///////////////////////////////////////////////////////////////////////
// сохранение отзыва
function saveReview(latlng, address){
    var name = popupName.value;
    var place = popupPlace.value;
    var text = popupText.value;
    
    if (name && place && text) {
        var review = {};
        
        review.geo = latlng;
        review.name = name;
        review.place = place;
        review.text = text;
        review.address = address;
        
        reviews.push(review);
        localStorage.reviews = JSON.stringify(reviews);
        
        var marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
        
        markerCluster.addMarker(marker, false);// а если нет объекта markerCluster????????????
        
        // нужно навесить события клика на новый маркер
        
        // нужно навесить событие клика на кластеры
        
        hidePopup();
    } else {
        paranja.classList.add('paranja_show');
        setTimeout(function(){
            paranja.classList.remove('paranja_show');
        }, 3000);
    }
}

// очистка полей формы
function clearFormInput(){
    popupName.value = '';
    popupPlace.value = '';
    popupText.value = '';
}
// показ попапа
function showPopup(e){
    var latlng = e.latLng;
    var coordX = e.pixel.x;
    var coordY = e.pixel.y;
    
    coordX = (popupW < coordX) ? (coordX - popupW) : 0;
    coordY = (popupH < coordY) ? (coordY - popupH) : 0;
    
    popup.style = 'top: ' + coordY + 'px; left: ' + coordX + 'px; display: block;';
}

// скрытие попапа
function hidePopup(){
    popupBtn.removeEventListener('click', saveReview);
    popupOpen = 0;
    popup.style = 'display: none;';
}

// форматирование адреса
function formatAddress(result) {
    var adressArr = result.split(', ');
    var addressNumber = adressArr.splice(1, 1);
    var address = '';
    
    adressArr.unshift(addressNumber);
    
    for (let i = adressArr.length - 1; i >= 0; i--) {
        address += adressArr[i];
        if (i > 0) {
            address += ', ';
        }
    }
    
    return address;
}

function showMarkers(reviews){
    // массив маркеров
    var markers = reviews.map(function(review) {
        var marker = new google.maps.Marker({
            position: review.geo,
            map: map
        });
        
        // если будет клик по маркеру
        marker.addListener('click', function(event) {
            var latlng = event.latLng;
            
            reviews.forEach(function(review){
                if (review.geo.lat === latlng.lat() && review.geo.lng === latlng.lng()) {
                    var li = document.createElement('li');
                    var b = document.createElement('b');
                    var span = document.createElement('span');
                    var p = document.createElement('p');
                    b.textContent = review.name + ': ';
                    span.textContent = review.place;
                    p.textContent = review.text;
                    li.appendChild(b);
                    li.appendChild(span);
                    li.appendChild(p);
                    popupList.appendChild(li);
                    
                    popupTitle.textContent = review.address;
                    
                    console.log(review);
                    console.log(event);
                    
                    popupBtn.addEventListener('click', saveReview.bind(null, latlng, review.address));
                    popupClose.addEventListener('click', hidePopup);
                    
                    popupOpen = 1;
                    clearFormInput();
                    //showPopup(event);
                    popup.style = 'top: 0; left: 0; display: block;';// как получить координаты маркера при клике?
                }
            });
            
        });

        return marker;
    });
    
    markerCluster = new MarkerClusterer(
        map,
        markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'}
    );
}