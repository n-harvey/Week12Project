

class Project {
    constructor(name, lead, date){
        this.name = name
        this.lead = lead
        this.members = []
        this.date = date
        this.complete = false
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
            data: JSON.stringify(project),
            contentType: 'application/json',
            type: 'PUT',
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
            if($(`#${project._id}-member-name`).val() !== ''){
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
    }

    static deleteTeamMember(id, name){
        console.log('Running delete team member', id, name)
        for (const project of this.projects) {
            if(id === project._id){
                console.log('Found matching project')
                for (const member of project.members) {
                    if(member.name === name){
                        console.log('found matching name')
                        project.members.splice(project.members.indexOf(member),1)
                        API.updateProject(project)
                            .then(() => {
                                return API.getAllProjects()
                            })
                            .then((projects) => this.render(projects))
                    }
                }
            }
        }
    }

    static completeProject(id){
        for(const project of this.projects){
            if(id === project._id){
                project.complete = true;
                $(`#${id}`).remove()
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
        projects.sort((a,b) => (a.date > b.date) ? 1 : -1)
        $('#currentProjectDisplay').empty()
        $('#completedProjectDisplay').empty()
        for (const project of projects) {
            console.log(project)
            if(project.complete === false){
                $('#currentProjectDisplay').append(
                    `<br> 
                    <div id=${project._id}>
                        <div>
                            <div class="row shadow pb-3 border">
                                <div class="col">
                                    <h2>${project.name}</h2>
                                </div>
                                <div class="col pt-1">
                                    <button class="btn btn-success" onclick="ProjectManager.completeProject('${project._id}')">Complete Project</button>
                                    <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#removeModal">Remove Project</button>
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
                            <div class="col-3">
                                <input type="text" id="${project._id}-member-name" placeholder="Team Member">
                                <button class="btn btn-sm btn-success mt-1"  onclick="ProjectManager.addTeamMember('${project._id}')">Add Team Member</button>
                            </div>
                        </div>
                    </div>
                    `
                )
                for(const member of project.members){
                    $(`#${project._id}`).find('#team-members').append(
                        `
                        <p> <button class="btn btn-danger btn-sm" onclick="ProjectManager.deleteTeamMember('${project._id}', '${member.name}')">-</button>${member.name}</p>
                        `
                    )
                }
            }
            else if(project.complete === true){
                $('#completedProjectDisplay').append(
                    `<br> 
                    <div id=${project._id} class='completed'>
                        <div>
                            <div class="row shadow pb-3 border">
                                <div class="col">
                                    <h2>${project.name}</h2>
                                </div>
                                <div class="col pt-1 text-center fw-bold text-success">
                                    PROJECT COMPLETED
                                </div>
                            </div>
                        </div>
                        <div>
                            Project Lead: ${project.lead} <br>
                            Project Due Date: ${project.date}
                        </div>
                        <div class="row">
                            <div id="team-members">
                                <h6>Team Members:</h6>
                            </div>
                        </div>
                    </div>
                    <div class="col-3">
                        <button class="btn btn-sm btn-danger mt-1 " onclick="ProjectManager.removeProject('${project._id}')">Remove Project</button>
                    </div>
                    `
                )
                for(const member of project.members){
                    $(`#${project._id}`).find('#team-members').append(
                        `
                        <p> <button class="btn btn-danger btn-sm" onclick="ProjectManager.deleteTeamMember('${project._id}', '${member.name}')">-</button>${member.name}</p>
                        `
                    )
                }
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

$('#removeModal').on('shown.bs.modal', function(event){
    console.log('show-bs-modal')
    var id = $(event.relatedTarget).parent().parent().parent().parent().attr('id')
    $('#confirmRemove').on('click', function(){
        console.log(`Removing project ${id}`)
        ProjectManager.removeProject(id)
        $(this).off('click')
    })
})

ProjectManager.getAllProjects()

//onclick="ProjectManager.removeProject('${project._id}')