/** Со звездочкой */
/**
 * Создать страницу с кнопкой
 * При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией
 * Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 * Запрощено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
/**
 * Функция должна создавать и возвращать новый div с классом draggable-div и случайными размерами/цветом/позицией
 * Функция должна только создавать элемент и задвать ему случайные размер/позицию/цвет
 * Функция НЕ должна добавлять элемент на страницу
 *
 * @return {Element}
 */
function createDiv() {
    function getRandomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    var div = document.createElement('div'),
        divWidth = getRandomInt(1, 1000) + 'px',
        divHeight = getRandomInt(1, 1000) + 'px',
        divLeft = getRandomInt(0, 1000) + 'px',
        divTop = getRandomInt(0, 1000) + 'px',
        divColorR = getRandomInt(0, 255),
        divColorG = getRandomInt(0, 255),
        divColorB = getRandomInt(0, 255);
    
    div.classList.add('draggable-div');
    div.style = `width: ${divWidth}; height: ${divHeight}; left: ${divLeft}; top: ${divTop}; background: rgb(${divColorR}, ${divColorG}, ${divColorB}); position: fixed;`;
    
    return div;
}

/**
 * Функция должна добавлять обработчики событий для перетаскивания элемента при помощи drag and drop
 *
 * @param {Element} target
 */
function addListeners(target) {
    target.addEventListener('mousedown', function(event){
        
        document.addEventListener('mousemove', mMove);
        
        function mMove(event){
            target.style.left = event.pageX - target.offsetWidth / 2 + 'px';
            target.style.top = event.pageY - target.offsetHeight / 2 + 'px';
        }
        
        target.addEventListener('mouseup', mUp);
        
        function mUp(event){
            document.removeEventListener('mousemove', mMove);
            target.removeEventListener('mouseup', mUp);
        }
    });
}

let addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function() {
    // создать новый div
    let div = createDiv();

    // добавить на страницу
    homeworkContainer.appendChild(div);
    // назначить обработчики событий мыши для реализации d&d
    addListeners(div);
    // можно не назначать обработчики событий каждому div в отдельности, а использовать делегирование
    // или использовать HTML5 D&D - https://www.html5rocks.com/ru/tutorials/dnd/basics/
});

export {
    createDiv
};