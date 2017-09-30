var reviews = [];
var map;
var popup = document.querySelector('.popup');
var popupTitle = popup.querySelector('.popup_title');
var popupList = popup.querySelector('.popup_list');
//var popupForm = popup.querySelector('.popup_form');
var popupName = popup.querySelector('[name="name"]');
var popupPlace = popup.querySelector('[name="place"]');
var popupText = popup.querySelector('textarea');
var popupBtn = popup.querySelector('.popup_form_btn');
var paranja = document.querySelector('.paranja');

function initMap() {
    var place = {lat: 46.96739732, lng: 31.98102951};
    
    // создание карты
    map = new google.maps.Map(document.getElementById('map'), {
        center: place,
        zoom: 15
    });
    
    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow({
        content: popup
    });
    
    // отслеживание клика по карте
    map.addListener('click', function(event){
        var latlng = event.latLng;
        
        geocodeLatLng(geocoder, map, infowindow, latlng);
        /*
        var marker = new google.maps.Marker({
            position: event.latLng,
            map: map
        });
        
        // открытие попапа
        infowindow.open(map, marker);
        */
    });
    
    function geocodeLatLng(geocoder, map, infowindow, latlng) {
        //var input = document.getElementById('latlng').value;
        //var latlngStr = input.split(',', 2);
        //var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
        
        geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    var adressArr = results[0].formatted_address.split(', ');
                    var number = adressArr.splice(1, 1);
                    adressArr.unshift(number);
                    var address = '';
                    //console.log(results[7].formatted_address);
                    for (let i = adressArr.length - 1; i >= 0; i--) {
                        //console.log(adressArr[i]);
                        address += adressArr[i];
                        if (i > 0) {
                            address += ', ';
                        }
                    }
                    popupTitle.textContent = address;
                    
                    popupBtn.addEventListener('click', saveReview);
                    
                    
                    function saveReview(){
                        //debugger;
                        var name = popupName.value;
                        var place = popupPlace.value;
                        var text = popupText.value;
                        
                        if (name && place && text) {
                            var review = {};
                            review.geo = latlng;
                            review.name = name;
                            review.place = place;
                            review.text = text;
                            
                            reviews.push(review);
                            console.log(review);
                            console.log(reviews);
                            
                        } else {
                            paranja.classList.add('paranja_show');
                            setTimeout(function(){
                                paranja.classList.remove('paranja_show');
                            }, 3000);
                        }
                    }
                    
                    
                    
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    
                    
                    
                    //infowindow.setContent(results[0].formatted_address);
                    infowindow.open(map, marker);
                    popup.classList.add('popup_show');
                    
                    
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }
    
    // создание попапа
    /*
    infowindow = new google.maps.InfoWindow({
        content: '<p class="content">Мой текст</p>'
    });
    
    marker.addListener('click', function(event){
        infowindow.open(map, marker);
    });
    */
}

//localStorage.left = JSON.stringify(allFriends);