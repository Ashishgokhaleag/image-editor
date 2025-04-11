// import React, { useEffect, useState } from 'react';
// import { getAllData } from './api/druid';

// function Druid() {
//   const [rows, setRows] = useState([]);
//   const datasource = 'wikipedia'; // change to your datasource name

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const data = await getAllData(datasource);
//         setRows(data);
//       } catch (err) {
//         console.error('Error fetching data from Druid:', err);
//       }
//     }

//     fetchData();
//   }, []);

//   return (
//     <div className="App">
//       <h1>Druid CRUD App</h1>
//       <table border="1">
//         <thead>
//           <tr>
//             {rows[0] && Object.keys(rows[0]).map((key) => <th key={key}>{key}</th>)}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, idx) => (
//             <tr key={idx}>
//               {Object.values(row).map((val, j) => (
//                 <td key={j}>{val?.toString()}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Druid;

import React, { useEffect, useState } from 'react';
import { fetchWikipediaData } from './api/druid';
import './style.css';

function Druid() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWikipediaData();
        setRows(data);
      } catch (e) {
        console.error('Failed to fetch data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="App">
      <h1>📘 Wikipedia Druid Data</h1>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              {rows[0] &&
                Object.keys(rows[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val?.toString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Druid;
