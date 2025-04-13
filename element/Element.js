class Dropdown extends HTMLElement {
    constructor() {
        super();
        this.value;
        this.options = [];
    }

    connectedCallback() {
        // 初始化值
        if (this.hasAttribute("value")) {
            this.value = this.getAttribute("value");
        }
        if (this.hasAttribute("options")) {
            this.options = eval(this.getAttribute("options"));
            this.render();
        }
    }

    // 渲染
    render() {
        this.dropDownView = document.createElement('span');
        this.dropDownDialog = document.createElement('dialog');
        this.dropDownMenu = document.createElement('menu');

        this.className = 'dropDownBox';
        this.dropDownView.className = 'dropDownView';
        this.dropDownDialog.className = 'dropDownDialog';
        this.dropDownMenu.className = 'dropDownMenu';

        this.options.forEach((option, index) => {
            let li = document.createElement('li');
            li.innerText = option.key;
            li.addEventListener('click', () => {
                this.setValue(option.value);
                this.dropDownDialog.close();
            });
            this.dropDownMenu.append(li);
        });

        this.dropDownView.addEventListener('click', () => {
            this.dropDownDialog.show();
        });

        this.dropDownDialog.append(this.dropDownMenu);
        this.append(this.dropDownView, this.dropDownDialog);

        this.setValue(this.options[0].value);
    }

    setValue(value) {
        this.options.forEach((option, index) => {
            if (option.value == value) {
                this.value = option.value;
                this.dropDownView.innerText = option.key;
            }
        });
    }

    getOption() {
        this.options.forEach((option, index) => {
            if (option.value == this.value) {
                return option.key;
            }
        });
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

        this.className = 'radioBox';
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

    getOption() {
        return this.options[this.value];
    }
}

customElements.define("single-choice", SingleChoice);

class PopupTip extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.className = 'popupTipBox';
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

class Button extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.className = 'my_button';

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
customElements.define("my-button", Button);