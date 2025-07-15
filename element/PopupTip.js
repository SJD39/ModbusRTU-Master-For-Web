class PopupTip extends HTMLElement {
    constructor() {
        super();
        this.duration = 1000;
    }

    connectedCallback() {
        this.styleSheet = document.createElement('style');
        this.styleSheet.textContent = `
            @keyframes popupTipPopup {
                0%{
                    opacity: 0;
                    top: 40px;
                }
                100%{
                    opacity: 1;
                    top: 60px;
                }
            }

            @keyframes popupTipDieout {
                0%{
                    opacity: 1;
                    top: 60px;
                }
                100%{
                    opacity: 0;
                    top: 40px;
                }
            }

            popup-tip {
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;

                background-color: #fff;
                color: #39c5bb;
                padding: 10px;
                border-radius: 4px;
                display: none;
            }
        `;
        document.head.append(this.styleSheet);
    }

    popup() {
        this.style.display = 'block';
        this.style.animation = 'popupTipPopup 0.2s ease-out forwards';
        setTimeout(() => {
            this.style.animation = 'popupTipDieout 0.2s ease-out forwards';
            setTimeout(() => {
                this.style.display = 'none';
            }, 500);
        }, this.duration);
    }
}
customElements.define("popup-tip", PopupTip);