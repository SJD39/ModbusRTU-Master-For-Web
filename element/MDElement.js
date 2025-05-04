class MDElement extends HTMLElement {
    constructor() {
        super();
        this.runMode = 0;
    }
    connectedCallback() {
        this.draggable = true;

        this.tagBox = document.createElement('span');
        this.tagBox.innerText = this.tag;

        this.delBox = document.createElement('span');
        this.delBox.innerText = '删除';
        this.delBox.style.color = 'red';
        this.delBox.style.textAlign = 'center';
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
        this.value = false;
        this.setCoilFun = async () => { };
    }
    connectedCallback() {
        super.connectedCallback();

        this.className = 'coilCtrlBox';

        this.CoilCtrlValue = document.createElement('span');
        this.CoilCtrlValue.innerText = `值：${this.value}`;
        this.CoilCtrlValue.addEventListener('click', async () => {
            if(this.runMode === 0){
                return;
            }
            await this.setCoilFun(this.station, this.addr, !this.value);
        });

        this.CoilCtrlInfo = document.createElement('div');
        this.CoilCtrlInfo.style.display = 'flex';
        this.CoilCtrlInfo.style.justifyContent = 'space-between';
        this.CoilCtrlInfoType = document.createElement('span');
        this.CoilCtrlInfoType.innerText = 'BOOL';

        this.CoilCtrlInfoStation = document.createElement('span');
        this.CoilCtrlInfoStation.style.paddingLeft = '6px';
        this.CoilCtrlInfoStation.innerText = this.station;

        this.CoilCtrlInfoAddr = document.createElement('span');
        this.CoilCtrlInfoAddr.style.paddingLeft = '6px';
        this.CoilCtrlInfoAddr.innerText = this.addr;

        this.CoilCtrlInfo.append(this.CoilCtrlInfoType, this.CoilCtrlInfoStation, this.CoilCtrlInfoAddr);
        this.append(this.tagBox, this.CoilCtrlValue, this.CoilCtrlInfo, this.delBox);
    }
    setValue(value) {
        this.value = value;
        this.CoilCtrlValue.innerText = `值：${this.value}`;
    }
}
customElements.define("coil-ctrl", CoilCtrl);
