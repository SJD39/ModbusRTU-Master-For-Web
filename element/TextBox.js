class TextShow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.runMode = 0;

        this.className = 'textShow';

        this.TextShowValue = document.createElement('div');

        this.TextShowDel = document.createElement('div');
        this.TextShowDel.innerText = '删除';
        this.TextShowDel.style.color = 'red';
        this.TextShowDel.addEventListener('click', () => {
            this.remove();
        });

        this.append(this.TextShowValue, this.TextShowDel);

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

    setText(text){
        this.TextShowValue.innerText = text;
    }

    getText(){
        return this.TextShowValue.innerText;
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