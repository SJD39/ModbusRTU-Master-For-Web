class PopupTip extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.className = 'popupTipBox';
        this.duration = 1000;
    }

    popup(){
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