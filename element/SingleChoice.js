class SingleChoice extends HTMLElement {
    constructor() {
        super();
        this.onValueChangeEventFunc = () => { };
    }
    connectedCallback() {
        // 插入CSS
        this.styleSheet = document.createElement('style');
        this.styleSheet.innerHTML = `
            single-choice{
                width: max-content;
                display: flex;
                justify-content: space-between;
            }

            .radioLi{
                display: inline;
                padding-left: 14px;
                padding-right: 14px;
                padding-top: 6px;
                padding-bottom: 6px;
                border-radius: 9px;
                cursor: pointer;
            }

            .radioLiSelected{
                background-color: #ffffff39;
            }
        `;
        document.head.append(this.styleSheet);
    }

    setOptions(options) {
        this.innerHTML = '';
        for (let i = 0; i < options.length; i++) {
            let li = document.createElement('li');
            li.className = 'radioLi';
            li.innerText = options[i].key;
            li.addEventListener('click', () => {
                this.setValue(options[i].value);
            });
            this.append(li);
        }
        this.options = options;
        this.setValue(options[0].value);
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