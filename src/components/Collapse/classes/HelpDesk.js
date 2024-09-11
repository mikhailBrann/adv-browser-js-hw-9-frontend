import Widget from "./Widget";
import deskTemplate from "../template/deskTemplate.html";
import ticketTemplate from "../template/ticketTemplate.html";
import formTemplate from "../template/formTemplate.html";
import ReqApi from "./ReqApi";


export default class HelpDesk {
    constructor(initAppContainer) {
        this.parentNode = initAppContainer;
        this.requestApi = new ReqApi();

        const appElemObj = new Widget("helpdesk", deskTemplate.replace("{{data-elem-type}}", "helpdesk__container"));

        this.parentNode.appendChild(appElemObj.element);
        this.renderList();

        //#TODO: add event listener
        this.parentNode.addEventListener("click",  this.changeTaskState.bind(this));
        this.parentNode.addEventListener("click",  this.hideForms);
        this.parentNode.addEventListener("click",  this.toggleInfo);
        this.parentNode.addEventListener("click",  this.showForm.bind(this));
        document.body.addEventListener("submit",  this.sendForm.bind(this));
    }

    sendForm(event) {
        if(event.target.matches('form')) {
            event.preventDefault();
            const form = event.target;
            const typeForm = form.dataset.formType;
            let name = false;
            let description = false;
            let id = false;
            let body = false;
            
            switch(typeForm) {
                case "add-ticket":
                    name = form.elements.name.value;
                    description = form.elements.description.value;
                    body = {
                        name,
                        description
                    };

                    this._addTask(body).then(data => {
                        if(!data) {
                            alert("Ошибка обновления статуса");
                            return;
                        }
        
                        this.renderList();
                        this.hideForms();
                        return;
                    });
                    break;
                case "change-ticket":
                    //this._updateTask
                    name = form.elements.name.value;
                    description = form.elements.description.value;
                    body = {
                        name,
                        description
                    };
                    id = form.dataset.sendTiketId;

                    this._updateTask(id, body).then(data => {
                        if(!data) {
                            alert("Ошибка обновления таска");
                            return;
                        }
        
                        this.renderList();
                        this.hideForms();
                        return;
                    });
                    
                    break;
                case "delete-ticket":
                    id = form.dataset.sendTiketId;

                    this._removeTask(id).then(data => {
                        if(!data) {
                            alert("Ошибка удаления записи!");
                            return;
                        }

                        this.renderList();
                        this.hideForms();
                        return;
                    });
                    break;
                default:
                    break;
            }

        }
        

    }

