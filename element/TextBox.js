class TextShow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.runMode = 0;

        this.className = 'textShow';
        this.draggable = true;

        this.TextShowValue = document.createElement('div');

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