class MyButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // 点击事件
        this.addEventListener('mousedown', () => {
            // 点击动画
            this.style.animation = 'buttonDown 0.1s ease-out forwards';

            // 用户callback
            if (this.hasAttribute('onClick')) {
                this.getAttribute('onClick');
            }

            document.addEventListener('mouseup', () => {
                this.style.animation = 'buttonUp 0.05s ease-out forwards';
            });
        });
    }
}
customElements.define("my-button", MyButton);

// 16进制输入区
class HexTextArea extends HTMLTextAreaElement {
    constructor() {
        self = super();
        self.spellcheck = false;
    }

    connectedCallback() {
        self.addEventListener('input', (e) => {
            // 输入时，自动过滤掉非16进制字符
            self.value = self.value.replace(/[^0-9a-fA-F]/g, '');

            // 插入空格
            let result = '';
            for (let i = 0; i < self.value.length; i++) {
                result += self.value[i];
                if (i % 2 === 1 && i !== self.value.length - 1) {
                    result += ' ';
                }
            }
            self.value = result;
        });
    }
}
customElements.define("hex-textarea", HexTextArea, { extends: "textarea" });
