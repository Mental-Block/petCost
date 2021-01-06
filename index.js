"use strict";

const APP = (() => {
    const UTIL = {
        elId: (el) => document.getElementById(el),
        el: (el, getall) => {
            let select = el.trim();
            if (select.indexOf(",") > -1 || select.indexOf(" ") > -1 || getall === true) return document.querySelectorAll(select);
            else return document.querySelector(select);
        },
        generateId: () => Math.floor(Math.random() * Date.now()),
        convertToArray: (nodeList) => Array.from(nodeList),
        removeNode: (node) => node.remove(),
        filterNodesbyTag: (array, comp, tag) => {
          let res = array.filter(el => el.getAttribute(tag) === comp.getAttribute(tag))
          return res[0]
        }
    }

    const EVENT = {
        click: "click",
        onChange: "change",
        onDrag: "drag"
    }

    const INITALSTATE = [
        {name: "food", label: "Food", value: 0}, 
        {name: "meds", label: "Meds", value: 0}, 
        {name: "vet",  label: "Vet",  value: 0},
        {name: "toys", label: "Toys", value: 0},
        {name: "misc", label: "Misc", value: 0}
    ];

    const STATE = {
        CATEGORIES : [...INITALSTATE],
    };

    const CHART = (labels, data) => {
        const ctx = UTIL.elId("chart").getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
        });
    }

    const PROMPT = (() => {
      function create(){
        const prompt = `
            <div class="prompt" id="prompt">
                <div class="prompt__container">
                    <label>
                        What expense would you like to add?
                        <input id="promptInput" class="prompt__input" placeholder="vacations..." type="text" />
                    </label>
                    <span id="promptX" class="prompt_x"></span>
                    <button id="promptAdd" class="button">Add</button>
                </div>
            </div>
        `;        
            
        UTIL.el("body").insertAdjacentHTML("afterbegin", prompt);
        UTIL.elId("promptX").addEventListener(EVENT.click, remove)
        UTIL.elId("promptAdd").addEventListener(EVENT.click, () => CATEGORY.add(UTIL.elId("promptInput").value))
    }

      function remove(){
        UTIL.removeNode(UTIL.elId("prompt")); 
    }

     return {remove, create}
    })()

    const CATEGORY = (() => {
        function create(name, label, value){
            if(isNaN(value)) value = 0;

            const section = `
                    <div data-name=${name} class="category__section">
                        <div class="category__control space-between">
                            <h2 class="category__section__header" >${label}</h2>
                            <div class="right">
                                <input class="category__amount__feild" data-input=${name} name=${name} type="number" min="1" max="1000" value="${value}"/>
                                <label class="category__amount" for=${name}>/ Month</label>
                            </div>
                        </div>

                        <div class="category__control">
                            <input class="category__slider" name=${name} data-slider=${name} type="range" min="1" max="1000" value="${value}">
                            <div class="space-between">
                                <span class="category__slider__min">0</span>
                                <span class="category__slider__max">1000</span>
                            </div>
                        </div>

                        <button data-del class="category__del"></button>
                    </div>
                    `;

            UTIL.elId("inputBoxes").insertAdjacentHTML("beforeend", section);
        }

        function remove(el) {
            UTIL.removeNode(el);
            STATE.CATEGORIES = getStateByTag(el, "data-name", true)
            INIT();
        }

        function getStateByTag(el, tag, inverse){
            if(inverse) return STATE.CATEGORIES.filter(({name}) => name !== el.getAttribute(tag))
            return STATE.CATEGORIES.filter(({name}) => name === el.getAttribute(tag))[0]
        }

        function removeAll(arrayOfEl){   
            arrayOfEl.map(el => UTIL.removeNode(el))
        }

        function nameCreate(str) {
            str = str.toLowerCase()
            return str
        }
    
        function labelCreate(str){
            str = str.replace(/[^a-zA-Z]/gi, ''); // filter all the crap
            if(str.length !== 0){
                let start = str.substring(0, 1).toLocaleUpperCase() 
                let end = str.substring(1, str.length)
                str = start + end
            }       
            else str = "Defualt Value"

            return str;   
        }
    
        function add(str){
            const label = labelCreate(str)
            const name = nameCreate(label); 
            const value = 0;
       
            STATE.CATEGORIES = [...STATE.CATEGORIES, {name, label, value}]
            PROMPT.remove();
            INIT();
        }    

        function keepValueSame(el, elOne, tag){
            if(el.value > 1000) el.value = 1000;
            if(isNaN(el.value)) el.value = 0;
            
            const {name, label} = getStateByTag(el, tag);
            let newValue = elOne.value = el.value;
            let newCategoy = {name: name, label: label,  value:parseInt(newValue)};
            
            let index = STATE.CATEGORIES.findIndex((category) => category.name === name);
            STATE.CATEGORIES[index] = newCategoy;
            INIT()
        }

        function addTotal(array){
            let total = 0;
            if(array.length === 0) total = 0
            else total = array.reduce((total, value) => total + value)
            if(isNaN(array)) total = 0;

            UTIL.elId("amount").innerHTML = `Estimated dollars $${total} per month`
        }

        return {
            add,
            create, 
            keepValueSame,
            remove,
            removeAll,
            addTotal
        }
    })()
    
    const INIT = () => {
        CATEGORY.removeAll(UTIL.convertToArray(UTIL.el('[data-name]', true))); // REMOVE PREVIOUSLY RENDERED CATEGORIES
        STATE.CATEGORIES.map(({name, label, value}) => CATEGORY.create(name, label, value)) // RENDER CATEGORIES
        CHART(STATE.CATEGORIES.map(({label}) => label), STATE.CATEGORIES.map(({value}) => value)) // RENDER CHART
        CATEGORY.addTotal(STATE.CATEGORIES.map(({value}) => value)) // RENDER TOTAL

        const OPEN_PROMPT = UTIL.elId("categoryAdd") // OPEN PROMPT BUTTON
        const REMOVE_BUTTON = UTIL.convertToArray(UTIL.el('[data-del]', true)) // CATEGORIE BUTTONS
        const INPUTS = UTIL.convertToArray(UTIL.el('[data-input]', true)); // INPUTS
        const SLIDERS = UTIL.convertToArray(UTIL.el('[data-slider]', true)); //SLIDERS
       


        OPEN_PROMPT.addEventListener(EVENT.click, PROMPT.create); 
        INPUTS.map(input => input.addEventListener(EVENT.onChange, (event) => CATEGORY.keepValueSame(event.target, UTIL.filterNodesbyTag(SLIDERS, event.target, "name"), "data-input"))) 
        SLIDERS.map(slider => slider.addEventListener(EVENT.onChange, (event) => CATEGORY.keepValueSame( event.target, UTIL.filterNodesbyTag(INPUTS, event.target, "name"), "data-slider")))
        REMOVE_BUTTON.map(button => button.addEventListener(EVENT.click, (event) => CATEGORY.remove(event.path[1])))
    } 
    
    UTIL.elId("categoryRest").addEventListener(EVENT.click, () => {STATE.CATEGORIES = INITALSTATE; INIT()}) 

    return {INIT}
})()

APP.INIT();