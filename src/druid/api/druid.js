import axios from 'axios';

const DRUID_SQL_URL = '/druid/v2/sql';

export const fetchWikipediaData = async () => {
  try {
    const response = await axios.post(
      DRUID_SQL_URL,
      { query: 'SELECT * FROM wikipedia LIMIT 100' },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching data from Druid:', err);
    throw err;
  }
};
