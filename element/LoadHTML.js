class LoadHTML extends HTMLElement{
    static observedAttributes = ["src"];

    constructor(){
        super();
    }

    connectedCallback(){
        let src;
        if(this.hasAttribute("src")){
            src = this.getAttribute("src");
        }else{
            return;
        }

        fetch(src)
            .then(response => response.text())
            .then(html => {
                this.innerHTML = html;

                // 更新 js 使浏览器执行
                this.querySelectorAll("script").forEach(script => {
                    let scriptElement = document.createElement("script");
                    scriptElement.innerHTML = script.innerHTML;
                    script.parentNode.replaceChild(scriptElement, script);
                });
            })

    }
}

customElements.define('load-html', LoadHTML);