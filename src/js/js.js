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

var slides = [];

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
    
    google.maps.event.addListener(markerCluster, "clusterclick", function (cluster, event) {
        event.stopPropagation();
        
        if (popupOpen) {
            slider.classList.add('errorAnim');
            setTimeout(function(){
                slider.classList.remove('errorAnim');
            }, 500);
            
            return false;
        }
        
        map.setCenter(cluster.center_);
        slider.style = 'z-index: 1;';
        popupOpen = 1;
        
        var markersArr = cluster.markers_;
        var currentSlider = 1;
        
        for (let i = 0; i < markersArr.length; i++) {
            reviews.forEach(function(review){
                if (review.geo.lat === markersArr[i].position.lat() && review.geo.lng === markersArr[i].position.lng()) {
                    var divSlide = document.createElement('div');
                    var divTitle = document.createElement('div');
                    var divAddress = document.createElement('div');
                    var divReview = document.createElement('div');
                    var divData = document.createElement('div');
                    var divPagNumb = document.createElement('div');
                    
                    divSlide.classList.add('slide');
                    if (currentSlider === 1) divSlide.classList.add('slide_active');
                    divSlide.setAttribute('data-numb', currentSlider);
                    
                    divTitle.classList.add('slide_title');
                    divAddress.classList.add('slide_address');
                    divReview.classList.add('slide_review');
                    divData.classList.add('slide_data');
                    
                    divTitle.textContent = review.place;
                    divAddress.textContent = review.address;
                    divReview.textContent = review.text;
                    divData.textContent = review.date;
                    
                    divSlide.appendChild(divTitle);
                    divSlide.appendChild(divAddress);
                    divSlide.appendChild(divReview);
                    divSlide.appendChild(divData);
                    slidesWrap.appendChild(divSlide);
                    
                    divPagNumb.classList.add('pag_numb');
                    if (currentSlider === 1) divPagNumb.classList.add('pag_numb_active');
                    divPagNumb.textContent = currentSlider;
                    divPagNumb.setAttribute('data-numb', currentSlider);
                    pag.appendChild(divPagNumb);
                    
                    currentSlider++;
                    
                    divAddress.addEventListener('click', function(){
                        closeSlider();
                        
                        ////////
                        currentLatLng = {
                            lat: review.geo.lat,
                            lng: review.geo.lng
                        };
                        
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
                        ////////
                    });
                }
            });
        }
    }); 
    
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
        
        writeCurrentLatLng(event);
        
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
                
                popupList.innerHTML = '';
                var li = document.createElement('li');
                var b = document.createElement('b');
                b.textContent = 'Отзывов пока нет ...';
                li.appendChild(b);
                popupList.appendChild(li);
                
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
        var curDate = formatDate(new Date());
        
        review.geo = {
            lat: currentLatLng.lat,
            lng: currentLatLng.lng
        };
        //console.log(review.geo);
        review.name = name;
        review.place = place;
        review.text = text;
        review.address = currentAddress;
        review.date = curDate;
        
        reviews.push(review);
        localStorage.reviews = JSON.stringify(reviews);
        
        var marker = new google.maps.Marker({
            position: review.geo,
            map: map
        });
        
        hidePopup();
        markerCluster.addMarker(marker, false);
        
        marker.addListener('click', function() {
            currentLatLng = {
                lat: this.position.lat(),
                lng: this.position.lng()
            };
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
        });
        
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
            var lat = event.latLng.lat();
            var lng = event.latLng.lng();
            
            writeCurrentLatLng(event);
            
            reviews.forEach(function(review){
                if (review.geo.lat === lat && review.geo.lng === lng) {
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

function writeCurrentLatLng(event){
    currentLatLng = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
    };
}

function createCluster(){
    markerCluster = new MarkerClusterer(
        map,
        markers,
        {
            zoomOnClick: false,
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        }
    );
}

/* SLIDER */
var slider = document.getElementById('slider');
var sliderLeft = slider.querySelector('.left');
var sliderRight = slider.querySelector('.right');
var sliderClose = slider.querySelector('.slider_close');
var slidesWrap = slider.querySelector('.slider_wrap');
var pag = slider.querySelector('.pag');

sliderClose.addEventListener('click', function(){
    closeSlider();
});

function closeSlider(){
    slider.style = 'z-index: -1;';
    slidesWrap.innerHTML = '';
    pag.innerHTML = '';
    popupOpen = 0;
}

slider.addEventListener('click', function(event){
    var target = event.target;
    
    var curSlide = slider.querySelector('.slide_active');
    var curBtn = slider.querySelector('.pag_numb_active');
    
    if (target.classList.contains('change_slide')) {
        var side = target.dataset.side;
        var curNumb = +curSlide.dataset.numb;
        var newNumb = (side === 'left') ? curNumb - 1 : curNumb + 1;
        var allSlides = slider.querySelectorAll('.slide');
        
        if (newNumb > 0 && newNumb <= allSlides.length) {
            changeSlide(curSlide, curBtn, newNumb);
        }
    }
    
    if (target.classList.contains('pag_numb') && !target.classList.contains('pag_numb_active')) {
        var newNumb = +target.dataset.numb;
        
        changeSlide(curSlide, curBtn, newNumb);
    }
});

function changeSlide(curSlide, curBtn, newNumb) {
    curSlide.classList.remove('slide_active');
    curBtn.classList.remove('pag_numb_active');
    
    var newSlide = slidesWrap.querySelector('[data-numb="' + newNumb + '"]');
    var newBtn = pag.querySelector('[data-numb="' + newNumb + '"]');
    
    newSlide.classList.add('slide_active');
    newBtn.classList.add('pag_numb_active');
}

function formatDate(date) {
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    var yy = date.getFullYear();
    var hh = date.getHours();
    var mi = date.getMinutes();
    var ss = date.getSeconds();
    
    return dd + '.' + mm + '.' + yy + ' ' + hh + ':' + mi + ':' + ss;
}
