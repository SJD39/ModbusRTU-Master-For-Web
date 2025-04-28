class Dropdown extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        // 创建元素
        this.dropDownTag = document.createElement('span');
        this.dropDownMenu = document.createElement('span');
        this.dropDownMenuKey = document.createElement('span');
        this.dropDownDialog = document.createElement('dialog');
        this.dropDownDialog.className = 'dropDownDialog';
        this.dropDownMenu.style.position = 'relative';
        // 初始化tag
        if (this.hasAttribute("tag")) {
            this.dropDownTag.innerText = this.getAttribute("tag");
        }
        // 初始化值
        if (this.hasAttribute("value")) {
            this.value = Number(this.getAttribute("value"));
        }
        // 菜单方向
        this.menuDir = this.hasAttribute("menuDir") ? this.getAttribute("menuDir") : 'down';
        if (this.menuDir === 'down') {
            this.dropDownDialog.style.top = '30px';
        } else if (this.menuDir === 'up') {
            this.dropDownDialog.style.bottom = '30px';
        }
        // 显示菜单
        this.dropDownTag.addEventListener('click', () => this.notMenu());
        this.dropDownMenuKey.addEventListener('click', () => this.notMenu());
        // 组合元素
        this.dropDownMenu.append(this.dropDownMenuKey, this.dropDownDialog);
        this.append(this.dropDownTag, this.dropDownMenu);
    }
    setOptions(options) {
        this.dropDownDialog.innerHTML = '';
        options.forEach((option) => {
            let li = document.createElement('li');
            li.innerText = option.key;
            li.addEventListener('click', () => {
                this.setValue(option.value);
                this.dropDownDialog.close();
            });
            this.dropDownDialog.append(li);
        });
        this.options = options;
        this.setValue(this.value === undefined ? this.options[0].value : this.value);
    }
    setValue(value) {
        const option = this.options.find(option => option.value == value);
        this.dropDownMenuKey.innerText = option.key;
        this.value = Number(value);
    }

    notMenu() {
        if(this.dropDownDialog.open){
            this.dropDownDialog.close();
        }else{
            this.dropDownDialog.show();
        }
    }
}
customElements.define("drop-down", Dropdown);

class SingleChoice extends HTMLElement {
    constructor() {
        super();
        this.value = null;
        this.options = [];
        this.onValueChangeEvent = () => { };
    }

    render() {
        this.options.forEach((option) => {
            let li = document.createElement('li');
            li.className = 'radioLi';
            li.innerText = option.key;
            li.addEventListener('click', () => {
                this.setValue(option.value);
            });
            this.append(li);
        });

        this.value = this.value === null ? this.options[0].value : this.value;
        this.setValue(this.value);
    }

    setValue(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) {
            throw new Error(`没有找到对应的选项${typeof (value)} ${value}`);
        }
        this.value = value;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].className = this.children[i].innerText === option.key ? 'radioLi radioLiSelected' : 'radioLi';
        }
    }
}
customElements.define("single-choice", SingleChoice);

class PopupTip extends HTMLElement {
    constructor() {
        super();
        this.duration = 1000;
    }

    popup() {
        this.style.display = 'block';
        this.style.animation = 'popupTipPopup 0.5s ease-out forwards';
        setTimeout(() => {
            this.style.animation = 'popupTipDieout 0.5s ease-out forwards';
            setTimeout(() => {
                this.style.display = 'none';
            }, 500);
        }, this.duration);
    }
}

customElements.define("popup-tip", PopupTip);

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