const TODOBODY = document.querySelector(".to-do-list-content-body")

class TodoBody {
    constructor(body) {
        this.body = body
        body.onclick = this.onClick.bind( this )
        this.todosList = localStorage.myMap?new Map(JSON.parse(localStorage.myMap)): new Map()
    }

    textDate ( date ) {
      const newDate = new Date(date * 1000);
      return  newDate.toLocaleDateString( "en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        } )
            .split( " " )
            .join( " " );
    }

    createId ( ) {
       const date =  new Date()
       return Math.round(date.getTime() / 1000);
    }

    getFormattedDate ( date ) {
        const newDate = new Date( date * 1000 );
       return newDate.toISOString().substring(0, 10);
    }

    createTodo ( {id = this.createId().toString(), text = "", done = false} ) {
        this.todosList.set( id, { text, done } )
        this.updateLocalStorage()
        this.body.innerHTML =
            `<div class="to-do-list-content-item" id=${id}>
                        <div class="to-do-list-task-header">
                            <label
                                ><input type="checkbox" data-id=${id} ${
                                    done ? "checked" : ""
                                } /><time
                                    datetime="${this.getFormattedDate(Number(id))}"
                                    >${this.textDate(Number(id))}</time
                                ></label
                            >
                            <div class="to-do-list-task-svg">
                                <span
                                    data-id=${id}
                                    data-action="updateTodoOn"
                                ></span>
                                <span data-id=${id} data-action="deleteTodo"
                                ></span>
                            </div>
                        </div>
                            <div data-id=${id} contentEditable=false data-ph="Enter your task">${text}</div>
                    </div>` + this.body.innerHTML;
        this.updateScope();
        this.updateActive();
    }

    deleteTodo ( {id} ) {
        const todoElem = document.getElementById(id)
        todoElem.remove();
        this.todosList.delete( id );
        this.updateLocalStorage()
        this.updateScope();
        this.updateActive();
        this.updateSuccessful();
    }

    updateTodoOn( {elem, id} ) { 
        const todoElem = document.getElementById( id ).querySelector( '[data-ph="Enter your task"]' )
        TODOBODY.querySelectorAll( '.to-do-list-content-item' ).forEach( function ( contentItem ) { if ( contentItem.id !== id ) contentItem.classList.add( "disabled" ) });
        elem.dataset.action = "updateTodoOff"
        todoElem.setAttribute( 'contentEditable', 'true' )
        todoElem.focus()
    }

    updateTodoOff( {elem, id} ) {
        const todoElem = document.getElementById( id ).querySelector( '[data-ph="Enter your task"]' )
        TODOBODY.querySelectorAll( '.disabled' ).forEach(function(contentItem){contentItem.classList.remove( "disabled" )})
        elem.dataset.action = "updateTodoOn"
        this.todosList.get(id).text= todoElem.innerText
        this.updateLocalStorage()
        todoElem.setAttribute( 'contentEditable', 'false' )
    }

    updateScope () {
        const scope = document.querySelector(".to-do-list-info-scope");
        scope.innerText = this.todosList.size;
    }

    updateActive () {
        const active = document.querySelector(".to-do-list-info-active");
        let count = 0;
        for (let todo of this.todosList.values()) {
            if (!todo.done) {
                count++;
            }
        }
        active.innerText = count;
    }

    updateSuccessful () {
        const successful = document.querySelector(".to-do-list-info-successful");
        let count = 0;
        for (let todo of this.todosList.values()) {
            if (todo.done) {
                count++;
            }
        }
        successful.innerText = count;
    }

    toDoInit () {
        if ( this.todosList.size !== 0 ) {
            for ( let todo of this.todosList ) {
               this.createTodo({id:todo[0],text: todo[1].text, done: todo[1].done}) 
            }
        }
        this.updateActive();
        this.updateScope();
        this.updateSuccessful();
    }

    updateLocalStorage () {
       localStorage.myMap = JSON.stringify(Array.from(this.todosList)) 
    }
    
    onClick ( event ) { 
        const action = event.target.dataset.action;
        const id= event.target.dataset.id
      if (action) {
        this[action]({elem :event.target, id});
      }
    };
}

new TodoBody(TODOBODY).toDoInit()