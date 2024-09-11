import "../components/Collapse/css/style.css";
import CollapseWidget from "../components/Collapse/classes/CollapseWIdget.js";

document.addEventListener("DOMContentLoaded", () => {
  const parentNodeElem = document.querySelector(".Frontend");
  const collapseWidget = new CollapseWidget();

  parentNodeElem.appendChild(collapseWidget.element);

  
});
