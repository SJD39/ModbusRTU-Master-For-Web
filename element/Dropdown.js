class Dropdown extends HTMLElement {
    static observedAttributes = ["value", "options"];

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
            if(this.dropDownUl.style.display == 'none'){
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