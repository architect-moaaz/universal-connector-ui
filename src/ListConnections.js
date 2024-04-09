import React, { useState, useEffect } from 'react';
import ConnectionList from './ConnectionList';

function ListConnections() {
    const [connections, setConnections] = useState([]);
    const [checkboxes, setCheckboxes] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [columnMap, setColumnMap] = useState(new Map());
    const [formData, setFormData] = useState({
        userId: '1234',
        connector: '',
        port: '',
        host: '',
        dbUser: '',
        dbPassword: '',
        dbName: '',
        connectionName: ``,
        miniAppName: 'DemoApp',
        workSpaceName: 'Intelliflow',
        connectorType: '',
        fileName: '',
        appId: '',
        workSpaceId: '',
        topicsPrefix: '',
        connectorFamily: '',
        topics: '',
        primaryKeys: '',
        tables: [],
    });

    useEffect(() => {
        fetch('http://localhost:8080/db-connection/DemoApp')
            .then(response => response.json())
            .then(data => setConnections(data));
    }, []);


    function addSource(connectionName) {
        fetch(`http://localhost:8080/connector/tables/${connectionName}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {

                const popup = window.open('', 'popup', 'width=700,height=400,left=300,top=100');

                let dropdown = document.createElement('select');
                dropdown.id = 'dropdown';
                const defaultOption = document.createElement('option');
                var br = document.createElement("br");
                defaultOption.value = '';
                defaultOption.text = 'Please select connector Family: ';
                dropdown.appendChild(defaultOption);
                // dropdown.id = 'type-dropdown';
                const cdcOption = document.createElement('option');
                cdcOption.value = 'DEBEZIUM';
                cdcOption.text = 'DEBEZIUM';
                dropdown.appendChild(cdcOption);
                const jdbcOption = document.createElement('option');
                jdbcOption.value = 'JDBC';
                jdbcOption.text = 'JDBC';
                dropdown.appendChild(jdbcOption);
                popup.document.body.appendChild(dropdown);
                dropdown.addEventListener('change', function () {
                    // get the selected value from the dropdown
                    const selectedValue = dropdown.value;

                    // perform some action based on the selected value
                    if (selectedValue === 'DEBEZIUM') {
                        dropdown.disabled = true;
                        const table = document.createElement('table');
                        table.setAttribute('name', 'Tables');

                        const selectedCheckboxes = new Map(); // Create a new map to store the selected checkboxes
                        const addedRows = new Set();
                        data.forEach(header => {
                            const buttonRow = document.createElement('tr');

                            const button = document.createElement('button');
                            button.innerText = header;
                            button.style.padding = '10px 20px';

                            button.onclick = () => {
                                // Only add the row if it hasn't been added before
                                if (!addedRows.has(header)) {
                                    addedRows.add(header);
                                    fetch('http://localhost:8080/connector/table-structure', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            tables: [header],
                                            connectionName: connectionName
                                        })
                                    })
                                        .then(response => response.json())
                                        .then((data) => {
                                            const buttonRow = button.parentNode.parentNode;
                                            const checkboxRow = document.createElement('tr');
                                            data.data[0].dataModelProperties.forEach((iter) => {
                                                const checkbox = document.createElement('input');
                                                checkbox.type = 'checkbox';
                                                checkbox.id = `${header}-${iter.name}-checkbox`;

                                                const label = document.createElement('label');
                                                label.htmlFor = checkbox.id;
                                                label.textContent = iter.name;

                                                const cell = document.createElement('td');
                                                cell.appendChild(label);
                                                cell.appendChild(checkbox);
                                                checkboxRow.appendChild(cell);

                                                checkbox.addEventListener('change', () => {
                                                    if (checkbox.checked) {
                                                        selectedCheckboxes.set(`${header}-${iter.name}`, true); // Add the selected checkbox to the map
                                                    } else {
                                                        selectedCheckboxes.delete(`${header}-${iter.name}`); // Remove the unchecked checkbox from the map
                                                    }
                                                });
                                            });
                                            table.insertBefore(checkboxRow, buttonRow.nextSibling);
                                        })
                                        .catch(error => console.error(error));
                                }
                            };

                            const buttonCell = document.createElement('td');
                            buttonCell.appendChild(button);
                            buttonRow.appendChild(buttonCell);
                            table.appendChild(buttonRow);
                        });

                        const submitButton = document.createElement('button');
                        submitButton.innerText = 'Submit';

                        const closeButton = document.createElement('button');
                        closeButton.innerText = 'Close';

                        popup.document.body.appendChild(table);

                        // const prefixNameLabel = document.createElement('label');
                        // prefixNameLabel.for = 'prefixName';
                        // prefixNameLabel.innerHTML = 'Enter Prefix Name: ';
                        // popup.document.body.appendChild(prefixNameLabel);

                        // const prefixName = document.createElement('input');
                        // prefixName.type = 'text';
                        // prefixName.id = 'prefixName';
                        // popup.document.body.appendChild(prefixName);

                        var br = document.createElement("br");
                        popup.document.body.appendChild(br);
                        popup.document.body.appendChild(submitButton);
                        popup.document.body.appendChild(closeButton);



                        submitButton.onclick = () => {
                            const groupedData = {};

                            let tableFieldArr;
                            let tables = [];

                            selectedCheckboxes.forEach((value, key) => {
                                tableFieldArr = key.split('-');
                                const table = tableFieldArr[0];
                                const field = tableFieldArr[1];
                                if (!tables.includes(table)) {
                                    tables.push(table);
                                }
                                if (!groupedData[table]) {
                                    groupedData[table] = [field];
                                } else {
                                    groupedData[table].push(field);
                                }
                            });
                            console.log('table list   = ', tables);
                            setColumnMap(selectedCheckboxes);
                            const result = Object.keys(groupedData).map((table) => ({
                                [table]: groupedData[table],
                            }));

                            setFormData({
                                ...formData,
                                connectorType: `SOURCE`, connectorFamily: `${dropdown.value}`, connectionName: `${connectionName}`, tables: tables, columns: groupedData, connector: `MYSQL`,
                            });
                            console.log('selected checkboxes = ', result); // Output the selected checkboxes
                            const selectedOption = dropdown.options[dropdown.selectedIndex].value;
                            popup.close();
                            fetch('http://localhost:8080/connector', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(formData)
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log(data);
                                    if (data.data === 200) {
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Source Connector Added</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    }else if(data.data === 500){
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Internal server error.</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    }else{
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Please try again</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    }
                                    window.location.reload();
                                })
                                .catch(error => console.error(error));


                        };
                        closeButton.onclick = () => {
                            popup.close();
                            return;
                        };

                    } else if (selectedValue === 'JDBC') {
                        dropdown.disabled = true;

                        const checkboxes = {};
                        const checkboxesContainer = document.createElement('div');
                        fetch(`http://localhost:8080/connector/tables/${connectionName}`, {
                            method: 'GET',
                            headers: {
                                'Content-type': 'application/json'
                            },
                        })
                            .then(response => response.json())
                            .then(data => {
                                const prefixNameLabel = document.createElement('label');
                                prefixNameLabel.for = 'prefixName';
                                prefixNameLabel.innerHTML = 'Please select tables you want to add : ';
                                const breakLine = document.createElement('br');
                                checkboxesContainer.appendChild(breakLine);
                                checkboxesContainer.appendChild(prefixNameLabel);
                                checkboxesContainer.appendChild(breakLine);

                                data.forEach((item) => {
                                    const checkbox = document.createElement('input');
                                    checkbox.type = 'checkbox';
                                    checkbox.name = item;
                                    checkbox.id = item;
                                    checkboxes[item.id] = false; // initialize all checkboxes to unchecked
                                    const checkboxLabel = document.createElement('label');
                                    checkboxLabel.innerHTML = item;
                                    checkboxesContainer.appendChild(checkbox);
                                    checkboxesContainer.appendChild(checkboxLabel);
                                    const br = document.createElement('br');
                                    checkboxesContainer.appendChild(br);
                                    checkbox.addEventListener('change', () => {
                                        checkboxes[item] = checkbox.checked;
                                        // printSelectedValues();
                                    });
                                });
                            })
                            .catch(error => console.error(error));

                        const prefixNameLabel = document.createElement('label');
                        prefixNameLabel.for = 'prefixName';
                        prefixNameLabel.innerHTML = 'Enter Prefix Name: ';
                        const prefixName = document.createElement('input');
                        prefixName.type = 'text';
                        prefixName.id = 'prefixName';
                        const submitButton = document.createElement('button');
                        submitButton.innerText = 'Submit';
                        const closeButton = document.createElement('button');
                        closeButton.innerText = 'Close';

                        const popupBody = popup.document.body;
                        popupBody.appendChild(checkboxesContainer);
                        popupBody.appendChild(prefixNameLabel);
                        popupBody.appendChild(prefixName);
                        popupBody.appendChild(submitButton);
                        popupBody.appendChild(closeButton);


                        submitButton.onclick = () => {
                            const selectedValues = [];
                            for (const item in checkboxes) {
                                if (checkboxes[item]) {
                                    selectedValues.push(item);
                                }
                            }
                            console.log('selected values = ', selectedValues);
                            console.log('prefix values = ', prefixName.value);
                            setFormData({
                                ...formData,
                                connectorType: `SOURCE`, connectorFamily: `${dropdown.value}`, connectionName: `${connectionName}`, tables: selectedValues, connector: `MYSQL`, topicsPrefix: prefixName.value
                            });
                            fetch('http://localhost:8080/connector', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(formData)
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log(data);
                                    if (data.data === 200) {
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Source Connector Added</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    }else if(data.data === 500){
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Internal server error.</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    }else{
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Please try again</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    }

                                })
                                .catch(error => console.error(error));
                            popup.close();
                        };
                        closeButton.onclick = () => {
                            popup.close();
                        };

                    }
                });




            });
    }

    function handleCheckboxChange(event, iter) {
        // handle checkbox change logic here
    }


    function deleteConnection(connectionName) {
        fetch(`http://localhost:8080/db-connection/${connectionName}`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                const message = document.createElement('p');
                message.innerText = 'Deleted connection';
                popup.document.body.appendChild(message);
                const button = document.createElement('button');
                button.innerText = 'Close';
                button.onclick = () => {
                    popup.close();
                    window.location.reload();

                };

                popup.document.body.appendChild(button)
            })
    }

    function addSink(connectionName) {
        const popup = window.open('', 'popup', 'width=500,height=200,left=300,top=200');
        const submitButton = document.createElement('button');
        submitButton.innerText = 'Submit';


        const dropdown = document.createElement('select');
        const defaultOption = document.createElement('option');
        var br = document.createElement("br");
        defaultOption.value = '';
        defaultOption.text = 'Please select source connector';
        dropdown.appendChild(defaultOption);
        const configMap = new Map();
        fetch('http://localhost:8080/connector/all-connectors/DemoApp')
            .then(response => response.json())
            .then(data => {
                console.log('data = ', data.data);

                data.data.forEach(config => {
                    configMap.set(config.name, config.connectorFamily);
                    if (config.connectorType === 'SOURCE') {
                        const option = document.createElement('option');
                        option.value = config.name;
                        option.text = config.name;
                        dropdown.appendChild(option);
                    }
                });
            })
            .catch(error => console.error(error));
        popup.document.body.appendChild(dropdown);
        popup.document.body.appendChild(br);
        const dropdown2 = document.createElement('select');
        const tablesLabel = document.createElement('label');
        tablesLabel.for = 'tables';
        tablesLabel.innerHTML = 'Enter Table Name You want to add in DB: ';


        const tables = document.createElement('input');
        tables.type = 'text';
        tables.id = 'tables';

        dropdown.addEventListener('change', function () {
            // get the selected value from the dropdown
            const selectedValue = dropdown.value;
            console.log(`Selected value: ${selectedValue}`);
            fetch(`http://localhost:8080/connector/topics/${selectedValue}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data.data[selectedValue]);
                    const dropdown2 = document.createElement('select');
                    const defaultOption2 = document.createElement('option');
                    defaultOption2.value = '';
                    defaultOption2.text = 'Please select topics';
                    dropdown2.appendChild(defaultOption2);

                    data.data[selectedValue]['topics'].forEach(item => {
                        const option = document.createElement('option');
                        option.value = item;
                        option.text = item;
                        dropdown2.appendChild(option);
                        popup.document.body.appendChild(br);
                    });
                    popup.document.body.appendChild(br);
                    popup.document.body.appendChild(dropdown2);
                    popup.document.body.appendChild(br);
                    popup.document.body.appendChild(tablesLabel);
                    popup.document.body.appendChild(tables);
                    popup.document.body.appendChild(submitButton);
                    submitButton.onclick = () => {
                        const topic = `${dropdown2.value}`;
                        const source = `${dropdown.value}`;
                        console.log('topic= ', topic);
                        fetch('http://localhost:8080/connector', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "userId": "wdfc",
                                "topics": topic,
                                "connectorType": "SINK",
                                "tables": [`${tables.value}`],
                                "connectorFamily": configMap.get(source),
                                "connectionName": connectionName,
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data);
                                if(data.data === 200){
                                    const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                    const message = document.createElement('p');
                                    message.innerText = 'Added sink connector.';
                                    popup.document.body.appendChild(message);
                                    const button = document.createElement('button');
                                    button.innerText = 'Close';
                                    button.onclick = () => {
                                        popup.close();
                                        window.location.reload();
                    
                                    };
                                    popup.document.body.appendChild(button)
                                }else if(data.statusCode === 409){
                                    const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                    const message = document.createElement('p');
                                    message.innerText = 'Sink connector with the same name is already present.';
                                    popup.document.body.appendChild(message);
                                    const button = document.createElement('button');
                                    button.innerText = 'Close';
                                    button.onclick = () => {
                                        popup.close();
                                        window.location.reload();
                    
                                    };
                                    popup.document.body.appendChild(button)
                                }else if(data.statusCode === 500){
                                    const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                    const message = document.createElement('p');
                                    message.innerText = 'Please try again.';
                                    popup.document.body.appendChild(message);
                                    const button = document.createElement('button');
                                    button.innerText = 'Close';
                                    button.onclick = () => {
                                        popup.close();
                                        window.location.reload();
                    
                                    };
                                    popup.document.body.appendChild(button)
                                }
                            })
                            .catch(error => console.error(error));
                        popup.close();
                    };
                })
                .catch(error => console.error(error));


        });




        // button.onclick = () => {
        //     popup.close();
        //     window.location.reload();

        // };




    }

    function updateConnection(connection) {
        const tablesLabel = document.createElement('label');
        tablesLabel.textContent = 'Tables';

        // Create a select dropdown for tables
        const tablesDropdown = document.createElement('select');
        tablesDropdown.name = 'tables';

        // Fetch API data and populate form fields
        fetch(`http://localhost:8080/db-connection/by-connection-name/${connection}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.data);
                const popup = window.open('', 'popup', 'width=200,height=350,left=500,top=100');

                const form = document.createElement('form');


                const connectionname = document.createElement('input');
                connectionname.type = 'text';
                connectionname.id = 'connectionname';
                connectionname.value = data.data.connectionName;
                const connectionnameLabel = document.createElement('label');
                connectionnameLabel.for = 'connectionname';
                connectionnameLabel.innerHTML = 'Connection Name ';
                form.appendChild(connectionnameLabel);
                form.appendChild(connectionname);

                const connector = document.createElement('select');
                connector.id = 'connector';
                const options = ["MYSQL", "MONGODB", "POSTGRES"];

                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.text = option;
                    connector.appendChild(optionElement);
                });

                connector.value = data.data.connector;

                const connectorLabel = document.createElement('label');
                connectorLabel.for = 'connector';
                connectorLabel.innerHTML = 'Connector ';

                form.appendChild(connectorLabel);
                form.appendChild(connector);

                const dbName = document.createElement('input');
                dbName.type = 'text';
                dbName.id = 'dbName';
                dbName.value = data.data.dbName;
                const dbNameLabel = document.createElement('label');
                dbNameLabel.for = 'dbName';
                dbNameLabel.innerHTML = 'dbName ';
                form.appendChild(dbNameLabel);
                form.appendChild(dbName);

                const dbUser = document.createElement('input');
                dbUser.type = 'text';
                dbUser.id = 'dbUser';
                dbUser.value = data.data.dbUser;
                const dbUserLabel = document.createElement('label');
                dbUserLabel.for = 'dbUser';
                dbUserLabel.innerHTML = 'dbUser ';
                form.appendChild(dbUserLabel);
                form.appendChild(dbUser);

                const dbPassword = document.createElement('input');
                dbPassword.type = 'password';
                dbPassword.id = 'dbPassword';
                dbPassword.value = data.data.dbPassword;
                const dbPasswordLabel = document.createElement('label');
                dbPasswordLabel.for = 'dbPassword';
                dbPasswordLabel.innerHTML = 'dbPassword ';
                form.appendChild(dbPasswordLabel);
                form.appendChild(dbPassword);

                const host = document.createElement('input');
                host.type = 'text';
                host.id = 'host';
                host.value = data.data.host;
                const hostLabel = document.createElement('label');
                hostLabel.for = 'host';
                hostLabel.innerHTML = 'Host ';
                form.appendChild(hostLabel);
                form.appendChild(host);

                const port = document.createElement('input');
                port.type = 'text';
                port.id = 'port';
                port.value = data.data.port;
                const portLabel = document.createElement('label');
                portLabel.for = 'port';
                portLabel.innerHTML = 'Port ';
                form.appendChild(portLabel);
                form.appendChild(port);

                // const miniAppName = document.createElement('input');
                // miniAppName.type = 'text';
                // miniAppName.id = 'miniAppName';
                // miniAppName.value = data.data.miniAppName;
                // const miniAppNameLabel = document.createElement('label');
                // miniAppNameLabel.for = 'miniAppName';
                // miniAppNameLabel.innerHTML = 'Mini App Name ';
                // form.appendChild(miniAppNameLabel);
                // form.appendChild(miniAppName);

                // const workSpaceName = document.createElement('input');
                // workSpaceName.required=true;
                // workSpaceName.type = 'text';
                // workSpaceName.id = 'workSpaceName';
                // workSpaceName.value = data.data.workSpaceName;
                // const workSpaceNameLabel = document.createElement('label');
                // workSpaceNameLabel.for = 'workSpaceName';
                // workSpaceNameLabel.innerHTML = 'Work Space Name ';
                // form.appendChild(workSpaceNameLabel);
                // form.appendChild(workSpaceName);

                const submitButton = document.createElement('input');
                submitButton.type = 'submit';
                submitButton.value = 'Update';
                form.appendChild(submitButton);



                popup.document.body.appendChild(form);

                submitButton.onclick = () => {

                    setFormData({
                        ...formData,
                        connectionName: `${connection}`, connector: `${connector.value}`, dbName: `${dbName.value}`, dbPassword: `${dbPassword.value}`
                        , dbUser: `${dbUser.value}`, host: `${host.value}`, port: `${port.value}`, id: `${data.data.id}`,

                    });

                    fetch('http://localhost:8080/db-connection', {
                        method: 'PUT',
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
                            console.log(data);
                            if (data.statusCode === 200) {
                                const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                popup.document.write('<p>Successfully Updated to DB</p>');
                                const button = document.createElement('button');
                                button.innerText = 'Close';
                                button.onclick = () => {
                                    popup.close();
                                };
                                popup.document.body.appendChild(button);
                            } else if (data.statusCode === 401) {
                                const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                popup.document.write('<p>Wrong credentials</p>');
                                const button = document.createElement('button');
                                button.innerText = 'Close';
                                button.onclick = () => {
                                    popup.close();
                                };
                                popup.document.body.appendChild(button);
                            } else if (data.statusCode === 204) {
                                const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                popup.document.write('<p>Please try again</p>');
                                const button = document.createElement('button');
                                button.innerText = 'Close';
                                button.onclick = () => {
                                    popup.close();
                                };
                                popup.document.body.appendChild(button);
                            }
                            // window.location.reload();
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    popup.close();

                };
            });
    }




    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'Arial' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '1px solid #ddd' }}>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Connection Name</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>DB User</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>DB Name</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Mini App Name</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Workspace Name</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {connections.map(connection => (
                        <tr key={connection.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connection.connectionName}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connection.dbUser}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connection.connector}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connection.miniAppName}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connection.workSpaceName}</td>
                            <td>
                                <button style={{ backgroundColor: '#008CBA', color: 'white', padding: '8px', borderRadius: '4px', marginRight: '4px', border: 'none' }} onClick={() => addSource(connection.connectionName)}>Use Connection as Source </button>
                                <button style={{ backgroundColor: 'black', color: 'white', padding: '8px', borderRadius: '4px', marginRight: '4px', border: 'none' }} onClick={() => addSink(connection.connectionName)}>Use Connection as Sink </button>
                                <button style={{ backgroundColor: '#f44336', color: 'white', padding: '8px', borderRadius: '4px', border: 'none' }} onClick={() => deleteConnection(connection.connectionName)}>Delete Connection</button>
                                <button style={{ backgroundColor: 'green', color: 'white', padding: '8px', borderRadius: '4px', border: 'none' }} onClick={() => updateConnection(connection.connectionName)}>Update Connection</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    return <div>{checkboxes}</div>;

}


export default ListConnections;