    renderList() {
        const listParentElem = this.parentNode.querySelector("[data-elem-type=data-list]");

        listParentElem.innerHTML = "";

        const request = this._getList();

        if(!listParentElem) {
            return;
        }

        listParentElem.innerHTML = "";

        request.then((data) => {
            if(!data) {
                return;
            }
            
            data.forEach((item) => {
                const { id, name, description, status, created } = item;
                const dateFormat = new Date(created).toLocaleString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }).replace(',', '');

                const ticketView = ticketTemplate.replaceAll("{{tiket-id}}", id)
                    .replace("{{ticket-title}}", name)
                    .replace("{{ticket-descr}}", description)
                    .replace("{{ticket-status}}", status)
                    .replace("{{ticket-date}}", dateFormat);
                const ticket = new Widget("ticket_container", ticketView);
                listParentElem.insertAdjacentElement("afterbegin", ticket.element);
            });        
        });
    }

    changeTaskState(event) {
        if(event.target.dataset.typeBtn === "ticket-status") {
            event.preventDefault();

            const btn = event.target;
            const newValue = !event.target.dataset.ticketStatus;
            const newValueStr = newValue ? "true" : "false";
            const id = btn.dataset.ticketChangeId;
            const status = newValue;
        
            this._updateTask(id, {status: newValueStr}).then(data => {
                if(!data) {
                    alert("Ошибка обновления статуса");
                    return;
                }

                event.target.dataset.ticketStatus = newValue;
                event.target.innerHTML = newValue ? "&#10003;" : "";
                return;
            });
        }
    }

    hideForms() {
        //удаляем активные формы со страницы
        const activeForms = Array.from(document.querySelectorAll(`.active-form__wrapp`));
        activeForms.forEach(form => form.remove());
    }

    toggleInfo(event) {
        
        if(event.target.closest(".ticket__info") || event.target.classList.contains("ticket__info")) {
            event.preventDefault();
            const textDescr = event.target.closest(".ticket_container").querySelector(".ticket__descr");

            console.log(textDescr);

            if(textDescr) {
                textDescr.classList.toggle("active");
            }

            return;
        }

    }
    
    showForm(event) {
        if(!event.target.dataset.typeBtn) {
            return;
        }

        const typeForm = event.target.dataset.typeBtn;
        const btn = event.target;
        const formWrapSelector = "active-form__wrapp";
        let form = false;
        let fields = false;
        let currentFormTemplate = false;

        this.hideForms();
        
        switch(typeForm) {
            case "add-ticket":
                fields = [`<input name="name" placeholder="Введите название">`, `<textarea name="description" placeholder="Введите описание"></textarea>`];
                currentFormTemplate = formTemplate.replace("{{form-class}}", typeForm)
                    .replace("{{form-type}}", typeForm)
                    .replace("{{form-title}}", "Добавить тикет");
                form = this._generateForm(formWrapSelector, currentFormTemplate, fields);
                break;
            case "change-ticket":
                const tiketWrap = btn.closest(".ticket[data-ticket-id]");

                if(!tiketWrap) {
                    return;
                }

                const id = tiketWrap.dataset.ticketId;
                const name = tiketWrap.querySelector(".ticket__title")?.textContent;
                const description = tiketWrap.querySelector(".ticket__descr")?.textContent;

                fields = [`<input name="name" value="${name}">`, `<textarea name="description" placeholder="${description}"></textarea>`];
                currentFormTemplate = formTemplate.replace("{{form-class}}", typeForm)
                    .replace("{{form-type}}", typeForm)
                    .replaceAll("{{ticket-id}}", id)
                    .replace("{{form-title}}", "Изменить тикет");
                form = this._generateForm(formWrapSelector, currentFormTemplate, fields);
                break;
            case "delete-ticket":
                fields = [`<span>Вы уверены, что хотите удалить тикет?</span>`];
                currentFormTemplate = formTemplate.replace("{{form-class}}", typeForm)
                    .replace("{{form-type}}", typeForm)
                    .replaceAll("{{ticket-id}}", btn.dataset.ticketId)
                    .replace("{{form-title}}", "Удалить тикет");
                form = this._generateForm(formWrapSelector, currentFormTemplate, fields);
                break;
            default:
                break;
        }

        if(!form) {
            return;
        }

        document.body.insertAdjacentElement("afterbegin", form.element);
    }

    _generateForm(formSelector="active-form__wrapp", formTemplate, fieldsArr=[]) {
        const form = new Widget(formSelector, formTemplate, "div");
        const formElem = form.element;

        fieldsArr.forEach(itemHtml => form.addElement(itemHtml, ".form__body"));
        return form;
    }

    _updateTask(id, body) {
        const queryParams = `?method=updateById&id=${id}`;

        return this.requestApi.sendRequest(queryParams, "POST", body).then((response) => {
            try {
                return response;
            } catch (error) {
                return error;
            }
        });
    }

    _addTask(body) {
        const queryParams = "?method=createTicket";
        return this.requestApi.sendRequest(queryParams, "POST", body).then((response) => {
            try {
                return response.json();
            } catch (error) {
                return error;
            }
        });
    }

    _removeTask(id) {
        const queryParams = `?method=deleteById&id=${id}`;
        return this.requestApi.sendRequest(queryParams).then((response) => {
            try {
                return response;
            } catch (error) {
                return error;
            }
        });
    }

    _getList() {
        const queryParams = "?method=allTickets";

        return this.requestApi.sendRequest(queryParams).then((response) => {
            try {
                return response.json();
            } catch (error) {
                return error;
            }
        });
    }

}