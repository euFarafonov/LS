/* ДЗ 3 - работа с массивами и объеектами */

/*
 Задача 1:
 Напишите аналог встроенного метода forEach для работы с массивами
 */
function forEach(array, fn) {
    for (var i = 0; i < array.length; i++) {
        fn(array[i], i, array);
    }
}

/*
 Задача 2:
 Напишите аналог встроенного метода map для работы с массивами
 */
function map(array, fn) {
    var newArr = [],
        newItem;
    
    for (var i = 0; i < array.length; i++) {
        newItem = fn(array[i], i, array);
        newArr.push(newItem);
    }
    
    return newArr;
}

/*
 Задача 3:
 Напишите аналог встроенного метода reduce для работы с массивами
 */
function reduce(array, fn, initial) {
    var i;
    
    if (initial) {
        i = 0;
    } else {
        i = 1;
        initial = array[0];
    }
    
    for (; i < array.length; i++) {
        initial = fn(initial, array[i], i, array);
    }
    
    return initial;
}

/*
 Задача 4:
 Функция принимает объект и имя свойства, которое необходиом удалить из объекта
 Функция должна удалить указанное свойство из указанного объекта
 */
function deleteProperty(obj, prop) {
    delete obj[prop];
}

/*
 Задача 5:
 Функция принимает объект и имя свойства и возвращает true или false
 Функция должна проверить существует ли укзаанное свойство в указанном объекте
 */
function hasProperty(obj, prop) {
    return (prop in obj) ? true : false;
}

/*
 Задача 6:
 Функция должна получить все перечисляемые свойства объекта и вернуть их в виде массива
 */
function getEnumProps(obj) {
    return Object.keys(obj);
}

/*
 Задача 7:
 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистра и вернуть в виде массива
 */
function upperProps(obj) {
    var names = [];
    
    for (var prop in obj) {
        names.push(prop.toUpperCase());
    }
    
    return names;
}

/*
 Задача 8 *:
 Напишите аналог встроенного метода slice для работы с массивами
 */
function slice(array, from, to) {
    var newArr = [],
        len = array.length;
        
    if (from < 0) {
        from = len + from;
    }
    
    if (to < 0) {
        to = len + to;
    }
    
    if (!from || from > len || !isFinite(from)) {
        from = 0;
    }
    
    if (!to || to > len || !isFinite(to)) {
        to = len;
    }
    
    for (; from < to ; from++) {
        newArr.push(array[from]);
    }
    
    return newArr;
}

/*
 Задача 9 *:
 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
    var proxy = new Proxy(obj, {
        set(target, prop, val) {
            target[prop] = val * val;
            
            return true;
        }
    });
    
    return proxy;
}

export {
    forEach,
    map,
    reduce,
    deleteProperty,
    hasProperty,
    getEnumProps,
    upperProps,
    slice,
    createProxy
};
