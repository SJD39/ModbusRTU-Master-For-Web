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