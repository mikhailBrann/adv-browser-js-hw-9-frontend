export default class Widget {
    constructor(elementSelector="widget", template=null, elementType="div") {
        this.element = document.createElement(elementType);
        this.element.classList.add(elementSelector);

        if (template) {
            this.element.insertAdjacentHTML("afterbegin", template);
        }
    }

    addElement(html, parentSelector) {
        this.element.querySelector(parentSelector).insertAdjacentHTML("beforeend", html);
    }
}