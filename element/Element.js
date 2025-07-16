class SingleChoice extends HTMLElement {
    constructor() {
        super();
        this.onValueChangeEventFunc = () => { };
    }
    connectedCallback() {
        this.options = eval(this.getAttribute("options"));
        for (let i = 0; i < this.options.length; i++) {
            let li = document.createElement('li');
            li.className = 'radioLi';
            li.innerText = this.options[i].key;
            li.addEventListener('click', () => {
                this.setValue(this.options[i].value);
            });
            this.append(li);
        }
        this.setValue(eval(this.getAttribute("value")));
    }
    setValue(value) {
        const option = this.options.find(option => option.value === value);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].className = this.children[i].innerText === option.key ? 'radioLi radioLiSelected' : 'radioLi';
        }
        this.value = value;
        this.onValueChangeEventFunc(value);
    }
}
customElements.define("single-choice", SingleChoice);

class MyButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // 点击事件
        this.addEventListener('mousedown', () => {
            // 点击动画
            this.style.animation = 'buttonDown 0.1s ease-out forwards';

            document.addEventListener('mouseup', () => {
                this.style.animation = 'buttonUp 0.05s ease-out forwards';

                // 用户callback
                if (this.hasAttribute('onClick')) {
                    this.getAttribute('onClick');
                }
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
