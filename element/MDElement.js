class MDElement extends HTMLElement {
    constructor() {
        super();
        this.runMode = 0;
    }

    connectedCallback() {
        this.draggable = true;
        this.delBox = document.createElement('div');
        this.delBox.innerText = '删除';
        this.delBox.style.color = 'red';
        this.delBox.addEventListener('click', () => {
            this.remove();
        });

        // 窗口拖动
        this.addEventListener('dragstart', (e) => {
            let x = e.clientX - this.offsetLeft;
            let y = e.clientY - this.offsetTop;
            this.addEventListener('dragend', (e) => {
                this.style.left = (e.clientX - x) + 'px';
                this.style.top = (e.clientY - y) + 'px';
            });
        });
    }

    toShowMode() {
        this.delBox.style.display = 'none';
        this.runMode = 1;
        this.draggable = false;
    }

    toEditMode() {
        this.delBox.style.display = 'block';
        this.runMode = 0;
        this.draggable = true;
    }
}

class CoilCtrl extends MDElement {
    constructor() {
        super();
        this.station;
        this.addr;
    }

    connectedCallback() {
        super.connectedCallback();

        this.setCallBackFun = function(){};
        this.resetCallBackFun = function(){};

        this.className = 'coilCtrlBox';
        this.CoilCtrlSet = document.createElement('div');
        this.CoilCtrlSet.innerText = '设1';
        this.CoilCtrlSet.addEventListener('click', this.setCallBack);

        this.CoilCtrlReset = document.createElement('div');
        this.CoilCtrlReset.innerText = '设0';
        this.CoilCtrlReset.addEventListener('click', this.resetCallBack);

        this.CoilCtrlInfo = document.createElement('div');
        this.CoilCtrlInfo.innerText = `05,${this.station},${this.addr}`;

        this.append(this.CoilCtrlSet, this.CoilCtrlReset, this.CoilCtrlInfo, this.delBox);
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
}

customElements.define("coil-ctrl", CoilCtrl);

class CoilShow extends MDElement {
    constructor() {
        super();
        this.station;
        this.addr;
    }

    connectedCallback() {
        this.className = 'coilShowBox';

        this.coilShowValue = document.createElement('div');
        this.coilShowValue.innerText = 'False';

        this.coilShowInfo = document.createElement('div');
        this.coilShowInfo.innerText = `01,${this.station},${this.addr}`;

        this.append(this.coilShowValue, this.coilShowInfo, this.coilShowDel);
    }
}

customElements.define("coil-show", CoilShow);

class TextShow extends MDElement {
    constructor() {
        super();

        this.text = '默认文字';
    }

    connectedCallback() {
        super.connectedCallback();

        this.className = 'textShow';
        this.TextShowValue = document.createElement('div');
        this.TextShowValue.innerText = this.text;

        this.append(this.TextShowValue, this.delBox);
    }
}

customElements.define("text-show", TextShow);