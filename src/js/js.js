var reviews = [];
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
var popupOpen = 0;
var place = null;
//var place = {lat: 46.96739732, lng: 31.98102951};
popup.style = 'display: none;';

function initMap() {
    if (localStorage.place) {
        place = JSON.parse(localStorage.place);
    } else {
        place = {lat: 46.96739732, lng: 31.98102951};
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: place,
        zoom: 15
    });
    
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
    
    if (localStorage.reviews) {
        reviews = JSON.parse(localStorage.reviews);
        showMarkers(reviews);
    }
    
    map.addListener('click', function(event){
        if (popupOpen) {
            //////////////////////////////////////////// добавить анимацию ошибки
            return false;
        }
        
        popupOpen = 1;
        clearFormInput();
        setCoord(event);
        
        geocodeLatLng(geocoder, map, event);
    });
    
    function geocodeLatLng(geocoder, map, e) {
        var latlng = e.latLng;
        
        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    popupTitle.textContent = formatAddress(results[0].formatted_address);
                    popupBtn.addEventListener('click', saveReview);
                    popupClose.addEventListener('click', function(){
                        popupBtn.removeEventListener('click', saveReview);
                        popupOpen = 0;
                        popup.style = 'display: none;';
                    });
                } else {
                    console.log('Результат геокодинга не получен');
                }
            } else {
                console.log('Ошибка геокодинга: ' + status);
            }
        });
        
        function saveReview(){
            var name = popupName.value;
            var place = popupPlace.value;
            var text = popupText.value;
            
            if (name && place && text) {
                var review = {};
                //console.log(latlng);
                review.geo = latlng;
                review.name = name;
                review.place = place;
                review.text = text;
                
                reviews.push(review);
                localStorage.reviews = JSON.stringify(reviews);
                //showMarkers(reviews); // как обновить маркеры для кластеризации?
                
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });
                
                popupBtn.removeEventListener('click', saveReview);
                popupOpen = 0;
                popup.style = 'display: none;';
            } else {
                paranja.classList.add('paranja_show');
                setTimeout(function(){
                    paranja.classList.remove('paranja_show');
                }, 3000);
            }
        }
    }
}
///////////////////////////////////////////////////////////////////////


function clearFormInput(){
    popupName.value = '';
    popupPlace.value = '';
    popupText.value = '';
}
        
function setCoord(e){
    var latlng = e.latLng;
    var coordX = e.pixel.x;
    var coordY = e.pixel.y;
    
    coordX = (popupW < coordX) ? (coordX - popupW) : 0;
    coordY = (popupH < coordY) ? (coordY - popupH) : 0;
    
    popup.style = 'top: ' + coordY + 'px; left: ' + coordX + 'px; display: block;';
}

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
    var markers = reviews.map(function(review) {
        var marker = new google.maps.Marker({
            position: review.geo,
            map: map
        });
        
        marker.addListener('click', function(event) {
            var latlng = event.latLng;
            reviews.forEach(function(review){
                //console.log(review.geo.lat);
                //console.log(latlng.lat());
                //console.log(latlng.lng());
                if (review.geo.lat === latlng.lat() && review.geo.lng === latlng.lng()) {
                    var li = document.createElement('li');
                    var b = document.createElement('b');
                    var span = document.createElement('span');
                    var p = document.createElement('p');
                    b.textContent = ': ' + review.name;
                    span.textContent = '- ' + review.place;
                    p.textContent = review.text;
                    li.appendChild(b);
                    li.appendChild(span);
                    li.appendChild(p);
                    popupList.appendChild(li);
                    
                    popupTitle.textContent = 'address';///////////////////////////////////////////
                    popupBtn.addEventListener('click', saveReview);
                    popupClose.addEventListener('click', function(){
                        popupBtn.removeEventListener('click', saveReview);
                        popupOpen = 0;
                        popup.style = 'display: none;';
                    });
                    popupOpen = 1;
                    clearFormInput();
                    popup.style = 'top: 0; left:0; display: block;';
                }
            });
            
            //setCoord(event);
        });

        return marker;
    });
    
    var markerCluster = new MarkerClusterer(
        map,
        markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'}
    );
}