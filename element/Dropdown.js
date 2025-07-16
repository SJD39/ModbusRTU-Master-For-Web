class Dropdown extends HTMLElement {
    constructor() {
        super();

        this.options = { key: "", value: "" };
        this.onValueChangeEventFunc = () => { };
    }
    connectedCallback() {
        // 创建元素
        this.dropDownTag = document.createElement('span');
        this.dropDownMenu = document.createElement('span');
        this.dropDownMenu.style.position = 'relative';

        this.dropDownMenuValue = document.createElement('span');
        this.dropDownDialog = document.createElement('dialog');
        this.dropDownDialog.className = 'dropDownDialog';
        this.dropDownDialogUi = document.createElement('ul');

        // 初始化tag
        if (this.hasAttribute("tag")) {
            this.dropDownTag.innerText = this.getAttribute("tag");
        }
        // 初始化值
        if (this.hasAttribute("value")) {
            this.value = eval(this.getAttribute("value"));
        }
        // 菜单方向
        if (this.hasAttribute("dir")) {
            this.setDir(this.getAttribute("dir"));
        }

        // 显示菜单
        this.dropDownTag.addEventListener('click', () => this.change());
        this.dropDownMenuValue.addEventListener('click', () => this.change());

        // css
        this.styleSheet = document.createElement("style");
        this.styleSheet.textContent = `
            drop-down {
                display: inline-block;
            }
            .dropDownDialog{
                z-index: 9999;
                left: -12px;
                width: max-content;
                background-color: #39c5bb;
                border: #fff 2px solid;
                border-radius: 9px;
                overflow: hidden;
            }
            .dropDownDialog li{
                padding: 4px 12px 4px 12px;
                transition: all .2s;
                color: #fff;
            }
            .dropDownDialog li:hover{
                background-color: #fff;
                color: #39c5bb;
            }
        `;
        document.head.append(this.styleSheet);


        // 组合元素
        this.dropDownDialog.append(this.dropDownDialogUi);
        this.dropDownMenu.append(this.dropDownMenuValue, this.dropDownDialog);
        this.append(this.dropDownTag, this.dropDownMenu);
    }
    setOptions(options) {
        this.dropDownDialogUi.innerHTML = '';
        options.forEach((option) => {
            let li = document.createElement('li');
            li.innerText = option.key;
            li.addEventListener('click', () => {
                this.setValue(option.value);
                this.dropDownDialog.close();
            });
            this.dropDownDialogUi.append(li);
        });
        this.options = options;
        if (this.options.find(option => option.value === this.value) === undefined) {
            this.setValue(this.options[0].value);
        } else {
            this.setValue(this.value);
        }
    }
    setValue(value) {
        const option = this.options.find(option => option.value === value);
        this.dropDownMenuValue.innerText = option.key;
        this.value = value;
        this.onValueChangeEventFunc(value);
    }

    setDir(dir) {
        if (dir === 'down') {
            this.dropDownDialog.style.top = '30px';
        } else if (dir === 'up') {
            this.dropDownDialog.style.bottom = '30px';
        }
    }

    isOpen() {
        return this.dropDownDialog.open;
    }

    change() {
        if (this.isOpen()) {
            this.dropDownDialog.close();
        } else {
            this.dropDownDialog.show();
        }

        // 互斥
        document.querySelectorAll('drop-down').forEach(item => {
            if (item !== this) {
                item.dropDownDialog.close();
            }
        });
    }
}
customElements.define("drop-down", Dropdown);