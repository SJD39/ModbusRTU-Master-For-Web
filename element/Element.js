



class Dropdown extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.options = JSON.parse(this.getAttribute("options"));
        
        this.dropDownViewBox = document.createElement('div');
        this.dropDownView = document.createElement('span');
        this.dropDownUl = document.createElement('ul');

        this.className = 'dropDownBox';
        this.dropDownViewBox.className = 'dropDownViewBox';
        this.dropDownView.className = 'dropDownView';
        this.dropDownUl.className = 'dropDownUl';
        this.dropDownUl.style.display = 'none';

        this.options.forEach((option, index) => {
            let li = document.createElement('li');
            li.innerText = option;
            li.addEventListener('click', () => {
                this.setValue(index)
                this.hide();
            });
            this.dropDownUl.append(li);
        });

        this.dropDownViewBox.addEventListener('click', () => {
            if(this.dropDownUl.style.display === 'none'){
                this.show();
            }else{
                this.hide();
            }
        });

        this.dropDownViewBox.append(this.dropDownView);
        this.append(this.dropDownViewBox, this.dropDownUl);

        // 初始化值
        this.value = 0;
        if(this.hasAttribute("value")){
            this.setValue(this.getAttribute("value"));
        }else{
            this.setValue(0);
        }
    }

    // 设置值
    setValue(id) {
        this.value = id;
        this.dropDownView.innerText = this.options[this.value];
    }

    // 显示
    show() {
        this.dropDownUl.style.display = 'block';
        this.dropDownUl.style.zIndex = 100;
    }

    // 隐藏选择
    hide() {
        this.dropDownUl.style.display = 'none';
        this.dropDownUl.style.zIndex = 0;
    }

    getValue() {
        return this.value;
    }

    getOption(){
        return this.options[this.value];
    }
}

customElements.define("drop-down", Dropdown);

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

class PopupTip extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.className = 'popupTipBox';
        this.duration = 1000;
    }

    popup(){
        this.style.display = 'block';
        this.style.animation = 'popupTipPopup 0.5s ease-out forwards';
        setTimeout(() => {
            this.style.animation = 'popupTipDieout 0.5s ease-out forwards';
            setTimeout(() => {
                this.style.display = 'none';
            }, 500);
        }, this.duration);
    }
}

customElements.define("popup-tip", PopupTip);