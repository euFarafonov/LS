let homeworkContainer = document.querySelector('#homework-container');
let filterNameInput = homeworkContainer.querySelector('#filter-name-input');
let addNameInput = homeworkContainer.querySelector('#add-name-input');
let addValueInput = homeworkContainer.querySelector('#add-value-input');
let addButton = homeworkContainer.querySelector('#add-button');
let listTable = homeworkContainer.querySelector('#list-table tbody');

showCookie();

function showCookie() {
    listTable.innerHTML = '';
    let cookieObj = getCookie();
    
    if (cookieObj) {
        for (let prop in cookieObj) {
            if (filterCookie(prop)) {
                addCookie(prop, cookieObj[prop]);
            }
        }
    }
}

function getCookie() {
    if (document.cookie !== '') {
        let cookieObj = {};
        let cookieArr = document.cookie.split('; ');
        
        for (let i = 0; i < cookieArr.length; i++) {
            let item = cookieArr[i].split('=');
            cookieObj[item[0]] = item[1];
        }
        
        return cookieObj;
    }
}

function filterCookie(cookieName) {
    let filter = filterNameInput.value;
    
    if (filter === '') {
        return true;
    }
    
    return (cookieName.indexOf(filter) > -1);
}

function addCookie(cookieName, cookieValue) {
    let tr = document.createElement('tr');
    let button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.textContent = 'Удалить';
    
    let tdName = document.createElement('td');
    tdName.textContent = cookieName;
    
    let tdVal = document.createElement('td');
    tdVal.textContent = cookieValue;
    
    let tdDel = document.createElement('td');
    tdDel.appendChild(button);
    
    tr.appendChild(tdName);
    tr.appendChild(tdVal);
    tr.appendChild(tdDel);
    
    listTable.appendChild(tr);
    
    button.addEventListener('click', function(){
        delCookie(cookieName, button);
    });
}

function delCookie(cookieName, button) {
    let date = new Date(0);
        
    document.cookie = cookieName + "=; expires=-" + date.toUTCString();
    let parentTr = button.parentElement.parentElement;
    
    if (parentTr.nodeName === 'TR') {
        listTable.removeChild(parentTr);
    }
}

filterNameInput.addEventListener('keyup', function() {
    showCookie();
});

addButton.addEventListener('click', () => {
    let cookieName = addNameInput.value;
    let cookieValue = addValueInput.value;
    let date = new Date(new Date().getTime() + 60 *60 * 1000);
    
    document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toUTCString();
    
    if (filterCookie(cookieName)) {
        let allTr = listTable.querySelectorAll('tr td:first-of-type');
        for (let i = 0; i < allTr.length; i++) {
            if (allTr[i].innerText === cookieName) {
                allTr[i].nextElementSibling.textContent = cookieValue;
                return false;
            }
        }
        addCookie(cookieName, cookieValue);
    }
});