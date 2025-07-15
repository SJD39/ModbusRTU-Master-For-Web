// 弹出窗口
class PopupWindow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.dialogBox = document.createElement('dialog');
        // 移动innerHTML内容
        this.dialogBox.innerHTML = this.innerHTML;
        this.innerHTML = '';

        // 添加css
        this.styleSheet = document.createElement('style');
        this.styleSheet.textContent = `
            @keyframes popupWindowPopup {
                0%{
                    opacity: 0;
                    transform: scale(0);
                }
                100%{
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes popupWindowDieout {
                0%{
                    opacity: 1;
                    transform: scale(1);
                }
                100%{
                    opacity: 0;
                    transform: scale(0);
                }
            }

            popup-window{
                position: absolute;
                left: 0px;
                bottom: 0px;
            }
        `;
        document.head.append(this.styleSheet);
        this.append(this.dialogBox);
    }

    // 弹出
    popup() {
        this.dialogBox.show();
        this.dialogBox.style.animation = 'popupWindowPopup 0.2s ease-in-out forwards';
    }

    // 关闭
    close() {
        setTimeout(() => {
            this.dialogBox.close();
        }, 200);

        this.dialogBox.style.animation = 'popupWindowDieout 0.2s ease-in-out forwards';
    }

    // 获取状态
    isPopup() {
        return this.dialogBox.open;
    }

    // 改变
    change() {
        if (this.isPopup()) {
            this.close();
        } else {
            this.popup();
        }
    }
}
customElements.define('popup-window', PopupWindow);