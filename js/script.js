class Model {
    constructor () {
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }

    addTodo (todoText) {
        const todo = {
            id : (this.todos.length > 0 ) ? this.todos[this.todos.length - 1].id + 1 : 1, 
            text : todoText,
            complete: false    
        }
        this.todos.push(todo);
        this._commit(this.todos)
    }

    editTodo (id, editText) {
        this.todos = this.todos.map (todo =>
            todo.id === id ? {id:todo.id, text: editText, complete: todo.complete} : todo)
   
        this._commit(this.todos)
    }

    deleteTodo (id) {
        this.todos = this.todos.filter(todo => todo.id !== id)

        this._commit(this.todos);
    }

    toggleTodo () {
        this.todos = this.todos.map (todo =>
            todo.id === id ? {id:todo.id, text: editText, complete: !todo.complete} : todo)
        
            this._commit(this.todos)
    }

    bindTodoListChanged(callback){
        this.onTodosListChanged = callback;
    }

    _commit(todos){
        this.onTodosListChanged(todos);
        localStorage.setItem('todos', JSON.stringify(todos));
    }
}

class View {
    constructor () {
        //Root
        this.app = this.getElement('#root');

        //Title
        this.title = this.createElement('h1');
        this.title.texContent = 'Prueba';

        //Form with type=text input
        this.form = this.createElement('form');

        this.input = this.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Agregar Tarea';
        this.input.name = 'todo';

        this.submitButton = this.createElement('button');
        this.submitButton.textContent = 'Agregar';

        //representacion visual de la tarea
        this.todoList = this.createElement('ul', 'todo-list');

        //Agregar el campo y el boton de enviar al formulario
        this.form.append(this.input, this.submitButton);

        //Agrega el titulo, formulario y la lista de tareas
        this.app.append(this.title, this.form, this.todoList);
        
        this._temporaryTodoText;
        this._initLocalListeners();
    }

    _initLocalListeners(){
        this.todoList.addEventListener('input', event =>{
            if (event.target.className === 'editable'){
                this._temporaryTodoText = event.target.innerText;
            }
        })
    }

    createElement (tag, className) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        return element;
    }

    getElement(selector) {
        const element = document.querySelector(selector);
        return element;
    }

    get _todoText(){
        return this.input.value
    }

    _resetInput(){
        this.input.value = ''
    }

    displayTodos(todos){
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild)
        }
    
        //Mostrar mensaje por defecto
        if (todos.length === 0){
            const p = this.createElement('p');
            p.texContent = 'Nada que se haya agregado';
            this.todoList.append(p);
        } else {
            todos.forEach(todo => {
                const li = this.createElement('li');
                li.id = todo.id;
    
                //Cada Tarea tendra un checkbox para encender o apagar
                const checkbox = this.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.complete;
    
                //Cada tarea tendra un area editable
                const span = this.createElement('span');
                span.contentEditable = true;
                span.classList.add('editable');
    
                if (todo.complete) {
                    const strike = this.createElement('s');
                    strike.textContent = todo.text;
                    span.append(strike);
                } else {
                    span.textContent = todo.text;
                }
    
                //Las tareas tambien tienen un boton de borrar
                const deleteButton = this.createElement('button', 'delete');
                deleteButton.textContent = 'Borrar';
                li.append(checkbox, span, deleteButton);
    
                //Agrega nueva tarea a la lista
                this.todoList.append(li);
            });
        }
    }

    bindAddTodo(handler) {
        this.form.addEventListener('submit', event =>{
            event.preventDefault();

            if (this._todoText){
                handler(this._todoText);
                this._resetInput();
            }
        });
    }

    bindDeleteTodo(handler){
        this.todoList.addEventListener('click', event =>{
            if (event.target.className === 'delete') {
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }

    bindToggleTodo(handler){
        this.todoList.addEventListener('change', event =>{
            if (event.target.type === 'checkbox') {
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }
    
    bindEditTodo(handler){
        this.todoList.addEventListener('focusout', event=>{
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentElement.id);

                handler(id, this._temporaryTodoText);
                this._temporaryTodoText='';
            }
        });
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.onTodosListChanged(this.model.todos);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindEditTodo(this.handleEditTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.model.bindTodoListChanged(this.onTodosListChanged);
    };

    onTodosListChanged = todos => {
        this.view.displayTodos(todos);
    };

    handleEditTodo = (id, todo) =>{
        this.model.editTodo(id, todo);
    };

    handleDeleteTodo = id =>{
        this.model.deleteTodo(id);
    };

    handleToggleTodo = id =>{
        this.model.toggleTodo(id);
    };

    handleAddTodo = todo =>{
        this.model.addTodo(todo);
    };

}

const app = new Controller ( new Model(), new View() );
