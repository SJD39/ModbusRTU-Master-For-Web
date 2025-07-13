class LoadHTML extends HTMLElement {
    constructor() {
        super();

        this.src = "";
        this.when = "now";
        this.done = false;
    }
    connectedCallback() {
        // 获取文件地址
        if (this.hasAttribute("src")) {
            this.src = this.getAttribute("src");
        }

        // 获取请求时机
        if (this.hasAttribute("when")) {
            this.when = this.getAttribute("when");
        }

        this.getHtml();
    }

    // 获取html
    getHtml() {
        // 加载文件
        fetch(this.src)
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;

                // 加载JS
                if (this.when === "now") {
                    this.loadJS();
                }

                this.done = true;

                if (this.hasAttribute("callback")) {
                    this.getAttribute("callback");
                }
            });
    }

    // 加载js
    loadJS() {
        this.querySelectorAll("script").forEach(script => {
            let scriptElement = document.createElement("script");
            scriptElement.innerHTML = script.innerHTML;
            script.parentNode.replaceChild(scriptElement, script);
        });
    }
}

customElements.define('load-html', LoadHTML);