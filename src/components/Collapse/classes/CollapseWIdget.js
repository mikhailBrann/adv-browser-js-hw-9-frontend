import  Widget from "./Widget.js";
import CollapseTemplate from "../template/CollapseTemplate.html";

export default class CollapseWidget extends Widget {
    constructor(elementSelector="collapse-widget", elementType="div", template=CollapseTemplate) {
        super(elementSelector, template, elementType);

        //addEvents
        this.addCallbackToElement(".collapse-widget__btn", this.setCollapseState.bind(this));
    }

    addCallbackToElement(elementSelector, callback) {
        
        const elem = this.element.querySelector(elementSelector);
        elem.addEventListener("click", callback);
    }

    setCollapseState() {
        this.element.querySelector(".collapse-widget__content").classList.toggle("active");
    }
}