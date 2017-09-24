var allFriends = [];
var selectFriends = [];
var filterContainer = document.getElementById('filter_container');
var filterLeft = document.getElementById('js_filter_left');
var filterRight = document.getElementById('js_filter_right');
var friendListLeft = document.getElementById('js_friend_list_left');
var friendListRight = document.getElementById('js_friend_list_right');
var filterSave = document.querySelector('.filter_save');

filterLeft.value = '';
filterRight.value = '';

if (localStorage.left && localStorage.right) {
    allFriends = JSON.parse(localStorage.left);
    selectFriends = JSON.parse(localStorage.right);
    
    friendListLeft.innerHTML = '';
    friendListRight.innerHTML = '';
    
    allFriends.forEach(function(friend){
        showFriend(friend, friendListLeft);
    });
    
    selectFriends.forEach(function(friend){
        showFriend(friend, friendListRight);
    });
} else {
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
}

/* Первоначальное заполнение списка друзей */
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

function showFriend(friend, parentBlock) {
    let friendLi = document.createElement('li');
    friendLi.classList.add('filter_friend_item');
    friendLi.classList.add('js_drag');
    friendLi.classList.add('clearfix');
    friendLi.dataset.id = friend.id;
    
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
}

/* Фильтрация списков */
document.addEventListener('keyup', function(event){
    let target = event.target;
    
    if (target.nodeName !== 'INPUT') return false;
    
    let filterText = target.value;
    let side = target.id.split('_')[2];
    let parentId = 'js_friend_list_' + side;
    let parentEl = document.getElementById(parentId);
    let arr = (side === 'left') ? allFriends : selectFriends;
    
    parentEl.innerHTML = '';
    
    arr.forEach(function(friend){
        if ( filterFriend(friend.first_name, filterText) || filterFriend(friend.last_name, filterText) ) {
            showFriend(friend, parentEl);
        }
    });
});

function filterFriend(name, filter) {
    return (name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
}

/* Сохранение списков */
filterSave.addEventListener('click', function(event){
    localStorage.left = JSON.stringify(allFriends);
    localStorage.right = JSON.stringify(selectFriends);
});

/* Перемещение друзей по клику */
filterContainer.addEventListener('click', function(event){
    var target = event.target;
    
    if (target.classList.contains('action')) {
        var moveEl = target.parentElement;
        var moveElId = moveEl.dataset.id;
        var side = moveEl.parentElement.id.split('_')[3];
        var arrId = null;
        
        function changeElement(arr1, arr2) {
            for (var i = 0; i < arr1.length; i++) {
                if (arr1[i].id == moveElId){
                    arrId = i;
                    break;
                }
            }
            
            if (arrId !== null) {
                var delEl = arr1.splice(arrId, 1);
                arr2.push(delEl[0]);
            }
        }
        
        if (side === 'left') {
            changeElement(allFriends, selectFriends);
        } else {
            changeElement(selectFriends, allFriends);
        }
        
        friendListLeft.innerHTML = '';
        friendListRight.innerHTML = '';
        
        allFriends.forEach(function(friend){
            showFriend(friend, friendListLeft);
        });
        
        selectFriends.forEach(function(friend){
            showFriend(friend, friendListRight);
        });
    }
});

/* Перемещение друзей DnD */
var dragObject = {};

document.addEventListener('mousedown', function(event){
    if (event.which !== 1) return  false;
    
    var elem = event.target.closest('.js_drag');
    
    if (!elem) return false;
    
    dragObject.elem = elem;
    dragObject.downX = event.pageX;
    dragObject.downY = event.pageY;
});

document.addEventListener('mousemove', function(event){
    if (!dragObject.elem) return false;
    
    if (!dragObject.avatar) {
        var moveX = event.pageX - dragObject.downX;
        var moveY = event.pageY - dragObject.downY;
        
        if (Math.abs(moveX) < 10 && Math.abs(moveY) < 10) return false;
        
        dragObject.avatar = createAvatar(event);
        
        if (!dragObject.avatar) {
            dragObject = {};
            return;
        }
        
        var coords = getCoords(dragObject.avatar);
        
        dragObject.shiftX = dragObject.downX - coords.left;
        dragObject.shiftY = dragObject.downY - coords.top;
        
        startDrag(event);
    }
    
    dragObject.avatar.style.left = event.pageX - dragObject.shiftX + 'px';
    dragObject.avatar.style.top = event.pageY - dragObject.shiftY + 'px';
    
    return false;
});

function createAvatar(e) {
    var avatar = dragObject.elem;
    var old = {
        parent: avatar.parentElement,
        nextSibling: avatar.nextElementSibling,
        position: avatar.position || '',
        left: avatar.left || '',
        top: avatar.top || '',
        zIndex: avatar.zIndex || ''
    };
    
    avatar.rollback = function() {
        old.parent.insertBefore(avatar, old.nextSibling);
        avatar.style.position = old.position;
        avatar.style.left = old.left;
        avatar.style.top = old.top;
        avatar.style.zIndex = old.zIndex
    };
    
    return avatar;
}

function getCoords(target) {
    var box = target.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
}

function startDrag(event) {
    var avatar = dragObject.avatar;
    
    document.body.appendChild(avatar);
    avatar.style.zIndex = 1000;
    avatar.style.position = 'absolute';
}

document.addEventListener('mouseup', function(event){
    if (dragObject.avatar) {
        finishDrag(event);
    }
    
    dragObject = {};
});

function finishDrag(e) {
    var dropElem = findDroppable(e);
    
    if (dropElem) {
        //dropElem.appendChild(dragObject.avatar);
        //dragObject.avatar.style.zIndex = '';
        //dragObject.avatar.style.position = '';
        //console.log(dragObject.avatar);
        console.log('OK');
    } else {
        console.log('ERROR');
    }
}

function findDroppable(event) {
    dragObject.avatar.hidden = true;
    
    var elem = document.elementFromPoint(event.clientX, event.clientY);
    
    dragObject.avatar.hidden = false;
    
    if (elem == null) {// такое возможно, если курсор мыши "вылетел" за границу окна
        return null;
    }
    
    return elem.closest('.js_drop');
}