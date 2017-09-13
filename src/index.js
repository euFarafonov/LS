/* ДЗ 6.1 - Асинхронность и работа с сетью */

/**
 * Функция должна создавать Promise, который должен быть resolved через seconds секунду после создания
 *
 * @param {number} seconds - количество секунд, через которое Promise должен быть resolved
 * @return {Promise}
 */
function delayPromise(seconds) {
    var p = new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, seconds*1000);
    });
    
    return p;
}

/**
 * Функция должна вернуть Promise, который должен быть разрешен массивом городов, загруженным из
 * https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * Элементы полученного массива должны быть отсортированы по имени города
 *
 * @return {Promise<Array<{name: String}>>}
 */
function loadAndSortTowns() {
    var p = new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        
        xhr.open('GET', 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json');
        xhr.send();
        xhr.responseType = 'json';
        
        xhr.addEventListener('load', function(){
            var arr = xhr.response;
            
            arr.sort(sortArr);
            resolve(arr);
        });
    }).then(function(arr){
        return arr;
    });
    
    function sortArr(a, b) {
        if (a['name'] > b['name']) return 1; 
        if (a['name'] < b['name']) return -1; 
        return 0;
    }   
    
    return p;
}

export {
    delayPromise,
    loadAndSortTowns
};
