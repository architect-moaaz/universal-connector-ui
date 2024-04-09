import React from 'react';
import ConnectionForm from './ConnectionForm';
import ListConnections from './ListConnections';
import ListConnectors from './ListConnectors';
import SourceConnector from './SourceConnector';
import SinkConnector from './SinkConnector';

function App() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr', gap: '100px' }}>
      <div><ConnectionForm /></div>
      <div><h1>Available Connections </h1><ListConnections /></div>
      <div><h1>Available Connector </h1><ListConnectors/></div>
     
      {/* <div><h1>Sink Connector </h1></div> */}
      {/* <div><Component3 /></div>
      <div><Component4 /></div> */}
    </div>
  );
  // return (
  //   <div>
  //     <div>
  //     <h1>Database Connection</h1>
  //   <ConnectionForm />
  //     </div>
  //     <div>
  //     <h1>All the available Connections</h1>
  //     <ListConnections/>
  //     </div>
  // </div>
  // );
}

export default App;