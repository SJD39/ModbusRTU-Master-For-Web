class LoadHTML extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.src;
        this.done = false;

        if (this.hasAttribute("src")) {
            this.src = this.getAttribute("src");
        }

        if (this.getAttribute("timing") === "now") {
            this.getHtml();
        }
    }

    // 获取html
    getHtml() {
        fetch(this.src)
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;

                // 更新 js 使浏览器执行
                this.querySelectorAll("script").forEach(script => {
                    let scriptElement = document.createElement("script");
                    scriptElement.innerHTML = script.innerHTML;
                    script.parentNode.replaceChild(scriptElement, script);
                });

                this.done = true;
                if (this.hasAttribute("callback")) {
                    this.getAttribute("callback");
                }
            });
    }
}

customElements.define('load-html', LoadHTML);