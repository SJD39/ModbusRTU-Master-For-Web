class MDElement extends HTMLElement {
    constructor() {
        super();
        this.runMode = 0;
    }
    connectedCallback() {
        this.draggable = true;

        this.tagBox = document.createElement('span');
        this.tagBox.innerText = this.tag;

        this.Info = document.createElement('div');
        this.Info.style.display = 'flex';
        this.Info.style.justifyContent = 'space-between';

        this.InfoType = document.createElement('drop-down');

        this.InfoStation = document.createElement('span');
        this.InfoStation.style.paddingLeft = '6px';
        this.InfoStation.innerText = this.station;

        this.InfoAddr = document.createElement('span');
        this.InfoAddr.style.paddingLeft = '6px';
        this.InfoAddr.innerText = this.addr;

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
        this.value = false;
        this.valueType = 'BOOL';
    }
    connectedCallback() {
        super.connectedCallback();

        this.className = 'coilCtrlBox';

        this.CoilCtrlValue = document.createElement('span');
        this.CoilCtrlValue.innerText = `值：${this.value}`;
        this.CoilCtrlValue.addEventListener('click', async () => {
            if (this.runMode === 0) {
                return;
            }
            await this.setCoilFun(this.station, this.addr, !this.value);
        });

        this.Info.append(this.InfoType, this.InfoStation, this.InfoAddr);
        this.append(this.tagBox, this.CoilCtrlValue, this.Info, this.delBox);
        this.InfoType.dropDownMenuKey.style.color = '#39c5bb';
        this.InfoType.setOptions([{ key: 'BOOL', value: 'BOOL' }]);
        this.InfoType.setValue(this.valueType);
    }
    setValue(value) {
        this.value = value;
        this.CoilCtrlValue.innerText = `值：${this.value}`;
    }
}
customElements.define("coil-ctrl", CoilCtrl);

class RegCtrl extends MDElement {
    constructor() {
        super();
        this.value = 0;
        this.valueType = 'UINT16';
    }
    connectedCallback() {
        super.connectedCallback();
        this.className = 'regCtrlBox';
        this.RegCtrlValue = document.createElement('span');
        this.RegCtrlValue.innerText = `值：${this.value}`;
        this.RegCtrlValue.addEventListener('click', async () => {
            if (this.runMode === 0) {
                return;
            }
            await this.setRegFun(this.station, this.addr, this.value);
        });

        this.Info.append(this.InfoType, this.InfoStation, this.InfoAddr);
        this.append(this.tagBox, this.RegCtrlValue, this.Info, this.delBox);
        this.InfoType.dropDownMenuKey.style.color = '#39c5bb';
        this.InfoType.setOptions([
            { key: 'INT16', value: 'INT16' },
            { key: 'UINT16', value: 'UINT16' },
            { key: 'INT32', value: 'INT32' },
            { key: 'UINT32', value: 'UINT32' },
            { key: 'Float', value: 'Float' }
        ]);
        this.InfoType.setValue(this.valueType);
    }
    setValue(value) {
        this.value = value;
        this.RegCtrlValue.innerText = `值：${this.value}`;
    }
}
customElements.define("reg-ctrl", RegCtrl);