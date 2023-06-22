  //EVENTS
  document.addEventListener('DOMContentLoaded', function() 
  {

      // Use buttons to toggle between views
       document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
       document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
       document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
       document.querySelector('#compose').addEventListener('click', compose_email);
       document.querySelector('#compose-form').addEventListener('submit', submit_email);
    
      // By default, load the inbox
      load_mailbox('inbox');
    });

            //RENDER COMPOSE PAGE
    function compose_email() {       
      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#emails-content').style.display = 'none';
    
      // Clear out composition fields
      document.querySelector('#compose-recipients').value = '';
      document.querySelector('#compose-subject').value = '';
      document.querySelector('#compose-body').value = '';
    }
                //END//


          //WHEN REPLY BUTTON IS TRIGGERED
    function reply_email(email){
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#emails-content').style.display = 'none';

      document.querySelector('#compose-recipients').value = email.sender;

      //regex to check if email is a reply 
      const re ='^Re';
      const regexp = new RegExp(re);
      let test = regexp.test(email.subject)
      if (!test){document.querySelector('#compose-subject').value = `Re:${email.subject}`}
      else{document.querySelector('#compose-subject').value = `${email.subject}`}

      
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    } 
                //END//


              //LOAD CONTENT OF EMAIL 
    function content_email(id){
      //display the content of email when clicked
      //do not display the view section of the email when clicked
      var view = document.querySelector('#emails-content');

      fetch(`/emails/${id}`)
      .then(response=> response.json())
      .then(email =>{
      
       document.querySelector('#emails-view').style.display ='none';
       document.querySelector('#compose-view').style.display = 'none';
       document.querySelector('#emails-content').style.display ='block';
        
       document.querySelector('#emails-content').innerHTML =
        `   
        <ul class="list-group">
          <li class="list-group-item"><strong>From: </strong>${email.sender}</li>
          <li class="list-group-item"><strong>To: </strong> ${email.recipients}</li>
          <li class="list-group-item"><strong>Subject: </strong>${email.subject}</li>
          <li class="list-group-item"><strong>Timestamp: </strong>${email.timestamp}</li>
        </ul>
        <hr>
       <p> ${email.body}</p>
        `

       //Change to read
        if (!email.read){
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        }
          //Container for buttons
          const button_container = document.createElement('div')
          button_container.id = 'button_container';

        //Archive button
        const archive_button = document.createElement('button');
        archive_button.innerHTML = email.archived ? 'Unarchive' : 'Archive';
        archive_button.className = "btn btn-secondary";
        archive_button.addEventListener('click', function(){
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: !email.archived
              })
            })
          load_mailbox('inbox')
        } );   

          //Reply button
        const reply_button = document.createElement('button');
        reply_button.innerHTML = 'Reply';
        reply_button.className = "btn btn-success";

        reply_button.addEventListener('click', function(){reply_email(email)});
        
        //Append the buttons to the end of the container
        document.querySelector('#emails-content').append(button_container);

        document.querySelector('#button_container').appendChild(archive_button);    
        document.querySelector('#button_container').appendChild(reply_button);    

      
      })
   };     
                  //END//


          //LOAD MAILBOX: SEND INBOX & ARCHIVE
     function load_mailbox(mailbox) {     
    //   // Show the mailbox and hide other views
       document.querySelector('#emails-view').style.display = 'block';
       document.querySelector('#compose-view').style.display = 'none';
       document.querySelector('#emails-content').style.display ='none';
       var view = document.querySelector('#emails-view');
       view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
       
    //   // Show the mailbox name
      fetch(`/emails/${mailbox}`)
      .then(response => response.json())
      .then(emails =>
      {          
          //Looping through each email
           emails.forEach(email => {  
  
          //Create a div for each email
           const element =  document.createElement('div');
           element.id ='email-content';
           element.className ='list-group-item';
  
           element.innerHTML =
            `   
              <h6> From: ${email.sender}</h6>
              <h5>Subject: ${email.subject}</h5>
              <p> ${email.timestamp}</p>
          `
  
          element.addEventListener('click',function(){content_email(email.id)});
          element.className = email.read ?'list-group-item read':'list-group-item unread';

           view.append(element);  
          } )   
           
      })       
     } 
                           //END//


            //SUBMIT EMAIL WHEN COMPOSED 
    function submit_email(event){
      event.preventDefault();
     
      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body =document.querySelector('#compose-body').value;
  
       fetch('/emails',{
        method:'POST',
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
    
        })
      })
      .then(response => response.json())
      .then (emails=> {
        load_mailbox('sent');
      })
  }
        //END//
