class CoilShow extends HTMLElement {
    static observedAttributes = ["addr"];

    constructor() {
        super();
    }

    connectedCallback() {
        this.station;
        this.addr;

        this.coilShowBox = document.createElement('div');
        this.className = 'coilShowBox';
        this.innerText = 'False';

        this.append(this.coilShowBox);

        // 窗口拖动
        this.draging = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.addEventListener('mousedown', (e) => {
            this.draging = true;
            this.offsetX = this.mouseX - this.offsetLeft;
            this.offsetY = this.mouseY - this.offsetTop;

            this.drag();
        })

        this.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
        })

        document.addEventListener('mouseup', (e) => {
            this.draging = false;
        })

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        })
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
}

customElements.define("coil-show", CoilShow);