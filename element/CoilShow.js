class CoilShow extends HTMLElement {
    static observedAttributes = ["addr"];

    constructor() {
        super();
    }

    connectedCallback() {
        this.runMode = 0;
        this.station;
        this.addr;

        this.className = 'coilShowBox';

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
        this.draging = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.addEventListener('mousedown', (e) => {
            if(this.runMode != 0){
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