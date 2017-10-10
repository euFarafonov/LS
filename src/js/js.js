var reviews = []; // массив отзывов
var markers = []; // массив маркеров
var markerCluster = null;
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
var popupOpen = 0; // 0 - нет открытых попапов, 1 - попап открыт
var place = null; // точка центровки карты

var currentLatLng;
var currentAddress;

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
        // заполнение массива маркеров из массива отзывов
        createMarkers(reviews);
    }
    
    // создание кластера маркеров
    createCluster();
    
    // если будет клик по карте
    map.addListener('click', function(event){
        if (popupOpen) {
            popup.classList.add('errorAnim');
            setTimeout(function(){
                popup.classList.remove('errorAnim');
            }, 500);
            
            return false;
        }
        
        var latlng = event.latLng;
        currentLatLng = latlng;
        
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
                currentAddress = formatAddress(result);
                popupTitle.textContent = currentAddress;
                showPopup(event);
            })
            .catch(function(error){
                alert(error);
            });
    });
}
///////////////////////////////////////////////////////////////////////
// сохранение отзыва
function saveReview(){
    var name = popupName.value;
    var place = popupPlace.value;
    var text = popupText.value;
    
    if (name && place && text) {
        var review = {};
        
        review.geo = currentLatLng;
        review.name = name;
        review.place = place;
        review.text = text;
        review.address = currentAddress;
        
        reviews.push(review);
        localStorage.reviews = JSON.stringify(reviews);
        console.log(reviews);
        
        var marker = new google.maps.Marker({
            position: currentLatLng,
            map: map
        });
        
        hidePopup();
        markerCluster.addMarker(marker, false);
        // нужно навесить событие клика на новый маркер
        
        // нужно навесить событие клика на кластеры
        
    } else {
        paranja.classList.add('paranja_show');
        setTimeout(function(){
            paranja.classList.remove('paranja_show');
        }, 3000);
    }
}

// показ попапа
function showPopup(e){
    var coordX,
        coordY,
        popupW = popup.clientWidth / 2,
        popupH = popup.clientHeight / 2;
    
    if (e.pixel) {
        coordX = e.pixel.x;
        coordY = e.pixel.y;
    } else {
        coordX = e.pageX;
        coordY = e.pageY;
    }
    
    popupName.value = '';
    popupPlace.value = '';
    popupText.value = '';
    
    coordX = (popupW < coordX) ? (coordX - popupW) : 0;
    coordY = (popupH < coordY) ? (coordY - popupH) : 0;
    
    popup.style = 'top: ' + coordY + 'px; left: ' + coordX + 'px; z-index: 1;';
    popupOpen = 1;
}

// Клик по кнопке "Добавить отзыв"
popupBtn.addEventListener('click', function(){
    saveReview();
    hidePopup();
});

// Клик по кнопке "Закрыть"
popupClose.addEventListener('click', function(){
    hidePopup();
});

// скрытие попапа
function hidePopup(){
    popupOpen = 0;
    popup.style = 'z-index: -1;';
    currentLatLng = null;
    currentAddress = null;
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

function createMarkers(reviews){
    markers = reviews.map(function(review) {
        var marker = new google.maps.Marker({
            position: review.geo,
            map: map
        });
        
        marker.addListener('click', function(event) {
            console.log(this);
            var latlng = event.latLng;
            currentLatLng = latlng;
            
            reviews.forEach(function(review){
                if (review.geo.lat === latlng.lat() && review.geo.lng === latlng.lng()) {
                    popupList.innerHTML = '';
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
                    currentAddress = review.address;
                    showPopup(window.event);
                }
            });
        });

        return marker;
    });
}

function createCluster(){
    markerCluster = new MarkerClusterer(
        map,
        markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'}
    );
}