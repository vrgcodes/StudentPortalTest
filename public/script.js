document.addEventListener("DOMContentLoaded", function(){ //To ensure that code executes only once page has loaded
    //Login authentication:
    document.getElementById("dataForm").addEventListener("submit", function(event){
        event.preventDefault();
        
        
        const mail = `"${document.getElementById("username").value}"`;
        const pass = `"${document.getElementById("password").value}"`;

        fetch("/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({mail:mail, pass:pass}) //Providing the back-end with the email and password
        })
        .then(response => response.json())
        .then(data=>{
            if (data.match){
                //Storage of the access and refresh tokens
                sessionStorage.setItem('accessToken', data.accessToken)
                sessionStorage.setItem('refreshToken', data.refreshToken)
                if(data.priority){
                    window.location.href = 'admin.html';
                }
                else{
                    window.location.href = 'prefect.html';
                }
                
            }
            else{
                alert("Invalid credentials!")
                location.replace("http://localhost:8080/");
            }
        })
        .catch(error=> console.error(error));
    });
    //End of login authentication
   
});

document.addEventListener("DOMContentLoaded", function() {

    if(window.location.pathname == "/admin.html"){
        fetch('/user-data', { //Triggers a call to get user data
            method:'GET',
            headers:{'Authorization':'Bearer '+sessionStorage.getItem('accessToken')}
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.message == "No token provided" || data.message == "Invalid token" || data.message == "Failed to authenticate token"){
                window.location.pathname = '/index.html'
            }
            if(data.message == "Token expired"){ //The only valid message to trigger a refresh token check
                fetch('/token', {
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({refresh:sessionStorage.getItem('refreshToken')})
                })
                .then(response=>response.json())
                .then(data1=>{
                    if(!(data1.match)){
                        window.location.pathname = '/index.html' 
                    }

                    
                })

            }

            //End of Refresh Token Authentication
            
        })
    }

    //User registration

    const emailEl = document.querySelector('#username1');
    const passwordEl = document.querySelector('#password1');
    const confirmPasswordEl = document.querySelector('#password1_confirm');
    const popup1 = document.querySelector('#confirm_popup')
    const nameE1 = document.querySelector('#name1')

    const form = document.querySelector('#dataFormReg');

    function openPopup(){
        popup1.classList.add('open-popup')
    } // Registration confirmation message

    //Syntax Check Functions

    const checkName = () => {
        let valid = false;
        const name = nameE1.value.trim();
        if(!isRequired(name)){
            showError(nameE1, 'Name cannot be blank.')
        } else{
            showSuccess(nameE1)
            valid = true;
        }
        return valid;
    }

    

    const checkEmail = () => {
        let valid = false;
        const email = emailEl.value.trim();
        if (!isRequired(email)) {
            showError(emailEl, 'Email cannot be blank.');
        } else if (!isEmailValid(email)) {
            showError(emailEl, 'Email is not valid.');
        } else {
            showSuccess(emailEl);
            valid = true;
        }
        return valid;
    };

    const checkPassword = () => {
        let valid = false;
        const password = passwordEl.value.trim();
        if (!isRequired(password)) {
            showError(passwordEl, 'Password cannot be blank.');
        } else if (!isPasswordSecure(password)) {
            showError(passwordEl, 'Password must have at least 8 characters that include at least 1 lowercase character, 1 uppercase character, 1 number, and 1 special character (!@#$%^&*).');
        } else {
            showSuccess(passwordEl);
            valid = true;
        }
        return valid;
    };

    const checkConfirmPassword = () => {
        let valid = false;
        const confirmPassword = confirmPasswordEl.value.trim();
        const password = passwordEl.value.trim();
        if (!isRequired(confirmPassword)) {
            showError(confirmPasswordEl, 'Please enter the password again.');
        } else if (password !== confirmPassword) {
            showError(confirmPasswordEl, 'The password does not match.');
        } else {
            showSuccess(confirmPasswordEl);
            valid = true;
        }
        return valid;
    };

    const isEmailValid = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    const isPasswordSecure = (password) => {
        const re = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        return re.test(password);
    };

    const isRequired = value => value === '' ? false : true;

    //End of syntax check functions

    const showError = (input, message) => {
        const formField = input.parentElement;
        formField.classList.remove('success');
        formField.classList.add('error');
        const error = formField.querySelector('small');
        error.textContent = message;
    }; //Highlights entry box red if syntax checks not passed

    const showSuccess = (input) => {
        const formField = input.parentElement;
        formField.classList.remove('error');
        formField.classList.add('success');
        const error = formField.querySelector('small');
        error.textContent = '';
    }; //Highlights entry box green if syntax checks are passed

    form.addEventListener('submit', function(e) { //Submitting the user details
        e.preventDefault();

        let isEmailValid = checkEmail(),
            isPasswordValid = checkPassword(),
            isConfirmPasswordValid = checkConfirmPassword(),
            isNameValid = checkName();

        let isFormValid = isEmailValid && isPasswordValid && isConfirmPasswordValid && isNameValid;
        

        if (isFormValid) {
            fetch("/register", { //Providing the backend with the name, e-mail, and password
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: nameE1.value, mail:emailEl.value, pass:passwordEl.value})
            })
            .then(response => response.json())
            .then(data=>{
                if (data.match){
                    openPopup(); //If back-end sends a response back then open the confirmation popup
                }
            })
            .catch(error=> console.error(error));
        }
    });

    const debounce = (fn, delay = 500) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                fn.apply(null, args);
            }, delay);
        };
    }; //Debounce (delays the function) to ensure that our dynamic syntax checks are only triggered when user enters data and not constantly

    form.addEventListener('input', debounce(function(e) { //performs dynamix syntax checks on each field
        switch (e.target.id) {
            case 'username1':
                checkEmail();
                break;
            case 'password1':
                checkPassword();
                break;
            case 'password1_confirm':
                checkConfirmPassword();
                break;
            case 'name1':
                checkName();
                break;
        }
    }));

    //End of user registeration
});

