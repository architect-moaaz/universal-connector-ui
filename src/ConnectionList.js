// import React, { useState } from 'react';

// function ConnectionList({ connectionName }) {
//   const [data, setData] = useState([]);

//   const handleFetch = () => {
//     fetch(`http://localhost:8080/connector/tables/test123`)
//       .then(response => response.json())
//       .then(data => setData(data))
//       .catch(error => console.error(error));
//   };

//   return (
//     <div>
//       <button onClick={handleFetch}>Fetch Data</button>
//       <ul>
//         {data.map((item, index) => (
//           <li key={index}>{item}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default ConnectionList;