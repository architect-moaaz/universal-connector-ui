import React, { useState, useEffect } from 'react';

function ListConnectors() {
    const [connectors, setConnectors] = useState([]);
    const [checkboxes, setCheckboxes] = useState([]);
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
        fetch('http://localhost:8080/connector/all-connectors/DemoApp')
            .then(response => response.json())
            .then(data => {
                console.log('data here = ', data.data);
                setConnectors(data.data)
            });
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
                                    } else if (data.data === 500) {
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Internal server error.</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    } else {
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
                                    } else if (data.data === 500) {
                                        const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                                        popup.document.write('<p>Internal server error.</p>');
                                        const button = document.createElement('button');
                                        button.innerText = 'Close';
                                        button.onclick = () => {
                                            popup.close();
                                        };
                                        popup.document.body.appendChild(button);
                                    } else {
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

    function resumeConnector(connectionName) {
        fetch(`http://localhost:8080/connector/resume/${connectionName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ /* request body */ })
        })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    // handle error response
                }
            })
            .catch(error => {
                // handle network error
            });
    }


    function deleteConnector(connectionName) {
        fetch(`http://localhost:8080/connector/${connectionName}`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.statusCode === 200) {
                    const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                    const message = document.createElement('p');
                    message.innerText = 'Deleted connector';
                    popup.document.body.appendChild(message);
                    const button = document.createElement('button');
                    button.innerText = 'Close';
                    button.onclick = () => {
                        popup.close();
                        window.location.reload();

                    };
                    popup.document.body.appendChild(button)
                } else if (data.statusCode === 400) {
                    const popup = window.open('', 'popup', 'width=400,height=200,left=200,top=200');
                    const message = document.createElement('p');
                    message.innerText = 'Re balance is in progress please try again.';
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
    }

    function pauseConnector(connectionName) {
        fetch(`http://localhost:8080/connector/pause/${connectionName}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ /* request body */ })
          })
          .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
              // handle error response
            }
          })
          .catch(error => {
            // handle network error
          });
    }




    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'Arial' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '1px solid #ddd' }}>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Connector Name</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Connector Type </th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>DataBase</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Connector Family</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Status</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>ON/OFF</th>
                        <th style={{ fontWeight: 'bold', padding: '12px', textAlign: 'left', color: '#333' }}>Actions</th>

                    </tr>
                </thead>
                {connectors && connectors.length > 0 && (
                <tbody>
                    {connectors.map(connector => (
                        <tr key={connector.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connector.name}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connector.connectorType}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connector.connector}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connector.connectorFamily}</td>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#333' }}>{connector.status}</td>
                            <td>
                                {connector.status === 'RUNNING' ? (
                                    <button style={{ backgroundColor: 'blue', color: 'white', padding: '8px', borderRadius: '4px', marginRight: '4px', border: 'none' }} onClick={() => pauseConnector(connector.name)}>Pause</button>
                                ) : (
                                    <button style={{ backgroundColor: 'purple', color: 'white', padding: '8px', borderRadius: '4px', marginRight: '4px', border: 'none' }} onClick={() => resumeConnector(connector.name)}>Resume</button>
                                )}
                            </td>
                            <td>
                                <button style={{ backgroundColor: 'red', color: 'white', padding: '8px', borderRadius: '4px', marginRight: '4px', border: 'none' }} onClick={() => deleteConnector(connector.name)}>Delete Connector </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                )}
            </table>
        </div>
    );
    return <div>{checkboxes}</div>;

}


export default ListConnectors;
