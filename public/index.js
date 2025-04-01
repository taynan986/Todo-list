class TaskManager {
    static taskList = [];

    static loadTasks(tasks){
        for (let i=0; i<tasks.length; i++){
            this.push(tasks[i].id, tasks[i].name, tasks[i].status);
        }
    }
    static push(id, name, status) {
        this.taskList.push({ "id": id, "name": name, "status": status });
        TaskRenderer.addTask(id, name, status);
    }
    static update(id, name, status) {
        RequestManager.replaceTask(id, name, status);

        const index = this.taskList.find(function (obj, index) {
            if (obj.id == id) {
                return index;
            }
        });
        this.taskList[index] = { "id": id, "name": name, "status": status };
    }
    static updateName(id, name) {
        RequestManager.updateTaskName(id, name);

        const index = this.taskList.findIndex((obj) => obj.id == id);
        const currentTask = { ...this.taskList[index] };
        this.taskList[index] = { "id": id, "name": name, "status": currentTask.status };
    }
    static updateStatus(id, status) {
        RequestManager.updateTaskStatus(id, status);

        const index = this.taskList.findIndex((obj) => obj.id == id);
        const currentTask = { ...this.taskList[index] };
        this.taskList[index] = { "id": id, "name": currentTask.name, "status": status };
    }
    static removeTask(id) {
        RequestManager.removeTask(id);

        const index = this.taskList.findIndex((obj) => obj.id == id);
        this.taskList.splice(index, 1);
    }
}

class TaskRenderer {
    static addTask(id, taskName, status) {
        const task_list = document.getElementById("task-list");

        const div = document.createElement("div");
        div.id = "task_" + id;
        div.numId = id;

        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = status;

        check.addEventListener("change", (event) => {
            const isChecked = event.currentTarget.checked;
            this.updateTaskStatus(div.numId, isChecked);
        })

        const name = document.createElement("input");
        name.id = "input_"+id;
        name.isEditing = true;
        name.disabled = true;

        const edit = document.createElement("button");
        edit.addEventListener("click", () => this.updateTaskName(div.numId, name, edit));

        const remove = document.createElement("button");
        remove.addEventListener("click", () => this.removeTask(div, div.numId))

        name.value = taskName;
        edit.innerText = "edit";
        remove.innerText = "remove";

        div.appendChild(check)
        div.appendChild(name);
        div.appendChild(edit);
        div.appendChild(remove);

        task_list.append(div);
    }
    static removeTask(div, id) {
        div.remove();
        TaskManager.removeTask(div.numId);
    }
    static updateTaskName(id, input, button) {
        if (input.isEditing) {
            button.innerText = "done";
        } else {
            TaskManager.updateName(id, input.value);
            button.innerText = "edit";
        }

        input.isEditing = !input.isEditing;
        input.disabled = !input.disabled;
    }
    static updateTaskStatus(id, checked) {
        TaskManager.updateStatus(id, checked);
    }
}

class RequestManager {
    static requests = [];

    static getTasks(url) {
        fetch("/tasks", {
            method: "GET"
        })
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {
            TaskManager.loadTasks(data);
        })
        .catch((err)=> {throw err});
    }

    static postTask(name, status) {
        fetch("/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "name": name, "status": status ? 1 : 0 })
        })
        .then(function (res) {
            return res.text();
        })
        .then(function (data) {
            const id = parseInt(data);
            TaskManager.push(id, name, status);
        })
        .catch((err)=> {throw err});
    }

    static replaceTask(id, name, status) {
        fetch("/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": id, "name": name, "status": status })
        })
        .then(function (res) {
            return res.ok;
        })
        .catch((err)=> {throw err});
    }

    static updateTaskName(id, name) {
        fetch("/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"id": id, "name": name, "type": "name"})
        })
        .then(function(res){
            return res.ok;
        })
        .catch((err)=> {throw err});
    }

    static updateTaskStatus(id, status){
        fetch("/tasks/", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"id": id, "status": status? 1: 0, "type": "status"})
        })
        .then(function(res){
            return res.ok;
        })
        .catch((err)=>{ throw err });
    }
    static removeTask(id){
        fetch("/tasks/"+id, {
            method: "DELETE",
            headers: { "Content-Type": "text/plain" },
            body: toString(id)
        })
        .then(function(res){
            return res.ok;
        })
        .catch((err)=>{ throw err });
    }
}

const tasks = RequestManager.getTasks();

const task_name = document.getElementById("task-name");
const send_btn = document.getElementById("task-send");

send_btn.addEventListener("click", async function () {
    const name = task_name.value;
    RequestManager.postTask(task_name.value, false);
});