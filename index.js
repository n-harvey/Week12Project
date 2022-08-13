

class Project {
    constructor(name, lead, date){
        this.name = name
        this.lead = lead
        this.members = []
        this.date = date
    }
}

class Member{
    constructor(name){
        this.name = name
    }
}


class API {
    static url = 'https://crudcrud.com/api/b26210a0b46f4379a978d71992a56408/unicorns'

    static getAllProjects(){
        return $.get(this.url)
    }

    static getProject(id){
        return $.get(`${this.url}/${id}`)
    }

    static createProject(project){
        console.log(project)
        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(project),
            contentType: 'application/json',
            type: 'POST'
        })
    }

    static deleteProject(id){
        return $.ajax({
            url: `${this.url}/${id}`,
            type: 'DELETE'
        })
    }

    static updateProject(project){

        let url = `${this.url}/${project._id}`
        delete project._id
        return $.ajax({
            url: url,
            dataType: 'json',
            data: JSON.stringify(project),
            contentType: 'application/json',
            type: 'PUT'
        })
    }
}

class ProjectManager{

    static projects

    static getAllProjects(){
        API.getAllProjects()
            .then((projects) => this.render(projects))
    }

    static newProject(name, lead, date){
        API.createProject(new Project(name, lead, date))
            .then(() => {
                return API.getAllProjects()
            })
            .then((projects) => this.render(projects))
    }

    static removeProject(id){
        API.deleteProject(id)
            .then(() => {
                return API.getAllProjects()
            })
            .then((projects) => this.render(projects))
    }

    static addTeamMember(id){
        for (let project of this.projects) {
            if(id === project._id){
                project.members.push(new Member($(`#${project._id}-member-name`).val()))
                API.updateProject(project)
                    .then(() => {
                        return API.getAllProjects()
                    })
                    .then((projects) => this.render(projects))
            }
        }
    }
    
    static render(projects){
        this.projects = projects
        $('#projectDisplay').empty()
        for (const project of projects) {
            $('#projectDisplay').append(
                `<div id=${project._id}>
                    <div>
                        <div class="row">
                            <div class="col">
                                <h2>${project.name}</h2>
                            </div>
                            <div class="col">
                                <button class="btn btn-danger" onclick="ProjectManager.removeProject('${project._id}')">Remove Project</button>
                                <button class="btn btn-success" onclick="ProjectManager.completePorject('${project._id}')">Complete Project</button>
                            </div>
                        </d
                    </div>
                    <div>
                        Project Lead: ${project.lead} <br>
                        Project Due Date: ${project.date}
                    </div>
                    <div class="row">
                        <div id="team-members">
                            <h6>Team Members:</h6>
                        </div>
                        <div>
                            <input type="text" id="${project._id}-member-name" class="" placeholder="Team Member"><br>
                            <button class="btn btn-success" onclick="ProjectManager.addTeamMember('${project._id}')">Add Team Member</button>
                        </div>
                    </div>
                </div>
                `
            )
            for(const member of project.members){
                $(`#${project._id}`).find('#team-members').append(
                    `
                    <p> <button class="btn btn-danger btn-sm" onclick="ProjectManager.deleteTeamMember()">-</button>${member.name}</p>
                    `
                )
            }
        }
    }
}

$('#new-project-button').on('click', function(){
    if($('#project-name').val() !== '' && $('#project-name').val() !== '' && $('#project-date').val() !== ''){
    ProjectManager.newProject($('#project-name').val(), $('#project-lead').val(), $('#project-date').val())
    $('#project-name').val('')
    $('#project-lead').val('')
    $('#project-date').val('')
    }
})

ProjectManager.getAllProjects()