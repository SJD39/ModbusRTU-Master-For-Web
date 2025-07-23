class Load extends HTMLElement {
    constructor() {
        super();

        this.src = "";
        this.when = "now";
        this.content = "";
        this.getDoneTag = false;
        this.permitLoadTag = false;
        this.loadDoneTag = false;
    }
    connectedCallback() {
        // 获取文件地址
        if (this.hasAttribute("src")) {
            this.src = this.getAttribute("src");
        }

        // 获取加载时机
        if (this.hasAttribute("when")) {
            this.when = this.getAttribute("when");
        }

        this.getLoad();
    }
    getLoad() {
        // 获取文件内容
        fetch(this.src).then(res => res.text()).then(text => {
            this.content = text;
            this.getDoneTag = true;

            if (this.when === "now") {
                this.permitLoadTag = true;
            }
            this.load();
        });
    }

    load() {
        if (!this.permitLoadTag) {
            setTimeout(() => {
                this.load();
            }, 0);
            return false;
        }
        return true;
    }

    loaded() {
        this.loadDoneTag = true;
        if (this.hasAttribute("callback")) {
            eval(this.getAttribute("callback"));
        }
    }
}

class LoadHTML extends Load {
    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback();
    }

    // 加载js
    load() {
        if (!super.load()) {
            return;
        }
        this.innerHTML = this.content;
        this.querySelectorAll("script").forEach(script => {
            let scriptElement = document.createElement("script");
            scriptElement.innerHTML = script.innerHTML;
            script.parentNode.replaceChild(scriptElement, script);
        });
        this.loaded();
    }
}

customElements.define('load-html', LoadHTML);

class LoadJS extends Load {
    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback();
    }

    // 加载js
    load() {
        if (!super.load()) {
            return;
        }
        this.scriptElement = document.createElement("script");
        this.scriptElement.innerHTML = this.content;
        this.append(this.scriptElement);
        this.loaded();
    }
}

customElements.define('load-js', LoadJS);
