import { useState } from 'react';

export default function ConnectionForm() {
  const [formData, setFormData] = useState({
    userId: '',
    connector: '',
    port: '',
    host: '',
    dbUser: '',
    dbPassword: '',
    dbName: '',
    connectionName: ``,
    miniAppName: 'DemoApp',
    workSpaceName: 'Intelliflow'
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:8080/db-connection/testConnection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json()
      )
      .then((data) => {
    
        if (data.statusCode === 200) {
          const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
          popup.document.write('<p>Successfully Connected to DB</p>');
          setMessage('');
          const button = document.createElement('button');
          button.innerText = 'Save & proceed';
          button.onclick = () => {
            fetch('http://localhost:8080/db-connection/addConnection', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Origin': 'http://localhost:3000',
              },
              body: JSON.stringify(formData),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log('Success:', data);
                if (data.statusCode === 409) {
                  alert('Connection is already present..Please add another credentials');
                  // const popup1 = window.open('', 'popup', 'width=400,height=200');
                  // const message = document.createElement('p');
                  // message.innerText = 'The given connection is already present.';
                  // popup1.document.body.appendChild(message);
                  // const button1 = document.createElement('button');
                  // button1.innerText = 'Close';
                  // button1.onclick = () => {
                   
                  //   popup1.close();

                  // };
                  // popup.document.body.appendChild(button1);
                }if(data.statusCode === 200){
                  alert('Successfully saved into the db');
                  window.location.reload();
                }
                popup.close();
              })
              .catch((error) => {
                console.error('Error:', error);
                popup.close();
              });
          };
          popup.document.body.appendChild(button);
        } else if (data.statusCode === 400) {
          console.log('Failed:', data);
          setMessage('bad credentials');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h1>Connection Form</h1>
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>
    User ID:
    <input
      type="text"
      name="userId"
      value={formData.userId}
      onChange={handleInputChange}
      required
      style={{ marginLeft: '10px' }}
    />
  </label>
  <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>
    DB:
    <select
      name="connector"
      value={formData.connector}
      onChange={handleInputChange}
      required
      style={{ marginLeft: '10px' }}
    >
      <option value="">--Please choose an option--</option> // add default option
      <option value="MYSQL">MYSQL</option>
      <option value="MONGODB">MONGODB</option>
      <option value="POSTGRES">POSTGRES</option>
    </select>
  </label>
  <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>
    Port :
    <input
      type="text"
      name="port"
      value={formData.port}
      onChange={handleInputChange}
      required
      style={{ marginLeft: '10px' }}
    />
  </label>
  <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>
    Host :
    <input
      type="text"
      name="host"
      value={formData.host}
      onChange={handleInputChange}
      required
      style={{ marginLeft: '10px' }}
    />
  </label>
  <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>
    DB User :
    <input
      type="text"
      name="dbUser"
      value={formData.dbUser}
      onChange={handleInputChange}
      required
      style={{ marginLeft: '10px' }}
    />
  </label>
  <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>
    DB Password :
    <input
      type="password"
      name="dbPassword"
      value={formData.dbPassword}
      onChange={handleInputChange}
      required
      style={{ marginLeft: '10px' }}
    />
  </label>
  <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>
    DB Name :
    <input
      type="text"
      name="dbName"
      value={formData.dbName}
      onChange={handleInputChange}
      required
      style={{ marginLeft: '10px' }}
    />
  </label>
  {/* Add more input fields for the rest of the payload data */}
  <button type="submit" style={{ marginTop: '20px', backgroundColor: 'green', color: 'white', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}>Test & Add Connection</button>
  {message && <p style={{ color: 'red' }}>{message}</p>}
</form>
</div>
  );
}
