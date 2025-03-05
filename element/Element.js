class CoilCtrl extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.runMode = 0;
        this.station;
        this.addr;
        this.setCallBackFun = function(){};
        this.resetCallBackFun = function(){};

        this.className = 'coilCtrlBox';
        this.draggable = true;

        this.CoilCtrlSet = document.createElement('div');
        this.CoilCtrlSet.innerText = '设1';
        this.CoilCtrlSet.addEventListener('click', this.setCallBack);

        this.CoilCtrlReset = document.createElement('div');
        this.CoilCtrlReset.innerText = '设0';
        this.CoilCtrlReset.addEventListener('click', this.resetCallBack);

        this.CoilCtrlDel = document.createElement('div');
        this.CoilCtrlDel.innerText = 'Del';
        this.CoilCtrlDel.style.color = 'red';
        this.CoilCtrlDel.addEventListener('click', () => {
            this.remove();
        });

        this.CoilCtrlInfo = document.createElement('div');
        this.CoilCtrlInfo.innerText = `05,${this.station},${this.addr}`;

        this.append(this.CoilCtrlSet, this.CoilCtrlReset, this.CoilCtrlInfo, this.CoilCtrlDel);

        // 窗口拖动
        this.addEventListener('dragstart', (e) => {
            let x = e.clientX - this.offsetLeft;
            let y = e.clientY - this.offsetTop;
            this.addEventListener('dragend', (e) => {
                if(this.runMode != 0){
                    return;
                }

                this.style.left = (e.clientX - x) + 'px';
                this.style.top = (e.clientY - y) + 'px';
            });
        });
    }

    setCallBack(){
        if(this.runMode != 1){
            return;
        }
        this.setCallBackFun(this.station, this.addr);
    }

    resetCallBack(){
        if(this.runMode != 1){
            return;
        }
        this.resetCallBackFun(this.station, this.addr);
    }

    toRunMode() {
        this.CoilCtrlDel.style.display = 'none';
        this.runMode = 1;
    }

    toEditorMode() {
        this.CoilCtrlDel.style.display = 'block';
        this.runMode = 0;
    }
}

customElements.define("coil-ctrl", CoilCtrl);

class CoilShow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.runMode = 0;
        this.station;
        this.addr;

        this.className = 'coilShowBox';
        this.draggable = true;

        this.coilShowValue = document.createElement('div');
        this.coilShowValue.innerText = 'False';

        this.coilShowDel = document.createElement('div');
        this.coilShowDel.innerText = '删除';
        this.coilShowDel.style.color = 'red';
        this.coilShowDel.addEventListener('click', () => {
            this.remove();
        });

        this.coilShowInfo = document.createElement('div');
        this.coilShowInfo.innerText = `01,${this.station},${this.addr}`;

        this.append(this.coilShowValue, this.coilShowInfo, this.coilShowDel);

        // 窗口拖动
        this.addEventListener('dragstart', (e) => {
            let x = e.clientX - this.offsetLeft;
            let y = e.clientY - this.offsetTop;
            this.addEventListener('dragend', (e) => {
                if(this.runMode != 0){
                    return;
                }

                this.style.left = (e.clientX - x) + 'px';
                this.style.top = (e.clientY - y) + 'px';
            });
        });
    }

    toRunMode() {
        this.coilShowDel.style.display = 'none';
        this.runMode = 1;
    }

    toEditorMode() {
        this.coilShowDel.style.display = 'block';
        this.runMode = 0;
    }
}

customElements.define("coil-show", CoilShow);


class TextShow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.runMode = 0;
        this.text = '默认文字';

        this.className = 'textShow';
        this.draggable = true;

        this.TextShowValue = document.createElement('div');
        this.TextShowValue.innerText = this.text;

        this.TextShowDel = document.createElement('div');
        this.TextShowDel.innerText = '删除';
        this.TextShowDel.style.color = 'red';
        this.TextShowDel.addEventListener('click', () => {
            this.remove();
        });

        this.append(this.TextShowValue, this.TextShowDel);

        // 窗口拖动
        this.addEventListener('dragstart', (e) => {
            let x = e.clientX - this.offsetLeft;
            let y = e.clientY - this.offsetTop;
            this.addEventListener('dragend', (e) => {
                if(this.runMode != 0){
                    return;
                }

                this.style.left = (e.clientX - x) + 'px';
                this.style.top = (e.clientY - y) + 'px';
            });
        });
    }

    setText(){
        this.TextShowValue.innerText = this.text;
    }

    toRunMode() {
        this.TextShowDel.style.display = 'none';
        this.runMode = 1;
    }

    toEditorMode() {
        this.TextShowDel.style.display = 'block';
        this.runMode = 0;
    }
}

customElements.define("text-show", TextShow);

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