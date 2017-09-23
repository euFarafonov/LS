var allFriends;
var filterContainer = document.getElementById('filter_container');
var filterLeft = document.getElementById('js_filter_left');
var filterRight = document.getElementById('js_filter_right');
var friendListLeft = document.getElementById('js_friend_list_left');
var friendListRight = document.getElementById('js_friend_list_right');

filterRight.setAttribute('disabled', '');

filterLeft.value = '';
filterRight.value = '';

function api(method, params) {
    return new Promise((resolve, reject) => {
        VK.api(method, params, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}

const promise = new Promise(function(resolve, reject){
    VK.init( {apiId: 6194358} );
    
    VK.Auth.login(function(data){
        if (data.session) {
            resolve(data);
        } else {
            reject(new Error('Ошибка авторизации!'));
        }
    }, 8);
});

promise
    .then(() => {
        return api('friends.get', { v: 5.68, fields: 'first_name, last_name, photo_100', order: 'name' })
    })
    .then(data => {
        allFriends = data.items;
        friendListLeft.innerHTML = '';
        
        allFriends.forEach(function(friend){
            showFriend(friend, friendListLeft);
        });
    })
    .catch(function (e) {
        alert('Ошибка: ' + e.message);
    });

function showFriend(friend, parentBlock) {
    let friendLi = document.createElement('li');
    friendLi.classList.add('filter_friend_item');
    friendLi.classList.add('js_drag');
    friendLi.classList.add('clearfix');
    
    let friendImg = document.createElement('img');
    friendImg.classList.add('filter_friend_img');
    friendImg.src = friend.photo_100;
    
    let friendName = document.createElement('div');
    friendName.classList.add('filter_friend_name');
    friendName.textContent = friend.first_name + ' ' + friend.last_name;
    
    let friendBtn = document.createElement('div');
    friendBtn.classList.add('btn');
    friendBtn.classList.add('action');
    
    friendLi.appendChild(friendImg);
    friendLi.appendChild(friendName);
    friendLi.appendChild(friendBtn);
    
    parentBlock.appendChild(friendLi);
    //addDND(friendLi);
}

filterContainer.addEventListener('keyup', function(event){
    let target = event.target;
    
    if (target.nodeName !== 'INPUT') return false;
    
    let filterText = event.target.value;
    let parentId = 'js_friend_list_' + target.id.split('_')[2];
    let parentEl = document.getElementById(parentId);
    
    parentEl.innerHTML = '';
    
    allFriends.forEach(function(friend){
        if ( filterFriend(friend.first_name, filterText) || filterFriend(friend.last_name, filterText) ) {
            showFriend(friend, parentEl);
        }
    });
});

function filterFriend(name, filter) {
    return (name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
}

//////////////////////////////////////////
var dragObject = {};

filterContainer.addEventListener('mousedown', function(event){
    if (e.which !== 1) return;
    
    var elem = event.target.closest('.js_drag');
    
    if (!elem) return;
    
    dragObject.elem = elem;
    dragObject.downX = event.pageX;
    dragObject.downY = event.pageY;
});

filterContainer.addEventListener('mousemove', function(event){
    if (!dragObject.elem) return;
    
    if (!dragObject.avatar) {
        var moveX = event.pageX - dragObject.downX;
        var moveY = event.pageY - dragObject.downY;
        
        if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) return;
        
        dragObject.avatar = createAvatar(event);
        
        if (!dragObject.avatar) {
            dragObject = {}; // аватар создать не удалось, отмена переноса
            return; // возможно, нельзя захватить за эту часть элемента
        }
        
        // аватар создан успешно
        // создать вспомогательные свойства shiftX/shiftY
        var coords = getCoords(dragObject.avatar);
        dragObject.shiftX = dragObject.downX - coords.left;
        dragObject.shiftY = dragObject.downY - coords.top;
        
        startDrag(e); // отобразить начало переноса
    }
    
    // отобразить перенос объекта при каждом движении мыши
    dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
    dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';
    
    return false;
});



















/*
function addDND(target) {
    target.addEventListener('mousedown', function(event) {
        var shiftX = event.pageX - getCoords(target).left;
        var shiftY = event.pageY - getCoords(target).top;
        
        
        elW = target.clientWidth;
        //console.log(elW);
        
        target.style.width = elW + 'px';
        target.classList.add('filter_friend_item_move');
        
        document.addEventListener('mousemove', mMove);
        
        function mMove(event) {
            target.style.left = event.pageX - shiftX + 'px';
            target.style.top = event.pageY - shiftY + 'px';
        }
        
        target.addEventListener('mouseup', mUp);
        
        function mUp() {
            document.removeEventListener('mousemove', mMove);
            target.removeEventListener('mouseup', mUp);
            target.classList.remove('filter_friend_item_move');
        }
        
        function getCoords(target) {
            var box = target.getBoundingClientRect();

            return {
                top: box.top + pageYOffset,
                left: box.left + pageXOffset
            };
        
        }
    });
}

*/



