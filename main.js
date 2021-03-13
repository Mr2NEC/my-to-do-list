class myToDoList {
    constructor() {
        this.toDoArr = new Map();
        this.scope = document.querySelector(".to-do-list-info-scope");
        this.active = document.querySelector(".to-do-list-info-active");
        this.successful = document.querySelector(".to-do-list-info-successful");
    }

    createToDo() {
        const dateNow = new Date();
        const id = Math.round(dateNow.getTime() / 1000);
        const textDate = dateNow
            .toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            .split(" ")
            .join(" ");
        this.toDoArr.set(id, {
            text: "",
            textDate,
            done: false,
        });
        return {
            id,
            text: "",
            textDate,
            done: false,
        };
    }

    set addToDo({ id, text, textDate, done }) {
        const toDoBody = document.querySelector(".to-do-list-content-body");

        toDoBody.innerHTML =
            `<div class="to-do-list-content-item" id=${id}>
                        <div class="to-do-list-task-header">
                            <label
                                ><input type="checkbox" ${
                                    done ? "checked" : ""
                                } /><time
                                    datetime="2021-01-03"
                                    >${textDate}</time
                                ></label
                            >
                            <div class="to-do-list-task-svg">
                                <span
                                    class="to-do-list-task-icon to-do-list-task-icon-done to-do-list-task-icon-filter"
                                ></span>
                                <span
                                    class="to-do-list-task-icon to-do-list-task-icon-pencil to-do-list-task-icon-filter"
                                ></span>
                                <span
                                    class="to-do-list-task-icon to-do-list-task-icon-delete"
                                ></span>
                            </div>
                        </div>
                        <div class="to-do-list-task-body">
                            <div
                                class="to-do-list-task-content"
                                contenteditable="true"
                            >
                            ${text}
                            </div>
                        </div>
                    </div>` + toDoBody.innerHTML;
    }

    updateScope() {
        this.scope.innerText = this.toDoArr.size;
    }

    updateActive() {
        let count = 0;
        for (let todo of this.toDoArr.values()) {
            if (!todo.done) {
                count++;
            }
        }
        this.active.innerText = count;
    }

    updateSuccessful() {
        let count = 0;
        for (let todo of this.toDoArr.values()) {
            if (todo.done) {
                count++;
            }
        }
        this.successful.innerText = count;
    }

    toDoInit() {
        this.updateActive();
        this.updateScope();
        this.updateSuccessful();
    }
}
let myTodo = new myToDoList();
myTodo.toDoInit();

const toDoBtn = document.querySelector(".to-do-list-add-task-btn");

toDoBtn.addEventListener("click", () => {
    let newTodo = myTodo.createToDo();
    console.log(newTodo);
    myTodo.addToDo = newTodo;
    myTodo.updateActive();
    myTodo.updateScope();
    myTodo.updateSuccessful();
});
