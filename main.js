class TodoBody {
    constructor(body) {
        this.body = body;
        body.onclick = this.onClick.bind(this);
        this.ls = new Map(JSON.parse(localStorage.getItem("myToDos")) || []);
        this.todosList = new Map(this.ls);
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

    templateTodo({ id, text, done, date }) {
        const tmpl = document.querySelector("#tmpl");
        const clon = tmpl.content.cloneNode(true);

        clon.querySelector(".to-do-list-content-item").id = id;

        const checkbox = clon.querySelector("[data-action=updateChecked]");
        checkbox.dataset.id = id;
        checkbox.checked = done;

        const time = clon.querySelector("time");
        time.setAttribute("datetime", this.getFormattedDate(date));
        time.textContent = this.textDate(date);

        const updateTodoOn = clon.querySelector("[data-action=updateTodoOn]");
        updateTodoOn.dataset.id = id;
        if (done) updateTodoOn.classList.add("disabled");

        clon.querySelector("[data-action=deleteTodo]").dataset.id = id;

        const contentEditableDiv = clon.querySelector("[contentEditable]");
        contentEditableDiv.dataset.id = id;
        contentEditableDiv.textContent = text;
        if (done) contentEditableDiv.classList.add("checked");

        this.body.insertBefore(clon, this.body.firstElementChild);
    }

    createTodo ( { id = this.createId(), text = "", done = false, date = new Date() } ) {
        this.todosList.set(id, { text, done, date});
        this.templateTodo( { id, text, done, date } );
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
        document
            .getElementById(id)
            .querySelector("[data-action=updateChecked]").disabled = true;
        elem.dataset.action = "updateTodoOff";
        todoElem.setAttribute("contentEditable", "true");
        todoElem.focus();
    }

    updateTodoOff({ elem, id }) {
        const todoElem = document
            .getElementById(id)
            .querySelector("[contentEditable]");
        if (todoElem.innerText !== "") {
            todoElem.removeAttribute("oninput");
            document
                .getElementById(id)
                .querySelector("[data-action=updateChecked]").disabled = false;
            elem.dataset.action = "updateTodoOn";
            this.todosList.get(id).text = todoElem.innerText;
            this.updateLocalStorage({ type: "update", id });
            todoElem.setAttribute("contentEditable", "false");
        }
    }

    updateChecked({ elem, id }) {
        const todoElem = document
            .getElementById(id)
            .querySelector("[contentEditable]");
        elem.checked
            ? todoElem.classList.add("checked")
            : todoElem.classList.remove("checked");

        const updateTodoOn = document
            .getElementById(id)
            .querySelector("[data-action=updateTodoOn]");
        elem.checked
            ? updateTodoOn.classList.add("disabled")
            : updateTodoOn.classList.remove("disabled");

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
                    date: new Date(todo[1].date),
                });
            }
        }
        this.updateActive();
        this.updateScope();
        this.updateSuccessful();
    }

    updateLocalStorage ( { type, id } ) {
        switch (type) {
            case "delete":
                this.ls.delete(id);
                break;
            case "update":
                if (this.todosList.get(id).text !== "") {
                    this.ls.set(id, this.todosList.get(id));
                }
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
    new TodoBody( TODOBODY ).toDoInit();
});
