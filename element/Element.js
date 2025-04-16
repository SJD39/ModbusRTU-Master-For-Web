class Dropdown extends HTMLElement {
    constructor() {
        super();
        this.value = null;
        this.options = [];
    }

    render() {
        this.dropDownView = document.createElement('span');
        this.dropDownDialog = document.createElement('dialog');
        this.dropDownView.className = 'dropDownView';
        this.dropDownDialog.className = 'dropDownDialog';

        this.options.forEach((option) => {
            let li = document.createElement('li');
            li.innerText = option.key;
            li.addEventListener('click', () => {
                this.setValue(option.value);
                this.dropDownDialog.close();
            });
            this.dropDownDialog.append(li);
        });
        this.dropDownView.addEventListener('click', () => {
            this.dropDownDialog.show();
        });

        this.append(this.dropDownView, this.dropDownDialog);

        this.value = this.value === null ? this.options[0].value : this.value;
        this.setValue(this.value);
    }

    setValue(value) {
        const option = this.options.find(option => option.value === value);
        if (!option) {
            throw new Error(`没有找到对应的选项${typeof(value)} ${value}`);
        }
        this.value = value;
        this.dropDownView.innerText = option.key;
    }
}
customElements.define("drop-down", Dropdown);

class SingleChoice extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.clickCallback = function () { };
        this.options = JSON.parse(this.getAttribute("options"));

        this.liElements = [];
        this.radioUl = document.createElement('ul');

        this.radioUl.className = 'radioUl';

        this.options.forEach((option, index) => {
            let li = document.createElement('li');
            li.className = 'radioLi';
            li.innerHTML = option;

            li.addEventListener('click', () => {
                this.setValue(index);
                this.clickCallback();
            });

            this.liElements.push(li);
            this.radioUl.append(li);
        });

        this.append(this.radioUl);

        // 初始化值
        this.value = 0;
        if (this.hasAttribute('value')) {
            this.setValue(this.getAttribute("value"));
        } else {
            this.setValue(0);
        }
    }

    setValue(id) {
        this.liElements[this.value].className = 'radioLi';
        this.liElements[id].className = 'radioLi radioLiSelected';
        this.value = id;
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
class HexInputArea extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        
    }
}