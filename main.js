class TodoBody {
    _ls = new Map(JSON.parse(localStorage.getItem('myToDos') || '[]'));
    _todosList = new Map(this._ls);

    constructor(body) {
        this.body = body;
        body.onclick = this.onClick.bind(this);
    }

    updateScope() {
        const scope = document.querySelector('.to-do-list-info-scope');
        scope.innerText = this._todosList.size;
    }

    updateActive() {
        const active = document.querySelector('.to-do-list-info-active');
        let count = 0;
        for (let todo of this._todosList.values()) {
            if (!todo.done) {
                count++;
            }
        }
        active.innerText = count;
    }

    updateSuccessful() {
        const successful = document.querySelector(
            '.to-do-list-info-successful',
        );
        let count = 0;
        for (let todo of this._todosList.values()) {
            if (todo.done) {
                count++;
            }
        }
        successful.innerText = count;
    }

    createId() {
        return Number(new Date()) + '' + Math.floor(Math.random() * 100000);
    }

    updateHeders() {
        this.updateScope();
        this.updateActive();
        this.updateSuccessful();
    }

    textDate(date) {
        return date
            .toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })
            .split(' ')
            .join(' ');
    }

    getFormattedDate(date) {
        return date.toISOString().substring(0, 10);
    }

    templateTodo({ id, text, done, date }) {
        const tmpl = document.querySelector('#tmpl');
        const clon = tmpl.content.cloneNode(true);

        clon.querySelector('.to-do-list-content-item').id = id;

        const checkbox = clon.querySelector('[data-action=updateChecked]');
        checkbox.dataset.id = id;
        checkbox.checked = done;

        const time = clon.querySelector('time');
        time.setAttribute('datetime', this.getFormattedDate(date));
        time.textContent = this.textDate(date);

        const updateTodoOn = clon.querySelector('[data-action=updateTodoOn]');
        updateTodoOn.dataset.id = id;
        if (done) updateTodoOn.classList.add('disabled');

        clon.querySelector('[data-action=deleteTodo]').dataset.id = id;

        const contentEditableDiv = clon.querySelector('[contentEditable]');
        contentEditableDiv.dataset.id = id;
        contentEditableDiv.textContent = text;
        if (done) contentEditableDiv.classList.add('checked');

        this.body.insertBefore(clon, this.body.firstElementChild);
    }

    createTodo({ id = this.createId(), text = '', done = false }) {
        let date = new Date(Number(id.slice(0, 13)));
        this._todosList.set(id, { text, done });
        this.templateTodo({ id, text, done, date });
        this.updateHeders();
    }

    deleteTodo({ id }) {
        const todoElem = document.getElementById(id);
        todoElem.remove();
        this._todosList.delete(id);
        this.updateLocalStorage({ type: 'delete', id });
    }

    updateTodoOn({ elem, id }) {
        const todoElem = document
            .getElementById(id)
            .querySelector('[contentEditable]');
        document
            .getElementById(id)
            .querySelector('[data-action=updateChecked]').disabled = true;
        elem.dataset.action = 'updateTodoOff';
        todoElem.setAttribute('contentEditable', 'true');
        todoElem.focus();
    }

    updateTodoOff({ elem, id }) {
        const todoElem = document
            .getElementById(id)
            .querySelector('[contentEditable]');
        if (todoElem.innerText !== '') {
            todoElem.removeAttribute('oninput');
            document
                .getElementById(id)
                .querySelector('[data-action=updateChecked]').disabled = false;
            elem.dataset.action = 'updateTodoOn';
            this._todosList.get(id).text = todoElem.innerText;
            this.updateLocalStorage({ type: 'update', id });
            todoElem.setAttribute('contentEditable', 'false');
        }
    }

    updateChecked({ elem, id }) {
        const todoElem = document
            .getElementById(id)
            .querySelector('[contentEditable]');
        elem.checked
            ? todoElem.classList.add('checked')
            : todoElem.classList.remove('checked');

        const updateTodoOn = document
            .getElementById(id)
            .querySelector('[data-action=updateTodoOn]');
        elem.checked
            ? updateTodoOn.classList.add('disabled')
            : updateTodoOn.classList.remove('disabled');

        this._todosList.get(id).done = elem.checked;
        this.updateLocalStorage({ type: 'update', id });
        this.updateHeders();
    }

    toDoInit() {
        if (this._todosList.size !== 0) {
            for (let todo of this._todosList) {
                this.createTodo({
                    id: todo[0],
                    text: todo[1].text,
                    done: todo[1].done,
                });
            }
        }
        this.updateHeders();
    }

    updateLocalStorage({ type, id }) {
        switch (type) {
            case 'delete':
                this._ls.delete(id);
                break;
            case 'update':
                if (this._todosList.get(id).text !== '') {
                    this._ls.set(id, this._todosList.get(id));
                }
                break;

            default:
                break;
        }
        localStorage.setItem('myToDos', JSON.stringify(Array.from(this._ls)));
    }

    onClick(event) {
        const action = event.target.dataset.action;
        const id = event.target.dataset.id;
        if (action) {
            this[action]({ elem: event.target, id });
        }
    }
}

window.addEventListener('load', function () {
    const TODOBODY = document.querySelector('.to-do-list-content-body');
    new TodoBody(TODOBODY).toDoInit();
});
