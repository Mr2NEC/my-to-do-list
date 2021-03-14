class TodoBody {
    constructor(body) {
        this.body = body;
        body.onclick = this.onClick.bind(this);
        this.ls = localStorage.getItem("myToDos")
            ? new Map(JSON.parse(localStorage.getItem("myToDos")))
            : new Map();
        this.todosList = this.ls.size !== 0 ? new Map(this.ls) : new Map();
    }

    textDate(date) {
        return date
            .toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            .split(" ")
            .join(" ");
    }

    createId() {
        let newid = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return (
            newid() +
            newid() +
            "-" +
            newid() +
            "-" +
            newid() +
            newid() +
            newid()
        );
    }

    getFormattedDate(date) {
        return date.toISOString().substring(0, 10);
    }

    createTemplate({ id, text, done, now }) {
        const tmpl = document.querySelector("#tmpl");
        const clon = tmpl.content.cloneNode(true);

        clon.querySelector(".to-do-list-content-item").id = id;

        const checkbox = clon.querySelector("[data-action=updateChecked]");
        checkbox.dataset.id = id;
        if (done) {
            checkbox.className = "checked";
        }

        const time = clon.querySelector("time");
        time.setAttribute("datetime", this.getFormattedDate(now));
        time.textContent = this.textDate(now);

        clon.querySelector("[data-action=updateTodoOn]").dataset.id = id;
        clon.querySelector("[data-action=deleteTodo]").dataset.id = id;

        const contentEditableDiv = clon.querySelector("[contentEditable]");
        contentEditableDiv.dataset.id = id;
        contentEditableDiv.textContent = text;

        this.body.insertBefore(clon, this.body.firstElementChild);
    }

    createTodo({ id = this.createId(), text = "", done = false }) {
        const now = new Date();
        this.todosList.set(id, { text, done });
        this.createTemplate({ id, text, done, now });
        // this.body.innerHTML =
        //     `<div class="to-do-list-content-item" id=${id}>
        //                 <div class="to-do-list-task-header">
        //                     <label
        //                         ><input type="checkbox" data-id=${id} data-action="updateChecked" ${
        //         done ? "checked" : ""
        //     } /><time
        //                             datetime="${this.getFormattedDate(now)}"
        //                             >${this.textDate(now)}</time
        //                         ></label
        //                     >
        //                     <div class="to-do-list-task-svg">
        //                         <span
        //                             data-id=${id}
        //                             data-action="updateTodoOn"
        //                         ></span>
        //                         <span data-id=${id} data-action="deleteTodo"
        //                         ></span>
        //                     </div>
        //                 </div>
        //                     <div data-id=${id} contentEditable=false data-ph="Enter your task">${text}</div>
        //             </div>` + this.body.innerHTML;
        this.updateScope();
        this.updateActive();
    }

    deleteTodo({ id }) {
        const todoElem = document.getElementById(id);
        todoElem.remove();
        this.todosList.delete(id);
        this.updateLocalStorage({ type: "delete", id });
        this.updateScope();
        this.updateActive();
        this.updateSuccessful();
    }

    updateTodoOn({ elem, id }) {
        const todoElem = document
            .getElementById(id)
            .querySelector("[contentEditable]");
        elem.dataset.action = "updateTodoOff";
        todoElem.setAttribute("contentEditable", "true");
        todoElem.focus();
    }

    updateTodoOff({ elem, id }) {
        const todoElem = document
            .getElementById(id)
            .querySelector("[contentEditable]");
        if (todoElem.innerText !== "") {
            elem.dataset.action = "updateTodoOn";
            this.todosList.get(id).text = todoElem.innerText;
            this.updateLocalStorage({ type: "update", id });
            todoElem.setAttribute("contentEditable", "false");
        }
    }

    updateScope() {
        const scope = document.querySelector(".to-do-list-info-scope");
        scope.innerText = this.todosList.size;
    }

    updateActive() {
        const active = document.querySelector(".to-do-list-info-active");
        let count = 0;
        for (let todo of this.todosList.values()) {
            if (!todo.done) {
                count++;
            }
        }
        active.innerText = count;
    }

    updateSuccessful() {
        const successful = document.querySelector(
            ".to-do-list-info-successful"
        );
        let count = 0;
        for (let todo of this.todosList.values()) {
            if (todo.done) {
                count++;
            }
        }
        successful.innerText = count;
    }

    updateChecked({ elem, id }) {
        elem.checked ? (elem.className = "checked") : (elem.className = "");
        this.todosList.get(id).done = elem.checked;
        this.updateLocalStorage({ type: "update", id });
        this.updateActive();
        this.updateSuccessful();
    }

    toDoInit() {
        if (this.todosList.size !== 0) {
            for (let todo of this.todosList) {
                this.createTodo({
                    id: todo[0],
                    text: todo[1].text,
                    done: todo[1].done,
                });
            }
        }
        this.updateActive();
        this.updateScope();
        this.updateSuccessful();
    }

    updateLocalStorage({ type, id }) {
        switch (type) {
            case "delete":
                this.ls.delete(id);
                console.log(this.ls);
                console.log(this.todosList);
                break;
            case "update":
                if (this.todosList.get(id).text !== "") {
                    this.ls.set(id, this.todosList.get(id));
                }
                console.log(this.ls);
                console.log(this.todosList);
                break;

            default:
                break;
        }
        localStorage.setItem("myToDos", JSON.stringify(Array.from(this.ls)));
    }

    onClick(event) {
        const action = event.target.dataset.action;
        const id = event.target.dataset.id;
        if (action) {
            this[action]({ elem: event.target, id });
        }
    }
}

window.addEventListener("load", function () {
    const TODOBODY = document.querySelector(".to-do-list-content-body");
    new TodoBody(TODOBODY).toDoInit();
});
