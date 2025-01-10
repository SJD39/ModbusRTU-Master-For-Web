class PopupTip extends HTMLElement{
    static observedAttributes = ["duration"];
    constructor(){
        super();
    }

    connectedCallback(){
        this.className = 'popupTipBox';
    }

    popup(){
        this.style.display = 'block';
        this.style.animation = 'popupTipPopup 0.5s ease-out';
        setTimeout(() => {
            this.style.animation = 'popupTipDieout 0.5s ease-out';
            setTimeout(() => {
                this.style.display = 'none';
            }, 500);
        }, this.getAttribute('duration'));
    }
}

customElements.define("popup-tip", PopupTip);