document.addEventListener("DOMContentLoaded", function(){

    //Mix of various functions under this DOMContentLoaded

    const sidebar = document.querySelector('.sidebar');
    const contentContainer = document.querySelectorAll('.assignment-container, .todo-container, .grades-container');
    const dashboard = document.getElementById('actElement')
    const announcement = document.getElementById('actElement2')
    const calendar = document.getElementById('actElement3')
    const logout = document.querySelector('.logout')
    const specialRights = document.querySelector('.second-row') //Elements of the second row (only to be displayed for head prefects and detention prefects)
    const list = document.querySelector(".detention-list-container") //^

    //Logout Event Handler
    logout.addEventListener("click", ()=>{
        fetch("/logout", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token:sessionStorage.getItem('refreshToken')}) //Sends the refresh token back so that it can be deleted from the database
        })
        .catch(error=> console.error(error));
        //Removal of items from storage
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        localStorage.removeItem('name')
        localStorage.removeItem('status')
        
        this.location.replace("index.html")
    })
    
    if (window.location.pathname == '/prefect.html'){
        const allowedStatuses = ["Head Boy", "Head Girl", "Detention Prefect", "Deputy Head Boy", "Deputy Head Girl"];
        //Start of dashboard JS

        //Refresh Token Authentication
        fetch('/user-data', { //Triggers a call to get user data
            method:'GET',
            headers:{'Authorization':'Bearer '+sessionStorage.getItem('accessToken')}
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.message == "No token provided" || data.message == "Invalid token" || data.message == "Failed to authenticate token"){
                window.location.pathname = '/index.html'
            }
            if(data.message == "Token expired"){ //The only valid message to trigger a refresh token check
                fetch('/token', {
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({refresh:sessionStorage.getItem('refreshToken')})
                })
                .then(response=>response.json())
                .then(data1=>{
                    if(!(data1.match)){
                        window.location.pathname = '/index.html' 
                    }
                    //Once refresh token is validated, Access Token is stored, Name, Class and Status are displayed.
                    sessionStorage.setItem('accessToken', data1.accessToken) 
                    document.getElementById("Name").innerHTML = data1.userID.fullName || localStorage.getItem('name');
                    document.getElementById("Class").innerHTML = "Class Allocation: " + (data1.userID.classAllocation ? data1.userID.classAllocation : localStorage.getItem('class')) ;
                    document.getElementById("Status").innerHTML = data1.userID.userStatus || localStorage.getItem('status');

                    //Ensures that detention provision capabilities are given only to select prefects.
                    
                    const currentStatus = data1.userID.userStatus ? data1.userID.userStatus : localStorage.getItem('status');
                    if (!allowedStatuses.includes(currentStatus)) {
                        specialRights.remove();
                        list.remove();
                    }
                    
                })

            }
            else{
                document.getElementById("Name").innerHTML = data.fullName || localStorage.getItem('name');
                localStorage.setItem("name", data.fullName)
                document.getElementById("Class").innerHTML = "Class Allocation: " + (data.classAllocation ? data.classAllocation : localStorage.getItem('class')) ;
                localStorage.setItem("class", data.classAllocation)
                document.getElementById("Status").innerHTML = data.userStatus || localStorage.getItem('status');
                localStorage.setItem("status", data.userStatus)
                const currentStatus = data.userStatus ? data.userStatus : localStorage.getItem('status');
                

                if (!allowedStatuses.includes(currentStatus)) {
                    specialRights.remove();
                    list.remove();
                }
            }
            //End of Refresh Token Authentication
            
        })

        //Special rights handler

        
        const status = localStorage.getItem("status")
        if (status==null){
            this.location.reload()
            setTimeout(checkStatusAndReload, 100);
        }
        const date = new Date()
        const announcementProvision = document.querySelector(".announcements-container")
        const eventsList = document.querySelector(".upcoming_events")
        const eventNameList1 = document.querySelector(".event1")
        const eventDateList1 = document.getElementById("eventDay1")
        const eventTimeList1 = document.getElementById("eventTime1")
        const eventNameList2 = document.querySelector(".event2")
        const eventDateList2 = document.getElementById("eventDay2")
        const eventTimeList2 = document.getElementById("eventTime2")
        const eventNameList3 = document.querySelector(".event3")
        const eventDateList3 = document.getElementById("eventDay3")
        const eventTimeList3 = document.getElementById("eventTime3")

        if (status !== "Head Boy" && status !== "Head Girl" && status !== "Deputy Head Boy" && status !== "Deputy Head Girl"){
            announcementProvision.remove() //Ability to post announcements is revoked

            const announcementParent = document.querySelector(".first-row")
    
            fetch('/getAnnouncement', { //Gets announcements from the database
                method: 'GET',
            })
            .then(response=>response.json())
            .then(data=>{
                //Displays the latest announcement on the dashboard for ease of access
                let givenDate = data[0].Date
                let givenTime = data[0].Time
                let dateObj = new Date(givenDate);

                let userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;

                let localDateObj = new Date(dateObj.getTime() - userTimezoneOffset);

                let adjustedDateString = localDateObj.toISOString().split('T')[0];

                let dateFromDB = adjustedDateString;

                let combinedDateTimeString = `${dateFromDB}T${givenTime}`;

                let finalDate = new Date(combinedDateTimeString);

                const now = new Date()
                const difference = Math.floor((now-finalDate)/(1000*60))
                
                const announcementWrapper = document.createElement('div');
                announcementWrapper.classList.add('announcements-wrapper');

                const announcementContainer = document.createElement('div');
                announcementContainer.classList.add('announcements-containerA');

                if(data[0].none){
                    const announcementsD = document.createElement('div');
                    announcementsD.classList.add('announcements-d');
                    announcementsD.textContent = "No announcements!";

                    announcementWrapper.appendChild(announcementsD);
                }
                else{
                    const subtitleDiv = document.createElement('div');
                    subtitleDiv.classList.add('subtitle');

                    const timeDiv = document.createElement('div');
                    timeDiv.classList.add('time');

                    const numDiv = document.createElement('div');
                    numDiv.classList.add('num');
                    numDiv.innerHTML = `<b>${difference}</b>`;

                    const unitDiv = document.createElement('div');
                    unitDiv.classList.add('unit');
                    unitDiv.textContent = 'MINS';

                    timeDiv.appendChild(numDiv);
                    timeDiv.appendChild(unitDiv);

                    const subtitleAnnouncementDiv = document.createElement('div');
                    subtitleAnnouncementDiv.classList.add('subtitle-announcement');
                    subtitleAnnouncementDiv.textContent = 'New Announcement!';

                    subtitleDiv.appendChild(timeDiv);
                    subtitleDiv.appendChild(subtitleAnnouncementDiv);

                    const announcementsD = document.createElement('div');
                    announcementsD.classList.add('announcements-d');
                    announcementsD.textContent = `${data[0].Announcement}`;

                    announcementWrapper.appendChild(subtitleDiv);
                    announcementWrapper.appendChild(announcementsD);
                    announcementContainer.appendChild(announcementWrapper)
                    announcementParent.append(announcementContainer)
                }
                //End of Latest Announcements

            })
            const name = localStorage.getItem("name")

            function formatDate(givenDate){ //Function to format date returned from the database
                let dateObj = new Date(givenDate);

                let userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;

                let localDateObj = new Date(dateObj.getTime() - userTimezoneOffset);

                let adjustedDateString = localDateObj.toISOString().split('T')[0];

                let dateFromDB = adjustedDateString;


                let finalDate = new Date(dateFromDB);
                
                const options = {weekday:'short', year: 'numeric', month: 'short', day: 'numeric'}
                const formattedDateE = finalDate.toLocaleDateString('en-US', options)
                return formattedDateE
            }
        
            fetch(`/getEventsDashboard?name=${name}`, { //Gets events that are either public or are created by the user
                method: 'GET',
            })
            .then(response=>response.json())
            .then(data=>{
                //Shows the latest three events on the dashboard
                if(data.length == 3){
                    eventNameList1.innerHTML = data[0].Event
                    eventDateList1.innerHTML = formatDate(data[0].Date)
                    eventTimeList1.innerHTML = `${data[0].Time_From.substring(0,5)} - ${data[0].Time_To.substring(0,5)}`

                    eventNameList2.innerHTML = data[1].Event
                    eventDateList2.innerHTML = formatDate(data[1].Date)
                    eventTimeList2.innerHTML = `${data[1].Time_From.substring(0,5)} - ${data[1].Time_To.substring(0,5)}`

                    eventNameList3.innerHTML = data[2].Event
                    eventDateList3.innerHTML = formatDate(data[2].Date)
                    eventTimeList3.innerHTML = `${data[2].Time_From.substring(0,5)} - ${data[2].Time_To.substring(0,5)}`
                }
                if(data.length == 2){
                    eventNameList1.innerHTML = data[0].Event
                    eventDateList1.innerHTML = formatDate(data[0].Date)
                    eventTimeList1.innerHTML = `${data[0].Time_From.substring(0,5)} - ${data[0].Time_To.substring(0,5)}`

                    eventNameList2.innerHTML = data[1].Event
                    eventDateList2.innerHTML = formatDate(data[1].Date)
                    eventTimeList2.innerHTML = `${data[1].Time_From.substring(0,5)} - ${data[1].Time_To.substring(0,5)}`
                }
                if(data.length == 1){
                    eventNameList1.innerHTML = data[0].Event
                    eventDateList1.innerHTML = formatDate(data[0].Date)
                    eventTimeList1.innerHTML = `${data[0].Time_From.substring(0,5)} - ${data[0].Time_To.substring(0,5)}`
                }
            })
            //End of Upcoming Events

        }

        if (status == "Head Boy" || status == "Head Girl" || status == "Deputy Head Boy" || status == "Deputy Head Girl"){
            eventsList.remove() //Head-prefects do not have the upcoming events feature, rather they can make announcements, have access to the detention list, and give detentions (only head boy and head girl)
        }


        if ((status === "Head Boy" || status === "Head Girl" || status ==="Detention Prefect")&& (date.getDay()==1||date.getDay()==3)){

            //Detention list handler
            //The use of 1 or 3 for the date.getDay() function is to ensure the detention list is only presented on Monday or Wednesday, which is 1 day before the respective detention days (Tuesday and Thursday)

            const detentionList= document.querySelector('.detention-list-wrapper')
            const detentionDay = document.getElementById('day_detention')
            
            
        
            

            fetch('getDList', {//Gets lunch time detentions from the database
                method:"GET"
            })
            .then(response=>response.json())
            .then(data=>{
                if (date.getDay()==1){
                    detentionDay.innerHTML = 'Tuesday Detention List:'
                }
                if (date.getDay()==3){
                    detentionDay.innerHTML = 'Thursday Detention List:'
                }
                data.forEach((name)=>{ //For each name from the back-end, the HTML is formatted to include a checkbox which is ticked by the present detention officer if the person is present, and not ticked if the person is absent, which is then recorded by the program.
                    const listItem = document.createElement('li')
                    listItem.innerHTML = `
                        <input type="checkbox" class="detention-list-checkbox">
                        <label>${name.Name}</label>
                    `
                    detentionList.appendChild(listItem)
                })
                
                
            })
            .catch(error=> console.error(error));

             //Lunch time detention attendance handler
            detentionList.addEventListener('change', (event) => {
                if (event.target.classList.contains('detention-list-checkbox')) {
                    const label = event.target.nextElementSibling;
                    if (event.target.checked) {
                        label.classList.add('detention-list-crossed-out');
                    } else {
                        label.classList.remove('detention-list-crossed-out');
                    }
                }
            });

            const submitButton = document.createElement('button');
            submitButton.id = 'list_enter';
            submitButton.textContent = 'Submit';
            submitButton.className = 'detention-list-submit';
            detentionList.parentElement.appendChild(submitButton);

            const enterButton = document.getElementById('list_enter');

            enterButton.addEventListener('click', () => {
                const checkedNames = Array.from(document.querySelectorAll('.detention-list-checkbox:checked'))
                                           .map(checkbox => checkbox.nextElementSibling.textContent);

                alert("Attendance recorded!")

                fetch('/DAttendance', { //Sends attendance data back to the back-end
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({attended:checkedNames})
                })
                .catch(error=> console.error(error));

                
            })
            //End of detention list
            
        }
        

        
        //Code to ensure that depending on which tab the user is on, the right element is highlighted and the expansion of the sidebar occurs smoothly

        sidebar.addEventListener("mouseover", ()=>{
            contentContainer.forEach(container => {
                container.style.width = 'calc(50% - 3rem)';
            });
            dashboard.classList.add('active')
        });

        sidebar.addEventListener("mouseout", ()=>{
            contentContainer.forEach(container => {
                container.style.width = 'calc(50% - 1rem)';
            });
            dashboard.classList.remove('active')
        });

        //Displaying break duties 

        const name = localStorage.getItem("name")
        const breakDuty1 = document.querySelector('.duty1')
        const breakDuty2 = document.querySelector('.duty2')
        const bathroomDuty = document.querySelector('.duty3')
        const breakDuty1_week = document.getElementById('duty1_week')
        const breakDuty2_week = document.getElementById('duty2_week')
        const bathroomDuty_week = document.getElementById('duty3_week')
        const breakDuty1_status = document.getElementById('duty1_status')
        const breakDuty2_status = document.getElementById('duty2_status')
        const bathroomDuty_status = document.getElementById('duty3_status')

        fetch(`/getDuty?name=${name}`, { //Gets the duties for the respective prefect
            method: 'GET'
        })
        .then(response => response.json())
        .then(data=>{
            breakDuty1.innerHTML = data[0].Duty
            breakDuty1_week.innerHTML = data[0].DateofDuty ? data[0].DateofDuty.split('T')[0] : ""
            breakDuty1_status.innerHTML = "Confirmed"

            breakDuty2.innerHTML = data[1].Duty
            breakDuty2_week.innerHTML = data[1].DateofDuty ? data[1].DateofDuty.split('T')[0] : ""
            breakDuty2_status.innerHTML = "Confirmed"

            bathroomDuty.innerHTML = data[2].Duty
            bathroomDuty_week.innerHTML = data[1].DateofDuty ? data[1].DateofDuty.split('T')[0] : ""
            bathroomDuty_status.innerHTML = "Confirmed"
        })
        .catch(error=> console.error(error));

        let viewDuties = document.querySelector('.viewBtn')
        let main = document.querySelector('.d-content')
        
        viewDuties.addEventListener('click', ()=>{
            let popupDuty = document.querySelector('.popupDuty')
            popupDuty.classList.add('active')
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
            fetch(`/getDuty?name=${name}`, { //Gets the duties for the respective prefect
                method: 'GET'
            })
            .then(response => response.json())
            .then(data=>{
                data.forEach(element=>{
                    let itemBreak = document.createElement('div')
                    itemBreak.classList.add('item', 'break')

                    let dutyIcon = document.createElement('div')
                    dutyIcon.classList.add('icon')

                    let icon = document.createElement('i')
                    icon.classList.add('bx', 'bxs-label')
                    dutyIcon.appendChild(icon)

                    let right = document.createElement('div')
                    right.classList.add('right')

                    let info = document.createElement('div')
                    info.classList.add('info')

                    let heading = document.createElement('h3')
                    heading.classList.add('duty1')
                    heading.innerText = element.Duty

                    let date = document.createElement('small')
                    date.classList.add('muted-text')
                    date.setAttribute('id', 'duty1_week')
                    date.innerText = element.DateofDuty ? element.DateofDuty.split('T')[0] : "No date"

                    info.appendChild(heading)
                    info.appendChild(date)
                    right.appendChild(info)
                    

                    let statusDuty = document.createElement('h5')
                    statusDuty.classList.add('confirm')
                    statusDuty.setAttribute('id', 'duty1_status')
                    statusDuty.innerText = 'Confirmed'

                    right.appendChild(statusDuty)

                    itemBreak.appendChild(dutyIcon)
                    itemBreak.appendChild(right)

                    popupDuty.append(itemBreak)


                })
            })
       
            .catch(error=> console.error(error));
        })

        let closeBtnDuties = document.querySelector('.close-btnDuty')

        closeBtnDuties.addEventListener('click', ()=>{
            document.querySelector('.popupDuty').classList.remove('active')
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })

     


        //Announcement provision code for head prefects only

        const announcementText = document.querySelector(".announcement_Area")
        const announcementForm = document.querySelector(".announcement_Form")
        


        announcementForm.addEventListener("submit", function (event){
            event.preventDefault();
            fetch("/announcements", { //Sends the announcements to the back-end for storage in the database
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({text:announcementText.value})
            })
            .then(response => response.json())
            .then(data=>{
                if (data.match){
                    alert("Successfully posted!")
                    document.querySelector(".announcement_Area").value = ''
                    
                }
                else{
                    alert("Error has occured!")
                }
            })
            .catch(error=> console.error(error));

            
        
        })

        
    }

    //End of dashboard JS 

    if (window.location.pathname == '/calendar.html'){
        //Start of calendar JS

        sidebar.addEventListener("mouseover", ()=>{
            contentContainer.forEach(container => {
                container.style.width = 'calc(50% - 3rem)';
            });
            dashboard.classList.remove('active')
            announcement.classList.remove('active')
            calendar.classList.add('active')
        });

        sidebar.addEventListener("mouseout", ()=>{
            contentContainer.forEach(container => {
                container.style.width = 'calc(50% - 1rem)';
            });
            calendar.classList.remove('active')
        });
 
        const calendar1 = document.querySelector('.calendar'),
            date = document.querySelector('.date'),
            daysContainer = document.querySelector('.days'),
            prev = document.querySelector('.prev'),
            next = document.querySelector('.next'),
            todayBtn = document.querySelector('.today-btn'),
            gotoBtn = document.querySelector('.goto-btn'),
            dateInput = document.querySelector('.date-input'),
            eventDay = document.querySelector(".event-day"),
            eventDate = document.querySelector(".event-date"),
            eventsContainer = document.querySelector('.events'),
            addEventSubmit = document.querySelector('.add-event-btn')  
            
        let addEventScope = document.querySelector('.dropdown')
        let status = localStorage.getItem("status")

        if (status !== "Head Boy" && status!== "Head Girl" && status !=="Deputy Head Boy"&& status !=="Deputy Head Girl"){
            addEventScope.remove() //Removes the option to make public events for normal prefects
        }

        let today = new Date()
        let activeDay;
        let month = today.getMonth();
        let year = today.getFullYear();

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const eventsArr =[] //Will store the arrays to be displayed when fetched from the back-end


        function initializeCalendar(){ //Function to initialize and begin the calendar including loading in the events

            function convertTime(time){ //Converts time received from the database into a presentable format
                let timeArr = time.split(":")
                let timeHour = timeArr[0]
                let timeMin = timeArr[1]
                let timeFormat = timeHour>=12?'PM':'AM'
                timeHour = timeHour%12||12
                time = timeHour + ":" + timeMin + " " + timeFormat
                return time
            }

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month+1, 0);
            const prevLastDay = new Date(year, month, 0);
            const prevDays = prevLastDay.getDate();
            const lastDate = lastDay.getDate();
            const day = firstDay.getDay();
            const nextDays = 7-lastDay.getDay()-1;

            date.innerHTML = months[month] + " " + year;

            let days = ''
            const name = localStorage.getItem("name")
            eventsArr.length = 0;
            
            fetch(`/getEvents?name=${name}`, { //Gets all events from the backend that are either public or belong to the user
                method: 'GET'
            })
            .then(response => response.json())
            .then(data=>{
                data.forEach((result)=>{ //For each event it is separated into its individual components
                    const date = new Date(result.Date)
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    const dayEvent = date.getDate();
                    const newEvent = {
                        title:result.Event,
                        time: convertTime(result.Time_From) + " - " + convertTime(result.Time_To), 
                    }
                    
                    const existingEvents = eventsArr.find(item => item.day === dayEvent && item.month === month-1 && item.year === year) //Looks for any duplicacies between data recieved from the database and data already in the events array to counteract the DOMContentLoaded misfiring

                    if (existingEvents){ //If the event exists, it will not be added to the events array.
                        pass
                    }
                    else{
                        eventsArr.push({ //If the event exists, it is added in the format shown below.
                            day: dayEvent,
                            month: month + 1,
                            year: year,
                            events: [newEvent]
                        })
                    }
                
                })

                
                //Iterations to create the calendar
                
                for (let x = day; x>0;x--){
                    days += `<div class="day prev-date">${prevDays-x+1}</div>`
                }
    
                for (let i = 1; i <= lastDate; i++){
                    let event = false;
                    eventsArr.forEach((eventObj)=>{
                        if(eventObj.day===i && eventObj.month === month+1&&eventObj.year===year){
                            event=true
                        }
                    })
    
                    if (i=== new Date().getDate() && year === new Date().getFullYear() && month=== new Date().getMonth()){
    
                        activeDay=i;
                        getActiveDay(i)
                        updateEvents(i)
    
                        if(event){
                            days += `<div class="day today active1 event">${i}</div>` //active1 represents the day the user is on, today represents the current day, and event represents if the day has an event or not
                        }
                        else{
                            days += `<div class="day today active1">${i}</div>`
                        }
                        
                    }
                    else{
                        if(event){
                            days += `<div class="day event">${i}</div>`
                        }
                        else{
                            days += `<div class="day">${i}</div>`
                        }
                    }
                    
                }
    
                for (let j = 1; j<=nextDays;j++){
                    days += `<div class="day next-date">${j}</div>`
                }
    
                daysContainer.innerHTML = days;
    
                addListener(); //Function that is defined below which will allow the calendar to be dynamic and respond to different commands such as moving to the next month, or another day
            })
            .catch(error=> console.error(error));

            
        }

        initializeCalendar();

        function prevMonth(){ //Will load the previous month on the calendar
            month--;
            if(month<0){
                month=11;
                year--;
            }
            initializeCalendar();
        }
    
        function nextMonth(){ //Will load the next month on the calendar
            month++;
            if(month>11){
                month=0;
                year++;
            }
            initializeCalendar();
        }
    
        prev.addEventListener("click", prevMonth); //Adding event listeners to the previous or next arrows on the calendar
        next.addEventListener('click', nextMonth);

        todayBtn.addEventListener('click', ()=>{ //used for the today button provided on the calendar which will take the user to the current day
            today = new Date();
            month = today.getMonth();
            year = today.getFullYear();
            initializeCalendar();
        })

        dateInput.addEventListener('keyup', (e)=>{ //Syntax checks for the date entry option provided to the user
            dateInput.value = dateInput.value.replace(/[^'0-9'/]/g, "")
            if (dateInput.value.length ===2){
                dateInput.value+="/"
            }
            if (dateInput.value.length>7){
                dateInput.value = dateInput.value.slice(0,7)
            }
            if(e.inputType === "deleteContentBackward"){
                if(dateInput.value.length === 3){
                    dateInput.value = dateInput.value.slice(0,2)
                }
            }
        })  

        function gotoDate(){ //Loads the date entered by the user
            const dateArr = dateInput.value.split("/")
            if(dateArr.length===2){
                if(dateArr[0]>0&& dateArr[0]<13&&dateArr[1].length===4){
                    month = dateArr[0]-1
                    year = dateArr[1]
                    initializeCalendar();
                    return;
                }
            }
            alert("Invalid date!")
        }


        gotoBtn.addEventListener("click", gotoDate)

        //Event creation code
        
        const addEventBtn = document.querySelector('.add-event'),
            addEventContainer = document.querySelector('.add-event-wrapper'),
            addEventCloseBtn = document.querySelector('.close'),
            addEventName = document.querySelector('.event-name'),
            addEventStart = document.querySelector('.event-time-from'),
            addEventEnd = document.querySelector('.event-time-to')
            
       

        

        addEventBtn.addEventListener("click", ()=>{
            addEventContainer.classList.add("active"); //If add event buttion is clicked, the event entry form will show
        })

        document.addEventListener("click", (e)=>{ //If an area outside the form is clicked, the event form closes.
            if (e.target !== addEventBtn && !addEventContainer.contains(e.target)){
                addEventContainer.classList.remove("active");
            }
        })

        addEventCloseBtn.addEventListener("click", (e)=>{ //If the close button on the form is clicked, the event form closes.
            addEventContainer.classList.remove("active");
        })

        //Event creation syntax checks

        addEventName.addEventListener("input", (e)=>{
            addEventName.value = addEventName.value.slice(0,50); //Ensures the event name does not exceed 50 characters
        })

        addEventStart.addEventListener('input', (e)=>{
            addEventStart.value = addEventStart.value.replace(/[^'0-9':]/g, "") //Ensures that event timings are numbers between 0-9 and include a :
            if (addEventStart.value.length ===2){
                addEventStart.value+=":"
            }
            if (addEventStart.value.length>5){
                addEventStart.value = addEventStart.value.slice(0,5) //Prevent the timings from exceeding 5 characters
            }
            if(e.inputType === "deleteContentBackward"){ //Allows the user to delete characters, and will automatically delete the colon added above
                if(addEventStart.value.length === 3){
                    addEventStart.value = addEventStart.value.slice(0,2)
                }
            }
        })

        addEventEnd.addEventListener('input', (e)=>{
            addEventEnd.value = addEventEnd.value.replace(/[^'0-9':]/g, "")
            if (addEventEnd.value.length ===2){
                addEventEnd.value+=":"
            }
            if (addEventEnd.value.length>5){
                addEventEnd.value = addEventEnd.value.slice(0,5)
            }
            if(e.inputType === "deleteContentBackward"){
                if(addEventEnd.value.length === 3){
                    addEventEnd.value = addEventEnd.value.slice(0,2)
                }
            }
        })

        function addListener(){ //Add listener function called above
            const days = document.querySelectorAll('.day')
            days.forEach((day)=>{
                day.addEventListener('click', (e)=>{
                    activeDay = Number(e.target.innerHTML);
                    getActiveDay(e.target.innerHTML)
                    updateEvents(Number(e.target.innerHTML))
                    days.forEach((day)=>{
                        day.classList.remove("active1")
                    })
                    if(e.target.classList.contains('prev-date')){ //If a date from the previous month is clicked, it will go to the previous month
                        prevMonth();
                        setTimeout(()=>{
                            const days = document.querySelectorAll('.day')

                            days.forEach((day)=>{
                                if(!day.classList.contains("prev-date") && day.innerHTML===e.target.innerHTML){
                                    day.classList.add("active1")
                                }
                            })


                        }, 100)
                    }

                    else if(e.target.classList.contains('next-date')){ //If a date from the next month is clicked, it will go the next month
                        nextMonth();
                        setTimeout(()=>{
                            const days = document.querySelectorAll('.day')

                            days.forEach((day)=>{
                                if(!day.classList.contains("next-date") && day.innerHTML===e.target.innerHTML){
                                    day.classList.add("active1")
                                }
                            })


                        }, 100)
                    }
                    else{
                        e.target.classList.add('active1')
                    }
                })
            })
        }
        
        
        function getActiveDay(date){ //Gets the date the user is currently on
            const day = new Date(year, month, date)
            const dayName = day.toString().split(" ")[0]
            eventDay.innerHTML = dayName
            eventDate.innerHTML = date + " " + months[month] + " " + year

        }

        function updateEvents(date){ //Used when the user creates an event to display the event on the HTML 
            let events = ''
            eventsArr.forEach((event)=>{
                if(date===event.day && month+1===event.month&&year===event.year){
                    event.events.forEach((event1)=>{
                        events+=`
                        <div class="event">
                            <div class="title">
                                <i class='bx bxs-circle'></i>
                                <h3 class="event-title">${event1.title}</h3>
                            </div>
                            <div class="event-time">${event1.time}
                            </div>
                        </div>
                        
                        `
                    })
                }
            })
            if(events===""){
                events = `<div class="no-event"><h3>No events!</h3></div>`
            }
            eventsContainer.innerHTML = events
        }
        addEventSubmit.addEventListener("click", ()=>{ //Gets data from the event form to send it to the back-end
            let scope;
            const eventTitle = addEventName.value	
            const eventFrom = addEventStart.value
            if (status !== "Head Boy" && status!== "Head Girl" && status !=="Deputy Head Boy"&& status !=="Deputy Head Girl"){
                scope = 'Private' //Prevents non-head prefects from creating a public event
            }
            else{
                scope = addEventScope.value
            }
            const eventTo = addEventEnd.value	
            const dateToUse = new Date(year, month, activeDay)
            const name = localStorage.getItem("name")
            
            if (eventTitle===""||eventFrom==="" || eventTo===""){
                alert("Please fill in all the fields!")
                return
            }

            const timeFromArr = eventFrom.split(":")
            const timeToArr = eventTo.split(":")

            if (timeFromArr.length !==2||timeToArr.length!==2||timeFromArr[0]>23||timeFromArr[1]>59||timeToArr[0]>23||timeToArr[1]>59){
                alert("Invalid time format!")
                return
            }

            const timeFrom = convertTime(eventFrom)
            const timeTo = convertTime(eventTo)


            fetch("/events", { //Sends the event to the backend for storage
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title:eventTitle, from:eventFrom, to:eventTo, scope:scope, day:dateToUse, name:name})
            })
            .catch(error=> console.error(error));
        

            const newEvent = { //Format in which an event created is stored
                title:eventTitle,
                time: timeFrom + " - " + timeTo, 
            }

            let eventAdded = false

            

            if (!eventAdded){ //Will store the event in the event array to allow it to be displayed when the calendar is initialized
                eventsArr.push({
                    day:activeDay,
                    month: month+1,
                    year: year, 
                    events: [newEvent],
                })
            }

            addEventContainer.classList.remove("active")
            addEventName.value = "";
            addEventStart.value = "";
            addEventEnd.value = "";
            

            updateEvents(activeDay) //Update events will recheck the events array and display it on the HTML

            const activeDayEl = document.querySelector(".day.active1");
            if (!activeDayEl.classList.contains("event")) {
              activeDayEl.classList.add("event"); //Adds the event class for CSS related issues
            }


            function convertTime(time){
                let timeArr = time.split(":")
                let timeHour = timeArr[0]
                let timeMin = timeArr[1]
                let timeFormat = timeHour>=12?'PM':'AM'
                timeHour = timeHour%12||12
                time = timeHour + ":" + timeMin + " " + timeFormat
                return time
            }

        })

        eventsContainer.addEventListener("click", (e)=>{ //If the event is clicked, it removes the event
            const name = localStorage.getItem("name")
            if(e.target.classList.contains("event")){
                const eventTitle = e.target.children[0].children[1].innerHTML
                fetch("/removeEvent", { //Ensure that the event is also deleted from the database
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({title:eventTitle, name:name, date:new Date(year, month, activeDay+1)})
                })
                .then(response=>response.json())
                .then(data=>{
                    
                    if (data.match){ //This code removes it from the HTML
                        eventsArr.forEach((event)=>{
                            if(event.day===activeDay&&event.month===month+1&&event.year===year){
                                event.events.forEach((item, index)=>{
                                    if(item.title===eventTitle){
                                        event.events.splice(index,1)
                                        
                                    }
                                })
                                if(event.events.length===0){
                                    eventsArr.splice(eventsArr.indexOf(event),1)
   
                                }
                            }
                            
                        })
                        updateEvents(activeDay)
                        
                    }
                })
                .catch(error=> console.error(error));
                
                
                
            }
        })


       



    }
    //End of calendar JS

    function getQuote(){
        const today = new Date().toISOString().split('T')[0]; 
        const quoteText = localStorage.getItem('quote')
        const quoteTime = localStorage.getItem('quoteTime')

        if(quoteText&&quoteTime){
            if (today===quoteTime){
                displayQuote(quoteText)
                return;
            }
        }

        fetch('/getQuote', { 
            method: 'GET'
        })
        .then(response => response.json())
        .then(data=>{
            localStorage.setItem("quote", data.quoteOftheDay);
            localStorage.setItem("quoteTime", today);
            displayQuote(data.quoteOftheDay)
        })
   
        .catch(error=>console.error(error));
    }

    function displayQuote(quote){
        let quoteElement = document.querySelector('.quoteText')
        quoteElement.innerText = quote;

    }

    getQuote();


});


