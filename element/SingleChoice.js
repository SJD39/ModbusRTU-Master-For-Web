class SingleChoice extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.clickCallback = function(){};
        this.options = JSON.parse(this.getAttribute("options"));

        this.liElements = [];
        this.radioUl = document.createElement('ul');

        this.className = 'radioBox';
        this.radioUl.className = 'radioUl';

        this.options.forEach((option, index) => {
            let li = document.createElement('li');
            li.className = 'radioLi';
            li.innerHTML = option;

            li.addEventListener('click', () => {
                this.setValue(index);
                this.clickCallback();
            });

            this.liElements.push(li);
            this.radioUl.append(li);
        });

        this.append(this.radioUl);

        // 初始化值
        this.value = 0;
        if (this.hasAttribute('value')) {
            this.setValue(this.getAttribute("value"));
        } else {
            this.setValue(0);
        }
    }

    setValue(id) {
        this.liElements[this.value].className = 'radioLi';
        this.liElements[id].className = 'radioLi radioLiSelected';
        this.value = id;
    }

    getValue() {
        return this.value;
    }

    getOption(){
        return this.options[this.value];
    }
}

customElements.define("single-choice", SingleChoice);