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

        this.CoilCtrlSet = document.createElement('div');
        this.CoilCtrlSet.innerText = '设1';
        this.CoilCtrlSet.addEventListener('click', this.setCallBack);

        this.CoilCtrlReset = document.createElement('div');
        this.CoilCtrlReset.innerText = '设0';
        this.CoilCtrlReset.addEventListener('click', this.resetCallBack);

        this.CoilCtrlDel = document.createElement('div');
        this.CoilCtrlDel.innerText = '删除';
        this.CoilCtrlDel.style.color = 'red';
        this.CoilCtrlDel.addEventListener('click', () => {
            this.remove();
        });

        this.CoilCtrlInfo = document.createElement('div');
        this.CoilCtrlInfo.innerText = `05,${this.station},${this.addr}`;

        this.append(this.CoilCtrlSet, this.CoilCtrlReset, this.CoilCtrlInfo, this.CoilCtrlDel);

        // 窗口拖动
        this.draging = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.addEventListener('mousedown', (e) => {
            if (this.runMode != 0) {
                return;
            }
            this.draging = true;
            this.offsetX = this.mouseX - this.offsetLeft;
            this.offsetY = this.mouseY - this.offsetTop;

            this.drag();
        });

        this.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
        });

        document.addEventListener('mouseup', (e) => {
            this.draging = false;
        });

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    // 拖动动画
    drag() {
        this.style.left = this.mouseX - this.offsetX + 'px';
        this.style.top = this.mouseY - this.offsetY + 'px';

        if (this.draging) {
            window.requestAnimationFrame(() => {
                this.drag();
            });
        }
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