document.addEventListener("DOMContentLoaded", function(){

        //Detention Provision Code

        //Detention provision error checks

        const btn1 = document.querySelector('.uniform-btn');
        const btn4 = document.querySelector('.detention-btn');
        const btn7 = document.querySelector('.sDetention-btn');
        const popup = document.querySelector('.modal')
        const popup4 = document.querySelector('.modal4')
        const popup7 = document.querySelector('.modal7')
        const close = document.querySelector('.close-btn')
        const close4 = document.querySelector('.close-btn4')
        const close7 = document.querySelector('.close-btn7')
        
        //Triggers the respective popups and controls their opening and closing (adding detentions are done through popups)
    
        btn1.addEventListener("click", ()=>{
            popup.classList.add('active')
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close.addEventListener("click", ()=>{
            popup.classList.remove('active')
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        btn4.addEventListener("click", ()=>{
            popup4.classList.add('active')
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close4.addEventListener("click", ()=>{
            popup4.classList.remove('active')
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        btn7.addEventListener("click", ()=>{
            popup7.classList.add('active')
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close7.addEventListener("click", ()=>{
            popup7.classList.remove('active')
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
        
        
    
        const btn2 = document.querySelector('.add-uniform');
        const popup2 = document.querySelector('.modal2')
        const close2 = document.querySelector('.close-btn2')
        const inputBox = document.getElementById('username');
        const classBox = document.getElementById('class');
        const add_un = document.querySelector('.modal-input-btn');
    
        btn2.addEventListener("click", ()=>{
            popup.classList.remove('active')
            popup2.style.display = 'block';
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        //Clears the popup once the details have been submitted 
    
        close2.addEventListener("click", ()=>{
            popup2.style.display = 'none';
            inputBox.value = '';
            classBox.value = '';
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        window.addEventListener('click', (e)=>{ 
            if(e.target===popup2){
                popup2.style.display = 'none';
                inputBox.value = '';
                classBox.value = '';
                document.querySelector('.d-content').classList.remove('active-popup')
                document.querySelector('.sidebar').classList.remove('active-popup')
            }
        })
    
        add_un.addEventListener("click", ()=>{
            alert("Successfully added!")
            popup2.style.display = 'none';
            inputBox.value = '';
            classBox.value = '';
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        
        const btn3 = document.querySelector('.remove_uniform');
        const popup3 = document.querySelector('.modal3')
        const close3 = document.querySelector('.close-btn3')
    
        btn3.addEventListener("click", ()=>{
            popup.classList.remove('active')
            popup3.style.display = 'block';
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close3.addEventListener("click", ()=>{
            popup3.style.display = 'none';
            inputBox.value = '';
            classBox.value = '';
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        const btn5 = document.querySelector('.add-detention');
        const popup5 = document.querySelector('.modal5')
        const close5 = document.querySelector('.close-btn5')
    
        btn5.addEventListener("click", ()=>{
            popup.classList.remove('active')
            popup5.style.display = 'block';
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close5.addEventListener("click", ()=>{
            popup5.style.display = 'none';
            inputBox.value = '';
            classBox.value = '';
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        const btn6 = document.querySelector('.remove_detention');
        const popup6 = document.querySelector('.modal6')
        const close6 = document.querySelector('.close-btn6')
    
        btn6.addEventListener("click", ()=>{
            popup.classList.remove('active')
            popup6.style.display = 'block';
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close6.addEventListener("click", ()=>{
            popup6.style.display = 'none';
            inputBox.value = '';
            classBox.value = '';
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        const btn8 = document.querySelector('.add-Sdetention');
        const popup8 = document.querySelector('.modal8')
        const close8 = document.querySelector('.close-btn8')
    
        btn8.addEventListener("click", ()=>{
            popup.classList.remove('active')
            popup8.style.display = 'block';
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close8.addEventListener("click", ()=>{
            popup8.style.display = 'none';
            inputBox.value = '';
            classBox.value = '';
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })
    
        const btn9 = document.querySelector('.remove_Sdetention');
        const popup9 = document.querySelector('.modal9')
        const close9 = document.querySelector('.close-btn9')
    
        btn9.addEventListener("click", ()=>{
            popup.classList.remove('active')
            popup9.style.display = 'block';
            document.querySelector('.d-content').classList.add('active-popup')
            document.querySelector('.sidebar').classList.add('active-popup')
        })
    
        close9.addEventListener("click", ()=>{
            popup9.style.display = 'none';
            inputBox.value = '';
            classBox.value = '';
            document.querySelector('.d-content').classList.remove('active-popup')
            document.querySelector('.sidebar').classList.remove('active-popup')
        })

    let availableStudents = []
    fetch("/students", { //Gets the student name and class of all students enrolled at NIS Senior Campus which is then passed to the autofill function
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data=>{
        for(let i = 0; i<data.name.length;i++){
            availableStudents.push([data.name[i], data.class[i]])
        }
    })
    .catch(error=> console.error(error));

    function autoFill(inputBox, resultBox, classBox){
        inputBox.onkeyup = function(){ //Function that allows for the automatic completion of the names when giving detentions.
        
        
            let result = [];
            let input = inputBox.value;
            if (input.length){
                result = availableStudents.filter((keyword)=>{
                    return keyword[0].toLowerCase().includes(input.toLowerCase()); //converts the entered words into lowercase for ease of comparison
                });        
            }
            display(result)
        };
    
        function display(result){ //formats the name to fit HTML syntax
            const content = result.map((list)=>{
                return `<li class="modal-input" data-class="${list[1]}">${list[0]}</li>`; //Adds the class to the <li> element for later retrieval
            })
            resultBox.innerHTML = "<ul>" + content + "</ul>";
        }
    
        resultBox.addEventListener('click', (event)=>{ //If a name is selected from the dropdown list, fill in the name and class fields for that respective student
            if (event.target){
                selectInput(event.target);
            }
        })
        
        function selectInput(list){
            inputBox.value = list.innerHTML;
            classBox.value = list.getAttribute('data-class'); //Retreived from the <li> element
    
            resultBox.innerHTML = '';
        }
    }


    const resultBoxU = document.querySelector('.result-boxU');
    const inputBoxU = document.getElementById('uniformName');
    const classBoxU = document.getElementById('uniformClass');

    const classBoxD = document.getElementById('detentionClass');
    const detentionBox = document.getElementById('detentionName');
    const resultBoxD = document.querySelector('.result-boxD');

    const classBoxSD = document.getElementById('SdetentionClass');
    const SdetentionBox = document.getElementById('SdetentionName');
    const resultBoxSD = document.querySelector('.result-boxSD');


    autoFill(inputBoxU, resultBoxU, classBoxU)
    autoFill(detentionBox, resultBoxD, classBoxD)
    autoFill(SdetentionBox, resultBoxSD, classBoxSD)
    

    document.getElementById("addUniform").addEventListener("submit", function(event){ //Provision of a uniform violation
        event.preventDefault();
        const uniformName = document.getElementById("uniformName").value
        const uniformClass = document.getElementById("uniformClass").value
        const authority = document.getElementById("authority").value
        fetch("/addUniform", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name:uniformName, cLass:uniformClass, authority:authority})
        })
        .then(response => response.json())

        .catch(error=> console.error(error));
        document.getElementById("uniformName").value = ''
        document.getElementById("uniformClass").value = ''
        document.getElementById("authority").value = ''

    })

    document.getElementById("removeUniform").addEventListener("submit", function(event){ //Removal of a Uniform Violation
        event.preventDefault();
        const uniformName = document.getElementById("reUniformName").value
        const uniformClass = document.getElementById("reUniformClass").value
        const date = document.getElementById("reUniformDate").value
        fetch("/removeUniform", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name:uniformName, cLass:uniformClass, date:date})
        })
        .then(response => response.json())
        .then(data=>{
            if(data.match){
                alert("Violation removed successfully!")
            }
            else{
                alert("Violation does not exist!")
            }
        })

        .catch(error=> console.error(error));
        document.getElementById("reUniformName").value = ''
        document.getElementById("reUniformClass").value = ''
        document.getElementById("reUniformDate").value = ''

    })

    document.getElementById("viewUniform").addEventListener("click", function(event){ //Viewing all uniform violation (for all viewing operations a PDF file is generated with the appropriate data)
        event.preventDefault();

        fetch("/viewUniform", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            
        })
        .then(response => response.blob())
        .then(blob=>{
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')


        })
        .catch(error=> console.error(error));
     

    })
    document.getElementById("addDetention").addEventListener("submit", function(event){ //Provision of a lunch-time detention
        event.preventDefault();
        const detentionName = document.getElementById("detentionName").value
        const detentionClass = document.getElementById("detentionClass").value
        const detentionReason = document.getElementById("detentionReason").value
        const authority = document.getElementById("dt_authority").value
        fetch("/addDetention", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name:detentionName, cLass:detentionClass, reason:detentionReason, authority:authority})
        })
        .then(response => response.json())

        .catch(error=> console.error(error));
        document.getElementById("detentionName").value = ''
        document.getElementById("detentionClass").value = ''
        document.getElementById("detentionReason").value = ''
        document.getElementById("dt_authority").value = ''
    })

    document.getElementById("removeDetention").addEventListener("submit", function(event){ //Removal of a lunch-time detention
        event.preventDefault();
        const detentionName = document.getElementById("reDtName").value
        const detentionClass = document.getElementById("reDtClass").value
        const date = document.getElementById("reDtDate").value
        fetch("/removeDetention", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name:detentionName, cLass:detentionClass, date:date})
        })
        .then(response => response.json())
        .then(data=>{
            if(data.match){
                alert("Detention removed successfully!")
            }
            else{
                alert("Detention does not exist!")
            }
        })

        .catch(error=> console.error(error));
        document.getElementById("reDtName").value = ''
        document.getElementById("reDtClass").value = ''
        document.getElementById("reDtDate").value = ''

    })

    document.getElementById("viewDetention").addEventListener("click", function(event){ //Viewing lunch-time detentions
        event.preventDefault();

        fetch("/viewDetention", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            
        })
        .then(response => response.blob())
        .then(blob=>{
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')


        })
        .catch(error=> console.error(error));
     

    })
    document.getElementById("addSDetention").addEventListener("submit", function(event){ //Provision of a Saturday Detention
        event.preventDefault();
        const sDetentionName = document.getElementById("SdetentionName").value
        const sDetentionClass = document.getElementById("SdetentionClass").value
        const sDetentionReason = document.getElementById("SdetentionReason").value
        const sAuthority = document.getElementById("Sdt_authority").value
        fetch("/addSDetention", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name:sDetentionName, cLass:sDetentionClass, reason:sDetentionReason, authority:sAuthority})
        })
        .then(response => response.json())

        .catch(error=> console.error(error));
        document.getElementById("SdetentionName").value = ''
        document.getElementById("SdetentionClass").value = ''
        document.getElementById("SdetentionReason").value = ''
        document.getElementById("Sdt_authority").value = ''
    })

    document.getElementById("removeSDetention").addEventListener("submit", function(event){ //Removal of a Saturday Detention
        event.preventDefault();
        const sDetentionName = document.getElementById("reSDtName").value
        const sDetentionClass = document.getElementById("reSDtClass").value
        const date = document.getElementById("reSDtDate").value
        fetch("/removeSDetention", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name:sDetentionName, cLass:sDetentionClass, date:date})
        })
        .then(response => response.json())
        .then(data=>{
            if(data.match){
                alert("Saturday detention removed successfully!")
            }
            else{
                alert("Saturday detention does not exist!")
            }
        })

        .catch(error=> console.error(error));
        document.getElementById("reSDtName").value = ''
        document.getElementById("reSDtClass").value = ''
        document.getElementById("reSDtDate").value = ''

    })

    document.getElementById("viewSDetention").addEventListener("click", function(event){ //Viewing all Saturday detentions
        event.preventDefault();

        fetch("/viewSDetention", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            
        })
        .then(response => response.blob())
        .then(blob=>{
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')


        })
        .catch(error=> console.error(error));
     

    })
    //End of detention provision code

})


if (window.location.pathname == "/announcement2.html"){
    //Start of announcement JS

    const sidebar = document.querySelector('.sidebar');
    const dashboard = document.getElementById('actElement')
    const announcement = document.getElementById('actElement2')
    const contentContainer = document.querySelectorAll('.assignment-container, .todo-container, .grades-container');

    sidebar.addEventListener("mouseover", ()=>{
        contentContainer.forEach(container => {
            container.style.width = 'calc(50% - 3rem)';
        });
        dashboard.classList.remove('active')
        announcement.classList.add('active')
    });

    sidebar.addEventListener("mouseout", ()=>{
        contentContainer.forEach(container => {
            container.style.width = 'calc(50% - 1rem)';
        });
        announcement.classList.remove('active')
    });
    

    const announcementParent = document.querySelector(".first-rowA")
    
    fetch('/getAnnouncement', { //Gets all the announcements from the back-end
        method: 'GET',
    })
    .then(response=>response.json())
    .then(data=>{
        data.forEach(data => { //Formatting of data recieved to then be displayed on the announcements tab
            let givenDate = data.Date
            let givenTime = data.Time
            let dateObj = new Date(givenDate);

            let userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;

            let localDateObj = new Date(dateObj.getTime() - userTimezoneOffset);

            let adjustedDateString = localDateObj.toISOString().split('T')[0];

            let dateFromDB = adjustedDateString;

            let combinedDateTimeString = `${dateFromDB}T${givenTime}`;

            let finalDate = new Date(combinedDateTimeString);

            const now = new Date()
            const difference = Math.floor((now-finalDate)/(1000*60))
            
            const announcementWrapper = document.createElement('div');
            announcementWrapper.classList.add('announcements-wrapper');

            const announcementContainer = document.createElement('div');
            announcementContainer.classList.add('announcements-containerA');

            if(data.none){
                const announcementsD = document.createElement('div');
                announcementsD.classList.add('announcements-d');
                announcementsD.textContent = "No announcements!";

                announcementWrapper.appendChild(announcementsD);
            }
            else{
                const subtitleDiv = document.createElement('div');
                subtitleDiv.classList.add('subtitle');

                const timeDiv = document.createElement('div');
                timeDiv.classList.add('time');

                const numDiv = document.createElement('div');
                numDiv.classList.add('num');
                numDiv.innerHTML = `<b>${difference}</b>`;

                const unitDiv = document.createElement('div');
                unitDiv.classList.add('unit');
                unitDiv.textContent = 'MINS';

                timeDiv.appendChild(numDiv);
                timeDiv.appendChild(unitDiv);

                const subtitleAnnouncementDiv = document.createElement('div');
                subtitleAnnouncementDiv.classList.add('subtitle-announcement');
                subtitleAnnouncementDiv.textContent = 'New Announcement!';

                subtitleDiv.appendChild(timeDiv);
                subtitleDiv.appendChild(subtitleAnnouncementDiv);

                const announcementsD = document.createElement('div');
                announcementsD.classList.add('announcements-d');
                announcementsD.textContent = `${data.Announcement}`;

                announcementWrapper.appendChild(subtitleDiv);
                announcementWrapper.appendChild(announcementsD);
                announcementContainer.appendChild(announcementWrapper)
                announcementParent.append(announcementContainer)
            }
        });

        //End of announcement code
        

})

}


if (window.location.pathname == "/admin.html"){

    function dropdownMechanism(){
        const dropdowns = document.querySelectorAll('.dropdown')

        dropdowns.forEach(dropdown=>{
            const select = dropdown.querySelector('.select')
            const caret = dropdown.querySelector('.caret')
            const menu = dropdown.querySelector('.menu')
            const options = dropdown.querySelectorAll('.menu li')
            const selected = dropdown.querySelector('.selected')

            select.addEventListener('click', ()=>{
                select.classList.add('select-clicked')
                caret.classList.add("caret-rotate")
                menu.classList.add('menu-open')
            })

            options.forEach(option =>{
                option.addEventListener('click', ()=>{
                    selected.innerHTML = option.innerHTML;
                    select.classList.remove('select-clicked')
                    caret.classList.remove('caret-rotate')
                    menu.classList.remove('menu-open')
                    options.forEach(option =>{
                        option.classList.remove('activeAdmin')
                    })
                    option.classList.add('activeAdmin')
                })
            })

            document.addEventListener('click', (e)=>{
                if(!dropdown.contains(e.target)){
                    select.classList.remove('select-clicked')
                    caret.classList.remove('caret-rotate')
                    menu.classList.remove('menu-open')
                }
            })

        })
    }

    function approveBtn(){
        document.querySelector('.accept').addEventListener('click', (e)=>{
            const item = e.target.closest('.item')
            const name = item.querySelector('h1').innerText
            const status = item.querySelector('.selected').innerText
            fetch('/postApproval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name:name, status:status})
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.match){
                    const item = e.target.closest('.item')
                    item.remove()
                    location.reload()
                }
            })
        })
    }

    function rejectBtn(){
        document.querySelector('.reject').addEventListener('click', (e)=>{
            const item = e.target.closest('.item')
            const name = item.querySelector('h1').innerText
            fetch('/rejectApproval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name:name})
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.match){
                    const item = e.target.closest('.item')
                    item.remove()
                    location.reload()
                }
            })
        })
    }

    existingName = new Set()

    fetch('/getRequests', { 
        method: 'GET',
    })
    .then(response=>response.json())
    .then(data=>{
        
        data.forEach(names =>{
            

            if(!existingName.has(names.Name)){
                existingName.add(names.Name)

                const mainDiv = document.querySelector('.DutyAdmin')

                const item = document.createElement('div')
                item.classList.add('item')

                const icon = document.createElement('div')
                icon.classList.add('icon')

                const userIcon = document.createElement('i')
                userIcon.classList.add('bx', 'bxs-user-circle')
                userIcon.setAttribute('id', 'userIcon')
                icon.appendChild(userIcon)

                item.appendChild(icon)

                const right = document.createElement('div')
                right.classList.add('right')

                const nameStatus = document.createElement('div')
                nameStatus.classList.add('name-status')

                const namePerson = document.createElement('h1')
                namePerson.innerText = names.Name
                nameStatus.appendChild(namePerson)

                const dropdown = document.createElement('div')
                dropdown.classList.add('dropdown')

                const select = document.createElement('div')
                select.classList.add('select')
                

                const span = document.createElement('span')
                span.classList.add('selected')
                span.innerText = 'Status'

                const caret = document.createElement('div')
                caret.classList.add('caret')

                select.appendChild(span)

                select.appendChild(caret)

                dropdown.appendChild(select)

                const menuUL = document.createElement('ul')
                menuUL.classList.add('menu')

                const menuItems = ['Head Boy', 'Head Girl', 'Deputy Head Boy', 'Deputy Head Girl','Co-curricular Captain', 'Environmental Captain', 'Detention Prefect', 'Prefect']

                menuItems.forEach(itemText=>{
                    const list = document.createElement('li')
                    list.innerText = itemText
                    menuUL.appendChild(list)
                })

                dropdown.appendChild(menuUL)

                nameStatus.appendChild(dropdown)

                const buttons = document.createElement('div')
                buttons.classList.add('buttons')

                const acceptButton = document.createElement('button')
                acceptButton.classList.add('accept')
                const accept = document.createElement('i')
                accept.classList.add('bx', 'bx-check')
                accept.setAttribute('id', 'acceptI')
                acceptButton.appendChild(accept)

                buttons.appendChild(acceptButton)

                const rejectButton = document.createElement('button')
                rejectButton.classList.add('reject')
                const reject = document.createElement('i')
                reject.classList.add('bx', 'bx-x')
                reject.setAttribute('id', 'rejectI')
                rejectButton.appendChild(reject)

                buttons.appendChild(rejectButton)

                right.appendChild(nameStatus)
                right.appendChild(buttons)

                item.appendChild(right)

                mainDiv.appendChild(item)
                }
            
        })
        dropdownMechanism()
        approveBtn()
        rejectBtn()


        
    })

}


if (window.location.pathname == "/prefectBody.html"){

    // function saveText(inputElement, originalClass, personName){
    //     const newText = inputElement.value

    //     const spanText = document.createElement('span')
    //     spanText.textContent = newText
    //     spanText.classList.add(originalClass)


    //     inputElement.replaceWith(spanText)

    //     fetch('/allocations', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({name:personName, subject:originalClass, text:newText})
    //     })
    // }


    // function editElements(element, button){
    //     document.addEventListener('click', (e)=>{
    //         if(e.target.classList.contains(button)){
    //             const card = e.target.closest(element)
    //             const positionText = card.querySelector('.text-container')
    //             const currentText = positionText.textContent

    //             const originalClass = card.classList[0]
                
    //             const card2 = card.closest('.card-wrapper')
    //             const nameElement = card2.querySelector('.name')
    //             const personName = nameElement ? nameElement.textContent : 'Unknown'  

            
    //             const inputElement = document.createElement('input')
    //             inputElement.type = 'text'
    //             inputElement.value = currentText
    //             inputElement.classList.add('position-input')
    
    //             positionText.replaceWith(inputElement)
    //             inputElement.focus()
    
    
    //             // inputElement.addEventListener('keydown', function(event) {
    //             //     if (event.key === 'Enter') {
    //             //         saveText(inputElement, originalClass, personName);
    //             //     }
    //             // });
    
    //         }
    //     });
    // }


    let duties = [];
    let dutyName = [];
    let nameArr = [];
    let status = [];
    let classAllocation = [];
    let formRoom = [];

    fetch('/getProfiles', { 
        method: 'GET',
    })
    .then(response=>response.json())
    .then(data=>{
        data.resultsDuty.forEach(duty =>{
            let dutyDateName = `${duty.Duty} - ${duty.DateofDuty ? duty.DateofDuty.split('T')[0] : 'No date'}`
            if(!dutyName.includes(duty.Name)){
                dutyName.push(duty.Name)
                duties.push([dutyDateName])
            }
            else{
                const index = dutyName.indexOf(duty.Name)
                duties[index].push(dutyDateName)
            }
              
        })

        data.resultsAll.forEach(prefect =>{
            if(!nameArr.includes(prefect.Name)){
                nameArr.push(prefect.Name)
                classAllocation.push(prefect.classAllocation)
                formRoom.push(prefect.Class)
                status.push(prefect.Status)
                if(!dutyName.includes(prefect.Name)){
                    duties.push([])
                }
            }
        })

        duties.reverse()

        const mainDiv2 = document.querySelector('.first-rowA');
        mainDiv2.innerHTML = '';


        for(let i=0; i<nameArr.length; i++){    

            const cardWrapper = document.createElement('div')
            cardWrapper.classList.add('card-wrapper')

            const cardHeader = document.createElement('div')
            cardHeader.classList.add('card-header')

            const icon = document.createElement('div')
            icon.classList.add('pic')

            const userIcon = document.createElement('i')
            userIcon.classList.add('bx', 'bxs-user-circle')
            userIcon.setAttribute('id', 'userIcon2')
            icon.appendChild(userIcon)

            const infoIcon = document.createElement('div')
            infoIcon.classList.add('infoIc')

            const info = document.createElement('i')
            info.classList.add('bx', 'bxs-info-circle')
            info.setAttribute('id', 'infoIcon')
            infoIcon.appendChild(info)

            const name = document.createElement('h3')
            name.classList.add('name')
            name.innerText = nameArr[i]

            
            const position = document.createElement('p')
            position.classList.add('position')
            position.innerText = status[i]

            cardHeader.appendChild(icon)
            cardHeader.appendChild(infoIcon)
            cardHeader.appendChild(name)
            cardHeader.appendChild(position)

            const cardFooter = document.createElement('div')
            cardFooter.classList.add('card-footer')

            // const numbers = document.createElement('div')
            // numbers.classList.add('numbers')

            // const  menuULP = document.createElement('ul')

            // const list = document.createElement('li')
            // list.classList.add('classA')
            // list.innerHTML = `<b>Class Allocation: </b>`
            // const spanList = document.createElement('span')
            // spanList.classList.add('text-container')
            // spanList.innerHTML = `${classAllocation[i]} `
            // const editIcon = document.createElement('i')
            // editIcon.classList.add('bx', 'bxs-edit', 'editBtn2')
            // editIcon.setAttribute('style', "cursor: pointer;")
            
            // list.appendChild(spanList)
            // list.appendChild(editIcon)

            

            // const list1 = document.createElement('li')
            // list1.classList.add('break1')
            // list1.innerHTML = `<b>Duty 1: </b>`
            // const spanList1 = document.createElement('span')
            // spanList1.classList.add('text-container')
            // spanList1.innerHTML = `${duties[i][0] || ""} `
            // const editIcon1 = document.createElement('i')
            // editIcon1.classList.add('bx', 'bxs-edit', 'editBtn3')
            // editIcon1.setAttribute('style', "cursor: pointer;")
            
            // list1.appendChild(spanList1)
            // list1.appendChild(editIcon1)

            
            // const list2 = document.createElement('li')
            // list2.classList.add('break2')
            // list2.innerHTML = `<b>Duty 2: </b>`
            // const spanList2 = document.createElement('span')
            // spanList2.classList.add('text-container')
            // spanList2.innerHTML = `${duties[i][1] || ""} `
            // const editIcon2 = document.createElement('i')
            // editIcon2.classList.add('bx', 'bxs-edit', 'editBtn4')
            // editIcon2.setAttribute('style', "cursor: pointer;")
            
            // list2.appendChild(spanList2)
            // list2.appendChild(editIcon2)
            

            // const list3 = document.createElement('li')
            // list3.classList.add('break3')
            // list3.innerHTML = `<b>Duty 3: </b>`
            // const spanList3 = document.createElement('span')
            // spanList3.classList.add('text-container')
            // spanList3.innerHTML = `${duties[i][2] || ""} `
            // const editIcon3 = document.createElement('i')
            // editIcon3.classList.add('bx', 'bxs-edit', 'editBtn5')
            // editIcon3.setAttribute('style', "cursor: pointer;")
            
            // list3.appendChild(spanList3)
            // list3.appendChild(editIcon3)

            // menuULP.appendChild(list)
            // menuULP.appendChild(list1)
            // menuULP.appendChild(list2)
            // menuULP.appendChild(list3)

            // cardFooter.appendChild(numbers)
            // cardFooter.appendChild(menuULP)

            cardWrapper.appendChild(cardHeader)
            cardWrapper.appendChild(cardFooter)

            mainDiv2.appendChild(cardWrapper)

            const popup = document.createElement('div')
            popup.classList.add('popup')

            const top_section = document.createElement('div')
            top_section.classList.add('top-section')

            const closeBtn = document.createElement('i')
            closeBtn.classList.add('bx', 'bxs-x-circle', 'closeBtn')
            top_section.appendChild(closeBtn)

            const profile = document.createElement('div')
            profile.classList.add('profile')

            const userIconPopup = document.createElement('i')
            userIconPopup.classList.add('bx', 'bxs-user-circle')
            userIconPopup.setAttribute('id', 'userIcon2') 
            profile.appendChild(userIconPopup)

            top_section.appendChild(profile)

            const infoPopup = document.createElement('div')
            infoPopup.classList.add('info')

            const namePopup = document.createElement('h1')
            namePopup.classList.add('cardName')
            namePopup.innerText =nameArr[i]

            const positionPara = document.createElement('p')

            const positionBold = document.createElement('b')
            positionBold.innerText = 'Position: '

            const positionSpan = document.createElement('span')
            positionSpan.classList.add('cardPosition')
            positionSpan.innerText = status[i]

            positionPara.appendChild(positionBold)
            positionPara.appendChild(positionSpan)

            const formPara = document.createElement('p')

            const formBold = document.createElement('b')
            formBold.innerText = 'Form room: '

            const formSpan = document.createElement('span')
            formSpan.classList.add('cardForm')
            formSpan.innerText = formRoom[i]

            formPara.appendChild(formBold)
            formPara.appendChild(formSpan)

            infoPopup.appendChild(namePopup)
            infoPopup.appendChild(positionPara)
            infoPopup.appendChild(formPara)

            top_section.appendChild(infoPopup)

            const bottom_section = document.createElement('div')
            bottom_section.classList.add('bottom-section')

            const classAllocationPopup = document.createElement('div')
            classAllocationPopup.classList.add('classALL')

            const classAllocationPara = document.createElement('h3')
            classAllocationPara.classList.add('cardAllocation')
            classAllocationPara.innerText = 'Class Allocation: '

            const classAllocationSpan = document.createElement('span')
            classAllocationSpan.classList.add('text-container')
            classAllocationSpan.innerText = classAllocation[i]

            classAllocationPara.appendChild(classAllocationSpan)
            classAllocationPopup.appendChild(classAllocationPara)

            const tempDivCA = document.createElement('div')

            const editButtonCA = document.createElement('i')
            editButtonCA.classList.add('bx', 'bxs-edit', 'editBtnClass')
            tempDivCA.appendChild(editButtonCA)

            classAllocationPopup.appendChild(tempDivCA)

            bottom_section.appendChild(classAllocationPopup)

            const dutiesPopup = document.createElement('div')
            dutiesPopup.classList.add('duties')

            const dutyHeading = document.createElement('h3')
            dutyHeading.innerText = 'Duties: '
            dutiesPopup.appendChild(dutyHeading)

            let dutiesParent = document.createElement('ul')
                dutiesParent.setAttribute('id', 'dutiesUList')

            personDuty = duties[i]

            personDuty.forEach(duty=>{
                

                let dutiesAdmin = document.createElement('li')
                dutiesAdmin.setAttribute('id', 'dutiesLi')
                
                let dutyTitle = document.createElement('span')
                dutyTitle.classList.add('text-container')
                dutyTitle.setAttribute('id', 'duties1')

                let textDuty = document.createElement('i')
                textDuty.innerText = duty

                dutyTitle.append(textDuty)
                
                let buttons = document.createElement('div')
                buttons.classList.add('buttonGrp')
                
                let edit = document.createElement('i')
                edit.classList.add('bx', 'bxs-edit', 'editBtn')
                
                let deleteBtn = document.createElement('i')
                deleteBtn.classList.add('bx', 'bx-trash', 'deleteBtn')

                let calendar = document.createElement('i')
                calendar.classList.add('bx', 'bx-calendar', 'calendar-icon')

                let datePicker = document.createElement('input')
                datePicker.setAttribute('type', 'date')
                datePicker.classList.add('date-picker')

                buttons.appendChild(edit)
                buttons.appendChild(deleteBtn)
                buttons.appendChild(calendar)
                buttons.appendChild(datePicker)

                dutiesAdmin.appendChild(dutyTitle)
                dutiesAdmin.appendChild(buttons)

                dutiesParent.appendChild(dutiesAdmin)

              
            })

            dutiesPopup.appendChild(dutiesParent)
            

            const addDutyBtn = document.createElement('i')
            addDutyBtn.classList.add('bx', 'bx-plus-circle')
            addDutyBtn.setAttribute('id', 'addDutyButton')

            dutiesPopup.appendChild(addDutyBtn)

            bottom_section.appendChild(dutiesPopup)

            // const notes = document.createElement('div')
            // notes.classList.add('notes')

            // const notesHeading = document.createElement('h3')
            // notesHeading.innerText = 'Notes: '
            // notes.appendChild(notesHeading)

            // const notesText = document.createElement('textarea')
            // notesText.setAttribute('cols', '84')
            // notesText.classList.add('notesArea')
            // notes.appendChild(notesText)

            // bottom_section.appendChild(notes)

            const popupFooter = document.createElement('div')
            popupFooter.classList.add('footer')

            const saveIcon = document.createElement('div')
            saveIcon.classList.add('saveIcon')

            const spanSave = document.createElement('span')
            spanSave.innerText = 'SAVE'
            saveIcon.appendChild(spanSave)

            const saveProfile = document.createElement('i')
            saveProfile.classList.add('bx', 'bx-save')
            saveIcon.appendChild(saveProfile)

            popupFooter.appendChild(saveIcon)

            popup.appendChild(top_section)
            popup.appendChild(bottom_section)
            popup.appendChild(popupFooter)

            document.body.appendChild(popup)

            



        }
        // editElements('li', 'editBtn2')
        // editElements('li', 'editBtn3')
        // editElements('li', 'editBtn4')
        // editElements('li', 'editBtn5')



        let infoIcons = document.querySelectorAll('.infoIc')
        let popups = document.querySelectorAll('.popup')
        

        for (let index=0; index<infoIcons.length; index++){

            infoIcons[index].addEventListener('click', function (){
                

                document.querySelector('.d-content2').classList.add('active-popup')
                document.querySelector('.sidebarAdmin').classList.add('active-popup')
                popups[index].classList.add('active-popup');

                let nameInfoCard = popups[index].querySelector('.cardName').innerText

            
                document.querySelectorAll('.closeBtn')[index].addEventListener("click", function () {
                    document.querySelector('.d-content2').classList.remove('active-popup')
                document.querySelector('.sidebarAdmin').classList.remove('active-popup')
                    popups[index].classList.remove('active-popup'); // Remove from popup
                });

                document.querySelectorAll('.editBtnClass')[index].addEventListener('click', ()=>{
                    const classAll = document.querySelector('.classALL .text-container')

                    const text = classAll.textContent.trim()

                    const inputElement = document.createElement('input')
                    inputElement.type = 'text'
                    inputElement.value = text
                    inputElement.classList.add('position-input')
        
                    classAll.replaceWith(inputElement)
                    inputElement.focus()
        
                })

                let editButtons = document.querySelectorAll('.editBtn')
                let deleteButtons = document.querySelectorAll('.deleteBtn')
                let calendarIcons = document.querySelectorAll('.calendar-icon')
                let addDutyButtons = document.querySelectorAll('#addDutyButton')
                let saveButtons = document.querySelectorAll('.saveIcon')



                editButtons.forEach(edit=>{
                    edit.addEventListener('click', (event)=>{
                        const duty = event.target.closest('li')
                        const textArea = duty.querySelector('.text-container')

                        const text = textArea.textContent.trim()

                        const inputElement = document.createElement('input')
                        inputElement.type = 'text'
                        inputElement.value = text
                        inputElement.classList.add('position-input')
            
                        textArea.replaceWith(inputElement)
                        inputElement.focus()
                    
                        
                    })

                })

                deleteButtons.forEach(deleteBtn=>{
                    deleteBtn.addEventListener('click', (event)=>{
                        let dutyItem = event.target.closest('li')
                        fetch('/removeDuty', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({duty:dutyItem.innerText.trim(), name:nameInfoCard})
                        })
                        location.reload()
                    })
                })

             
                calendarIcons.forEach(calendar=>{
                    calendar.addEventListener('click', function() {
                        const datePicker = this.nextElementSibling; 
                        if (datePicker.style.display === 'none' || datePicker.style.display === '') {
            
                            datePicker.style.display = 'block'; 
                        } else {
                            datePicker.style.display = 'none';
                        }
                    });
                })
                

                addDutyButtons.forEach(addBtn=>{
                    addBtn.addEventListener('click', ()=>{
                        let dutiesParent = document.getElementById('dutiesUList')
    
                        let dutiesAdmin = document.createElement('li')
                        dutiesAdmin.setAttribute('id', 'dutiesLi')
                        
                        let dutyTitle = document.createElement('span')
                        dutyTitle.classList.add('text-container')
                        dutyTitle.setAttribute('id', 'duties1')
    
                        let textDuty = document.createElement('i')
                        textDuty.innerText = 'Enter duty here'
    
                        dutyTitle.append(textDuty)
                        
                        let buttons = document.createElement('div')
                        buttons.classList.add('buttonGrp')
                        
                        let edit = document.createElement('i')
                        edit.classList.add('bx', 'bxs-edit', 'editBtn')
                        
                        let deleteBtn = document.createElement('i')
                        deleteBtn.classList.add('bx', 'bx-trash', 'deleteBtn')
    
                        let calendar = document.createElement('i')
                        calendar.classList.add('bx', 'bx-calendar', 'calendar-icon')
    
                        let datePicker = document.createElement('input')
                        datePicker.setAttribute('type', 'date')
                        datePicker.classList.add('date-picker')
                        datePicker.style.display = 'none'
    
                        buttons.appendChild(edit)
                        buttons.appendChild(deleteBtn)
                        buttons.appendChild(calendar)
                        buttons.appendChild(datePicker)
    
                        dutiesAdmin.appendChild(dutyTitle)
                        dutiesAdmin.appendChild(buttons)
    
                        dutiesParent.appendChild(dutiesAdmin)

                        fetch('/addDuty', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({name:nameInfoCard, duty:textDuty.innerText})
                        })
                        location.reload()                    
    
                    })
                })

                saveButtons.forEach(saveButton=>{
                    saveButton.addEventListener('click', (event)=>{
                        let classAl = popups[index].querySelector('.cardAllocation span')
                        if (classAl == null){
                            let classAlEdit = popups[index].querySelector('.cardAllocation input')
                            fetch('/ClassAllocations', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({newClass:classAlEdit.value, name:nameInfoCard})
                            })
                            location.reload()
                        }
                        let dutyDiv = popups[index].querySelectorAll('#dutiesLi')
                        
                        function normalizeString(str) {
                            return str.trim().replace(/\s+/g, ' '); // Replace multiple spaces with a single space
                        }
                        
                        dutiesCurrent = duties[index]
                        
                        newCurrent = dutiesCurrent.map(normalizeString)

                        for (let i=0; i<newCurrent.length;i++){
                            let duty = dutyDiv[i]
                            const originalText = duty.querySelector('.text-container')
                            const textContainer = duty.querySelector('.position-input')
                            const datePick = duty.querySelector('.date-picker')
                            let textOriginal = originalText ? originalText.innerText.trim() : ''
                            let textEdited = textContainer ? textContainer.value : ''
                        

                            if (textOriginal!=newCurrent[i]){
                                fetch('/newDuties', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({oldDuty:newCurrent[i], newDuty:textEdited, date:datePick? datePick.value: "No date", name: nameInfoCard})
                                })
                                location.reload()
                            }


                        }

                    })
                })
           

                

            })
        }
    })

}
